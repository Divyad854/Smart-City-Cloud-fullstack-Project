// =====================================================
// AWS Lambda Function: incidentProcessor
// Paste this code in Lambda Console > Code tab
// File: index.mjs   Runtime: Node.js 18
// =====================================================

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { ComprehendClient, DetectSentimentCommand, DetectKeyPhrasesCommand } from "@aws-sdk/client-comprehend";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const REGION = "ap-south-1";
const TABLE = "complaints";
const SNS_ARN = "arn:aws:sns:ap-south-1:024202239156:cityEmergencyAlerts";
const SQS_URL = "https://sqs.ap-south-1.amazonaws.com/024202239156/incidentProcessingQueue";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const rekognition = new RekognitionClient({ region: REGION });
const comprehend = new ComprehendClient({ region: REGION });
const sns = new SNSClient({ region: REGION });
const sqs = new SQSClient({ region: REGION });

export const handler = async (event) => {
  console.log("Smart City Incident Processor Started");
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Triggered by S3 upload
    if (event.Records?.[0]?.eventSource === "aws:s3") {
      const record = event.Records[0];
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
      console.log(`Processing S3 upload: s3://${bucket}/${key}`);

      // Run Rekognition
      let labels = [];
      try {
        const rekResult = await rekognition.send(new DetectLabelsCommand({
          Image: { S3Object: { Bucket: bucket, Name: key } },
          MaxLabels: 10,
          MinConfidence: 70,
        }));
        labels = rekResult.Labels.map(l => ({ name: l.Name, confidence: Math.round(l.Confidence) }));
        console.log("Rekognition labels:", labels);
      } catch (err) {
        console.error("Rekognition error:", err.message);
      }

      // Determine incident severity from AI labels
      const highSeverity = ["Fire", "Accident", "Flood", "Explosion", "Vehicle", "Car", "Smoke"];
      const detectedNames = labels.map(l => l.name);
      const isHighSeverity = detectedNames.some(n => highSeverity.includes(n));

      // Send SNS alert for high severity
      if (isHighSeverity) {
        const detectedTypes = detectedNames.filter(n => highSeverity.includes(n)).join(", ");
        await sns.send(new PublishCommand({
          TopicArn: SNS_ARN,
          Subject: `🚨 Emergency: ${detectedTypes} detected via AI`,
          Message: `AI has detected a high-severity incident.\n\nDetected: ${detectedTypes}\nImage: s3://${bucket}/${key}\nAll Labels: ${JSON.stringify(labels)}\n\nImmediate response required.`,
        }));
        console.log("SNS alert sent for high severity incident");
      }

      // Send to SQS queue
      await sqs.send(new SendMessageCommand({
        QueueUrl: SQS_URL,
        MessageBody: JSON.stringify({
          bucket, key, labels, severity: isHighSeverity ? "high" : "medium",
          processedAt: new Date().toISOString(),
        }),
      }));
      console.log("Message sent to SQS queue");

      return { statusCode: 200, body: JSON.stringify({ message: "Incident processed", labels, isHighSeverity }) };
    }

    // Direct invocation (test)
    console.log("Direct invocation - Lambda is healthy");
    return { statusCode: 200, body: JSON.stringify({ message: "Smart City Lambda running successfully", timestamp: new Date().toISOString() }) };

  } catch (err) {
    console.error("Lambda error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
