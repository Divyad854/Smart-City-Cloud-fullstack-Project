import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConfirmEmail from "./pages/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword";

// Citizen
import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportIncident from "./pages/citizen/ReportIncident";
import MyComplaints from "./pages/citizen/MyComplaints";
import ComplaintDetail from "./pages/citizen/ComplaintDetail";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminComplaints from "./pages/admin/Complaints";
import AdminComplaintDetail from "./pages/admin/ComplaintDetail";
import AdminStats from "./pages/admin/Stats";

// NEW ADMIN PAGES
import ServiceMembers from "./pages/admin/ServiceMembers";
import CreateServiceMember from "./pages/admin/CreateServiceMember";
import Teams from "./pages/admin/Teams";
import IssueTypes from "./pages/admin/IssueTypes";

// Service Team
import ServiceDashboard from "./pages/service/Dashboard";
import ServiceComplaints from "./pages/service/Complaints";
import ServiceComplaintDetail from "./pages/service/ComplaintDetail";

const ProtectedRoute = ({ children, allowedRoles }) => {
const { user, loading } = useAuth();

if (loading)
return ( <div className="loading-screen"> <div className="spinner"></div> <p>Loading...</p> </div>
);

if (!user) return <Navigate to="/login" replace />;

if (allowedRoles && !allowedRoles.includes(user.role)) {
if (user.role === "admin") return <Navigate to="/admin" replace />;
if (user.role === "service_team") return <Navigate to="/service" replace />;
return <Navigate to="/citizen" replace />;
}

return children;
};

const PublicRoute = ({ children }) => {
const { user, loading } = useAuth();

if (loading)
return ( <div className="loading-screen"> <div className="spinner"></div> <p>Loading...</p> </div>
);

if (user) {
if (user.role === "admin") return <Navigate to="/admin" replace />;
if (user.role === "service_team") return <Navigate to="/service" replace />;
return <Navigate to="/citizen" replace />;
}

return children;
};

function AppRoutes() {
return ( <Routes>

```
  {/* Public */}
  <Route path="/" element={<Navigate to="/login" replace />} />
  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
  <Route path="/confirm-email" element={<PublicRoute><ConfirmEmail /></PublicRoute>} />
  <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

  {/* Citizen */}
  <Route path="/citizen" element={<ProtectedRoute allowedRoles={["citizen"]}><CitizenDashboard /></ProtectedRoute>} />
  <Route path="/citizen/report" element={<ProtectedRoute allowedRoles={["citizen"]}><ReportIncident /></ProtectedRoute>} />
  <Route path="/citizen/complaints" element={<ProtectedRoute allowedRoles={["citizen"]}><MyComplaints /></ProtectedRoute>} />
  <Route path="/citizen/complaint/:id" element={<ProtectedRoute allowedRoles={["citizen"]}><ComplaintDetail /></ProtectedRoute>} />

  {/* Admin */}
  <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
  <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={["admin"]}><AdminComplaints /></ProtectedRoute>} />
  <Route path="/admin/complaint/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AdminComplaintDetail /></ProtectedRoute>} />
  <Route path="/admin/stats" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStats /></ProtectedRoute>} />

  {/* NEW ADMIN MANAGEMENT ROUTES */}
  <Route path="/admin/service-members" element={<ProtectedRoute allowedRoles={["admin"]}><ServiceMembers /></ProtectedRoute>} />
  <Route path="/admin/create-service-member" element={<ProtectedRoute allowedRoles={["admin"]}><CreateServiceMember /></ProtectedRoute>} />
  <Route path="/admin/teams" element={<ProtectedRoute allowedRoles={["admin"]}><Teams /></ProtectedRoute>} />
  <Route path="/admin/issue-types" element={<ProtectedRoute allowedRoles={["admin"]}><IssueTypes /></ProtectedRoute>} />

  {/* Service Team */}
  <Route path="/service" element={<ProtectedRoute allowedRoles={["service_team"]}><ServiceDashboard /></ProtectedRoute>} />
  <Route path="/service/complaints" element={<ProtectedRoute allowedRoles={["service_team"]}><ServiceComplaints /></ProtectedRoute>} />
  <Route path="/service/complaint/:id" element={<ProtectedRoute allowedRoles={["service_team"]}><ServiceComplaintDetail /></ProtectedRoute>} />

  <Route path="*" element={<Navigate to="/login" replace />} />

</Routes>


);
}

export default function App() {
return ( <AuthProvider> <Router> <AppRoutes /> <ToastContainer position="top-right" autoClose={3000} /> </Router> </AuthProvider>
);
}
