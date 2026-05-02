const express = require("express");
const router = express.Router();

const { dynamoDB } = require("../config/aws");

const {
  PutCommand,
  ScanCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const TABLE = "issue_types";


/* =========================
GET ALL ISSUE TYPES
========================= */

router.get("/", async (req, res) => {

  try {

    const data = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE
      })
    );

    const issueTypes = (data.Items || []).map(i => i.name);

    res.json({ issueTypes });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch issue types"
    });

  }

});


/* =========================
ADD ISSUE TYPE
========================= */

router.post("/", async (req, res) => {

  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name required" });
    }

    const formatted = name
      .toLowerCase()
      .replace(/\s+/g, "_");

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE,
        Item: {
          name: formatted
        }
      })
    );

    res.json({
      message: "Issue type added"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to add issue type"
    });

  }

});


/* =========================
DELETE ISSUE TYPE
========================= */

router.delete("/:name", async (req, res) => {

  try {

    const { name } = req.params;

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE,
        Key: {
          name
        }
      })
    );

    res.json({
      message: "Deleted"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Delete failed"
    });

  }

});

module.exports = router;