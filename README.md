# 🏙️ Smart City Real-Time Incident & Complaint Monitoring Platform

## 📁 Project Structure
```
smart-city/
├── backend/
│   ├── config/aws.js        ← AWS SDK clients
│   ├── routes/auth.js       ← Cognito auth APIs
│   ├── routes/complaints.js ← Complaint CRUD + AI
│   ├── server.js            ← Express server
│   ├── .env                 ← Fill YOUR AWS values here
│   └── package.json
├── frontend/
│   └── src/
│       ├── pages/citizen/   ← Citizen Dashboard
│       ├── pages/admin/     ← Admin Dashboard
│       ├── pages/service/   ← Service Team Dashboard
│       ├── pages/Login.js, Register.js etc.
│       └── App.js           ← Routes + Role-based redirect
├── lambda/index.mjs         ← Paste this in AWS Lambda
├── START-WINDOWS.bat        ← Windows: double-click to run
└── start.sh                 ← Mac/Linux: bash start.sh
```

---

## ✅ REMAINING AWS STEPS (4 steps only)

### STEP 1 — Add Custom Attribute in Cognito
1. AWS Console → Cognito → `smart-city-users`
2. Sign-in experience → Custom attributes → **Add custom attributes**
3. Name: `role`, Type: String, Min: 1, Max: 50, Mutable: Yes
4. Save changes

### STEP 2 — Enable Password Auth in App Client
1. Cognito → `smart-city-users` → App clients → `smart-city-web` → Edit
2. Enable: `ALLOW_USER_PASSWORD_AUTH` + `ALLOW_REFRESH_TOKEN_AUTH`
3. Save changes
4. **Copy the Client ID** → paste into `backend/.env` → `COGNITO_CLIENT_ID`

### STEP 3 — Create DynamoDB Table
1. DynamoDB → Create table
2. Name: `complaints`, Partition key: `complaintId` (String)
3. Capacity: On-demand → Create table

### STEP 4 — Give Lambda IAM Permissions
1. Lambda → `incidentProcessor` → Configuration → Permissions → click role link
2. Attach policies: `AmazonRekognitionFullAccess`, `AmazonDynamoDBFullAccess`,
   `AmazonS3ReadOnlyAccess`, `AmazonSQSFullAccess`, `AmazonSNSFullAccess`

### STEP 5 — Update Lambda Code
1. Lambda → `incidentProcessor` → Code tab → open `index.mjs`
2. Select all → delete → paste contents of `lambda/index.mjs` → Deploy

### STEP 6 — SNS Email Subscription
1. SNS → `cityEmergencyAlerts` → Create subscription
2. Protocol: Email → your email → Create → Confirm in inbox

### STEP 7 — S3 CORS (fix image upload)
1. S3 → `smart-city-incident-images` → Permissions → CORS → Edit → paste:
```json
[{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT","POST","DELETE"],"AllowedOrigins":["*"],"ExposeHeaders":[]}]
```

---

## 🔑 Fill backend/.env

Open `backend/.env` — only 2 values need to be filled:
- `AWS_ACCESS_KEY_ID` — from your IAM CSV file
- `AWS_SECRET_ACCESS_KEY` — from your IAM CSV file
- `COGNITO_CLIENT_ID` — from Cognito App Client page

Everything else is pre-filled from your AWS setup!

---

## 🚀 Run the Project

### Windows — double-click `START-WINDOWS.bat`

### Manual:
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

Open: **http://localhost:3000**

---

## 👤 Roles & Dashboards

| Role | Auto-redirects to | Features |
|------|-------------------|----------|
| citizen | /citizen | Report, track, view AI results |
| admin | /admin | Manage all, assign teams, analytics |
| service_team | /service | View tasks, update work status |

Select role during **Register** — automatic redirect after login, no AWS config needed.

---

## ❓ Troubleshooting

- **Login fails** → Register first, confirm email, then login
- **Image upload fails** → Add S3 CORS config (Step 7 above)
- **Cognito error** → Make sure custom:role attribute added + auth flow enabled
- **Lambda error** → Check IAM permissions in Step 4
