const express = require("express");
const router = express.Router();

const {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  ListUsersCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const { cognitoClient } = require("../config/aws");

const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const USER_POOL_ID = process.env.USER_POOL_ID;

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { username, email, password, role, fullName, phone } = req.body;

  if (!username || !email || !password || !role || !fullName) {
    return res.status(400).json({ message: "All fields required" });
  }

  const allowedRoles = ["citizen", "admin", "service_team"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: username, // ✅ FIXED (NOT email)
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: fullName },
        { Name: "custom:role", Value: role },
        { Name: "phone_number", Value: phone || "" },
      ],
    });

    await cognitoClient.send(command);

    res.status(200).json({
      message: "Registration successful. Check email for verification code.",
      username,
    });
} catch (err) {
  console.error("Register error:", err);

  if (err.name === "UsernameExistsException") {
    return res.status(200).json({
      message: "User already exists. Please verify your email.",
      alreadyExists: true,
      username: req.body.username
    });
  }

  res.status(400).json({ message: err.message || "Registration failed" });
}
});

// ================= CONFIRM =================
router.post("/confirm", async (req, res) => {
  const { username, code } = req.body;

  try {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);

    res.status(200).json({ message: "Account verified successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message || "Confirmation failed" });
  }
});

// ================= RESEND CODE =================
router.post("/resend-code", async (req, res) => {
  const { username } = req.body;

  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: username,
    });

    await cognitoClient.send(command);

    res.status(200).json({ message: "Verification code resent" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ================= LOGIN (EMAIL BASED) =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required" });
  }

  try {
    // 🔍 Find username using email
    const findUser = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `email = "${email}"`,
      })
    );

    if (!findUser.Users || findUser.Users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = findUser.Users[0].Username;

    // 🔐 Login using username
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const result = await cognitoClient.send(command);
    const tokens = result.AuthenticationResult;

    // Get user data
    const userCommand = new GetUserCommand({
      AccessToken: tokens.AccessToken,
    });

    const userData = await cognitoClient.send(userCommand);

    const attrs = {};
    userData.UserAttributes.forEach((a) => {
      attrs[a.Name] = a.Value;
    });

    res.status(200).json({
      message: "Login successful",
      accessToken: tokens.AccessToken,
      idToken: tokens.IdToken,
      refreshToken: tokens.RefreshToken,
      user: {
        username: userData.Username,
        email: attrs.email,
        name: attrs.name,
        role: attrs["custom:role"] || "citizen",
        team: attrs["custom:team"] || "",
        phone: attrs.phone_number,
      },
    });
  } catch (err) {
  console.error("Login error:", err);

  if (err.name === "UserNotConfirmedException") {
    return res.status(400).json({
      message: "Please verify your email before login"
    });
  }

  res.status(400).json({ message: err.message || "Login failed" });
}
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const findUser = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `email = "${email}"`,
      })
    );

    if (!findUser.Users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = findUser.Users[0].Username;

    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: username,
    });

    await cognitoClient.send(command);

    res.status(200).json({ message: "Password reset code sent to email" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const findUser = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `email = "${email}"`,
      })
    );

    if (!findUser.Users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = findUser.Users[0].Username;

    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;