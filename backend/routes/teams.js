const express = require("express");
const router = express.Router();
const dynamo = require("../utils/dynamodb");

const TABLE = "teams";


/* ===============================
   GET ALL TEAMS
================================ */

router.get("/", async (req, res) => {

  try {

    const data = await dynamo.scan({
      TableName: TABLE
    }).promise();

    const teams = (data.Items || []).map(t => t.name);

    res.json({ teams });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Failed to load teams" });

  }

});


/* ===============================
   ADD TEAM
================================ */

router.post("/admin/team", async (req, res) => {

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Team name required" });
  }

  try {

    await dynamo.put({
      TableName: TABLE,
      Item: {
        name: name
      }
    }).promise();

    res.json({ message: "Team added" });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Failed to add team" });

  }

});


/* ===============================
   DELETE TEAM
================================ */

router.delete("/admin/team/:name", async (req, res) => {

  try {

    await dynamo.delete({
      TableName: TABLE,
      Key: {
        name: req.params.name
      }
    }).promise();

    res.json({ message: "Team removed" });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Delete failed" });

  }

});

module.exports = router;