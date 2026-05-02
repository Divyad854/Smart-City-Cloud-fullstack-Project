import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";

export default function ServiceDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {

  if (!user) return;

  console.log("🔥 USER IN useEffect:", user);
  console.log("🔥 TEAM IN useEffect:", user?.team);

  API.get(`/complaints/assigned/${encodeURIComponent(user.team)}`)
    .then((r) => {
      console.log("🔥 API RESPONSE:", r.data);   // ✅ ADD THIS
      setComplaints(r.data.complaints || []);
    })
    .catch((err) => {
      console.log("❌ API ERROR:", err);        // ✅ ADD THIS
    })
    .finally(() => setLoading(false));

}, [user]);
  const stats = {
    total: complaints.length,
    assigned: complaints.filter(c => c.status === "assigned").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };
console.log("USER DATA:", user);
console.log("TEAM:", user?.team);
  const urgent = complaints.filter(c => c.severity === "high" && c.status !== "resolved").slice(0, 3);
  const recent = complaints.filter(c => c.status !== "resolved").slice(0, 5);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <h2>🔧 Service Team Dashboard</h2>
          <Link to="/service/complaints" className="btn btn-success">View All Tasks</Link>
        </div>
        <div className="page-content">
          {loading ? <div style={{ textAlign: "center", padding: 80 }}><div className="spinner" style={{ margin: "0 auto" }} /></div> : (
            <>
              <div className="stats-grid">
                {[
                  { icon: "📋", value: stats.total, label: "Total Assigned", color: "#1a202c" },
                  { icon: "🎯", value: stats.assigned, label: "Newly Assigned", color: "#805ad5" },
                  { icon: "🔄", value: stats.inProgress, label: "In Progress", color: "#3182ce" },
                  { icon: "✅", value: stats.resolved, label: "Completed", color: "#38a169" },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <span className="stat-icon">{s.icon}</span>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {urgent.length > 0 && (
                <div className="card" style={{ marginBottom: 20, border: "2px solid #e53e3e" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#e53e3e" }}>🚨 Urgent — High Severity</h3>
                  {urgent.map((c) => (
                    <Link to={`/service/complaint/${c.complaintId}`} key={c.complaintId} style={{ textDecoration: "none" }}>
                      <div className="complaint-card" style={{ borderColor: "#fc8181", marginBottom: 8 }}>
                        <div className="complaint-header">
                          <div>
                            <div className="complaint-title">{c.issueType?.replace(/_/g," ").toUpperCase()}</div>
                            <div className="complaint-location">📍 {c.location}</div>
                          </div>
                          <span className={`badge badge-${c.status}`}>{c.status?.replace(/_/g," ")}</span>
                        </div>
                        <div className="complaint-desc">{c.description?.slice(0,100)}...</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Active Tasks</h3>
                  <Link to="/service/complaints" style={{ fontSize: 13, color: "#38a169" }}>View all →</Link>
                </div>
                {recent.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">✅</div><h3>All tasks completed!</h3></div>
                ) : recent.map((c) => (
                  <Link to={`/service/complaint/${c.complaintId}`} key={c.complaintId} style={{ textDecoration: "none" }}>
                    <div className="complaint-card">
                      <div className="complaint-header">
                        <div>
                          <div className="complaint-title">{c.issueType?.replace(/_/g," ").toUpperCase()}</div>
                          <div className="complaint-location">📍 {c.location}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexDirection: "column", alignItems: "flex-end" }}>
                          <span className={`badge badge-${c.status}`}>{c.status?.replace(/_/g," ")}</span>
                          <span className={`badge badge-${c.severity}`}>{c.severity}</span>
                        </div>
                      </div>
                      <div className="complaint-footer">
                        <span style={{ fontSize: 12, color: "#718096" }}>📅 {new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                        {c.assignedTeam && <span style={{ fontSize: 12, color: "#38a169" }}>👷 {c.assignedTeam}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
