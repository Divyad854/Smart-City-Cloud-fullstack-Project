import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";

const ISSUE_ICONS = { accident: "🚗", fire: "🔥", flood: "🌊", pothole: "🕳️", garbage: "🗑️", streetlight: "💡", waterleakage: "💧", other: "⚠️" };

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/complaints/my/${user.username}`).then(r => {
      setComplaints(r.data.complaints || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user.username]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    inProgress: complaints.filter(c => ["in_progress","assigned","under_review"].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  const recent = complaints.slice(0, 5);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <h2>Welcome, {user.name}! 👋</h2>
          <Link to="/citizen/report" className="btn btn-primary">+ Report Incident</Link>
        </div>
        <div className="page-content">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">📋</span>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⏳</span>
              <div className="stat-value" style={{color:"#d69e2e"}}>{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🔄</span>
              <div className="stat-value" style={{color:"#3182ce"}}>{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-value" style={{color:"#38a169"}}>{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Quick Actions</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/citizen/report" className="btn btn-primary">📝 Report New Issue</Link>
              <Link to="/citizen/complaints" className="btn btn-outline">📋 View All Complaints</Link>
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Complaints</h3>
              <Link to="/citizen/complaints" style={{ fontSize: 13, color: "#3182ce" }}>View all →</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#718096" }}>Loading...</div>
            ) : recent.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No complaints yet</h3>
                <p>Report your first city issue</p>
                <Link to="/citizen/report" className="btn btn-primary" style={{ marginTop: 16 }}>Report Now</Link>
              </div>
            ) : (
              recent.map(c => (
                <Link to={`/citizen/complaint/${c.complaintId}`} key={c.complaintId} style={{ textDecoration: "none" }}>
                  <div className="complaint-card">
                    <div className="complaint-header">
                      <div>
                        <div className="complaint-title">
                          {ISSUE_ICONS[c.issueType] || "⚠️"} {c.issueType?.replace(/_/g, " ").toUpperCase()}
                        </div>
                        <div className="complaint-location">📍 {c.location}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                        <span className={`badge badge-${c.status}`}>{c.status?.replace(/_/g, " ")}</span>
                        <span className={`badge badge-${c.severity}`}>{c.severity}</span>
                      </div>
                    </div>
                    <div className="complaint-desc">{c.description?.slice(0, 100)}{c.description?.length > 100 ? "..." : ""}</div>
                    <div className="complaint-footer">
                      <span style={{ fontSize: 12, color: "#718096" }}>🕐 {new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                      {c.imageUrl && <span style={{ fontSize: 12, color: "#3182ce" }}>📷 Photo attached</span>}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
