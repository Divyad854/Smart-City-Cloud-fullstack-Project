const express = require("express");
const router = express.Router();

const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  ListUsersCommand,
  AdminDeleteUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;





/* =========================
   GET SERVICE MEMBERS
========================= */
router.get("/", async (req, res) => {
  try {

    const result = await client.send(
      new ListUsersCommand({
        UserPoolId: USER_POOL_ID
      })
    )

    const users = (result.Users || []).map(u => {

      const attrs = {}
      u.Attributes.forEach(a => {
        attrs[a.Name] = a.Value
      })

      return {
        id: u.Username,
        username: u.Username,
        email: attrs.email || "",
        role: attrs["custom:role"] || "",
        team: attrs["custom:team"] || ""
      }

    })

    // Only show service team
    const serviceUsers = users.filter(
      u => u.role === "service_team"
    )

    res.json({ users: serviceUsers })

  } catch (err) {

    console.log("LIST USER ERROR", err)

    res.status(500).json({ users: [] })

  }
})




/* =========================
   CREATE SERVICE MEMBER
========================= */
router.post("/", async (req, res) => {

  try {

    const { username, email, password, team } = req.body;

    // ✅ DEBUG (VERY IMPORTANT)
    console.log("🔥 TEAM RECEIVED:", team);

    // ✅ VALIDATION (IMPORTANT FIX)
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!team) {
      return res.status(400).json({ message: "Team is required" }); // ✅ FIX
    }

    await client.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
        { Name: "name", Value: username },
        { Name: "custom:role", Value: "service_team" },
        { Name: "custom:team", Value: team } // ✅ now guaranteed not empty
      ],
      MessageAction: "SUPPRESS"
    }));

    await client.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: password,
      Permanent: true
    }));

    res.json({ message: "Service member created" });

  } catch (err) {

    console.error("Create user error:", err);

    res.status(500).json({ message: "Create failed" });

  }

});



/* =========================
   DELETE SERVICE MEMBER
========================= */

router.delete("/:id", async (req, res) => {

  try {

    await client.send(new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: req.params.id
    }));

    res.json({ message: "User deleted" });

  } catch (err) {

    console.error("Delete error:", err);

    res.status(500).json({ message: "Delete failed" });

  }

});

module.exports = router;