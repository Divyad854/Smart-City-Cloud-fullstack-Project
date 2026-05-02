const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ===========================
   MIDDLEWARE
=========================== */

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ===========================
   ROUTES
=========================== */

// Authentication routes
app.use("/api/auth", require("./routes/auth"));

// Complaint routes
app.use("/api/complaints", require("./routes/complaints"));

// Admin management routes
app.use("/api/teams", require("./routes/teams"));
app.use("/api/issue-types", require("./routes/issueTypes"));

// Service member creation (Cognito integration)
app.use("/api/admin/service-users", require("./routes/serviceUsers"));

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Smart City API running",
    timestamp: new Date().toISOString()
  });
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`✅ Smart City Backend running on port ${PORT}`);
});