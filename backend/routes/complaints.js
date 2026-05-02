const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { PutCommand, GetCommand, ScanCommand, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { DetectLabelsCommand } = require("@aws-sdk/client-rekognition");
const { PublishCommand } = require("@aws-sdk/client-sns");
const { SendMessageCommand } = require("@aws-sdk/client-sqs");
const multer = require("multer");
const { dynamoDB, s3Client, rekognitionClient, snsClient, sqsClient } = require("../config/aws");

const TABLE = process.env.DYNAMODB_TABLE || "complaints";
const BUCKET = process.env.S3_BUCKET_NAME;
const SNS_ARN = process.env.SNS_TOPIC_ARN;
const SQS_URL = process.env.SQS_QUEUE_URL;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Submit complaint with image
router.post("/report", upload.single("image"), async (req, res) => {
  try {
    const { issueType, description, location, latitude, longitude, username, userEmail, userName } = req.body;
    const complaintId = uuidv4();
    const timestamp = new Date().toISOString();
    let imageUrl = null;
    let aiAnalysis = null;
    let severity = "medium";

    // Upload image to S3
    if (req.file) {
      const s3Key = `incidents/${complaintId}/${req.file.originalname}`;
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));
      imageUrl = `https://${BUCKET}.s3.ap-south-1.amazonaws.com/${s3Key}`;

      // Rekognition AI analysis
      try {
        const rekResult = await rekognitionClient.send(new DetectLabelsCommand({
          Image: { S3Object: { Bucket: BUCKET, Name: s3Key } },
          MaxLabels: 10,
          MinConfidence: 70,
        }));
        const labels = rekResult.Labels.map((l) => ({ name: l.Name, confidence: Math.round(l.Confidence) }));
        aiAnalysis = { labels, detectedAt: timestamp };

        // Determine severity from AI labels
        const highSeverityKeywords = ["Fire", "Accident", "Flood", "Explosion", "Weapon", "Violence", "Blood"];
        const detected = labels.map((l) => l.name);
        if (detected.some((d) => highSeverityKeywords.includes(d))) severity = "high";
        else if (issueType === "accident" || issueType === "fire") severity = "high";
      } catch (rekErr) {
        console.log("Rekognition skipped:", rekErr.message);
      }
    }

    // Set severity based on issue type if not set by AI
    if (severity === "medium") {
      if (["fire", "accident", "flood"].includes(issueType)) severity = "high";
      else if (["pothole", "garbage"].includes(issueType)) severity = "low";
    }

    const complaint = {
      complaintId,
      issueType,
      description,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      username,
      userEmail,
      userName,
      status: "pending",
      severity,
      imageUrl,
      aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
      assignedTo: null,
      assignedTeam: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      statusHistory: JSON.stringify([{ status: "pending", timestamp, note: "Complaint submitted" }]),
    };

    // Save to DynamoDB
    await dynamoDB.send(new PutCommand({ TableName: TABLE, Item: complaint }));

    // Send to SQS
    try {
      await sqsClient.send(new SendMessageCommand({
        QueueUrl: SQS_URL,
        MessageBody: JSON.stringify({ complaintId, issueType, severity, location }),
      }));
    } catch (sqsErr) {
      console.log("SQS skipped:", sqsErr.message);
    }

    // Send SNS alert if high severity
    if (severity === "high") {
      try {
        await snsClient.send(new PublishCommand({
          TopicArn: SNS_ARN,
          Subject: `🚨 Emergency Alert: ${issueType.toUpperCase()} detected`,
          Message: `Emergency incident reported!\n\nType: ${issueType}\nLocation: ${location}\nSeverity: HIGH\nComplaint ID: ${complaintId}\nReported by: ${userName}\nDescription: ${description}\n\nImmediate action required!`,
        }));
      } catch (snsErr) {
        console.log("SNS skipped:", snsErr.message);
      }
    }

    res.status(201).json({ message: "Complaint submitted successfully", complaintId, severity, aiAnalysis });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: err.message || "Failed to submit complaint" });
  }
});

// Get all complaints (admin)
router.get("/all", async (req, res) => {
  try {
    const result = await dynamoDB.send(new ScanCommand({ TableName: TABLE }));
    const items = result.Items.map(parseComplaint);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ complaints: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get complaints by user
router.get("/my/:username", async (req, res) => {
  try {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: "username = :u",
      ExpressionAttributeValues: { ":u": req.params.username },
    }));
    const items = result.Items.map(parseComplaint);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ complaints: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get complaints assigned to service team
router.get("/assigned/:team", async (req, res) => {

  const team = decodeURIComponent(req.params.team);

  const result = await dynamoDB.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: "assignedTeam = :t",
    ExpressionAttributeValues: {
      ":t": team
    }
  }));

  res.json({ complaints: result.Items || [] });

});

// Get single complaint
router.get("/:complaintId", async (req, res) => {
  try {
    const result = await dynamoDB.send(new GetCommand({
      TableName: TABLE,
      Key: { complaintId: req.params.complaintId },
    }));
    if (!result.Item) return res.status(404).json({ message: "Complaint not found" });
    res.json({ complaint: parseComplaint(result.Item) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status (admin/service team)
router.put("/:complaintId/status", async (req, res) => {
  try {
    const { status, note, assignedTo, assignedTeam } = req.body;
    const timestamp = new Date().toISOString();

    const existing = await dynamoDB.send(new GetCommand({
      TableName: TABLE,
      Key: { complaintId: req.params.complaintId },
    }));
    if (!existing.Item) return res.status(404).json({ message: "Complaint not found" });

    const history = JSON.parse(existing.Item.statusHistory || "[]");
    history.push({ status, timestamp, note: note || `Status updated to ${status}`, updatedBy: assignedTo });

    const updateExpr = ["#s = :s", "updatedAt = :t", "statusHistory = :h"];
    const exprNames = { "#s": "status" };
    const exprValues = { ":s": status, ":t": timestamp, ":h": JSON.stringify(history) };

    if (assignedTo) { updateExpr.push("assignedTo = :at"); exprValues[":at"] = assignedTo; }
    if (assignedTeam) { updateExpr.push("assignedTeam = :ateam"); exprValues[":ateam"] = assignedTeam; }

    await dynamoDB.send(new UpdateCommand({
      TableName: TABLE,
      Key: { complaintId: req.params.complaintId },
      UpdateExpression: "SET " + updateExpr.join(", "),
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: exprValues,
    }));

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dashboard stats
router.get("/stats/summary", async (req, res) => {
  try {
    const result = await dynamoDB.send(new ScanCommand({ TableName: TABLE }));
    const items = result.Items;
    const stats = {
      total: items.length,
      pending: items.filter((i) => i.status === "pending").length,
      inProgress: items.filter((i) => i.status === "in_progress").length,
      resolved: items.filter((i) => i.status === "resolved").length,
      high: items.filter((i) => i.severity === "high").length,
      medium: items.filter((i) => i.severity === "medium").length,
      low: items.filter((i) => i.severity === "low").length,
      byType: {},
    };
    items.forEach((i) => {
      stats.byType[i.issueType] = (stats.byType[i.issueType] || 0) + 1;
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function parseComplaint(item) {
  return {
    ...item,
    aiAnalysis: item.aiAnalysis ? JSON.parse(item.aiAnalysis) : null,
    statusHistory: item.statusHistory ? JSON.parse(item.statusHistory) : [],
  };
}

module.exports = router;
