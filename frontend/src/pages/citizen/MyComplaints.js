import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";

const ICONS = { accident:"🚗",fire:"🔥",flood:"🌊",pothole:"🕳️",garbage:"🗑️",streetlight:"💡",waterleakage:"💧",other:"⚠️" };

export default function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/complaints/my/${user.username}`)
      .then((r) => setComplaints(r.data.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.username]);

  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <h2>📋 My Complaints</h2>
          <Link to="/citizen/report" className="btn btn-primary">+ New Report</Link>
        </div>
        <div className="page-content">
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {["all", "pending", "under_review", "assigned", "in_progress", "resolved"].map((s) => (
              <button key={s} className={`btn ${filter === s ? "btn-primary" : "btn-outline"}`} style={{ fontSize: 13, padding: "6px 14px" }} onClick={() => setFilter(s)}>
                {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                <span style={{ marginLeft: 6, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                  {s === "all" ? complaints.length : complaints.filter((c) => c.status === s).length}
                </span>
              </button>
            ))}
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#718096" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No complaints found</h3>
              <p>{filter === "all" ? "You haven't reported any issues yet." : `No ${filter.replace(/_/g, " ")} complaints.`}</p>
              {filter === "all" && <Link to="/citizen/report" className="btn btn-primary" style={{ marginTop: 16 }}>Report Now</Link>}
            </div>
          ) : (
            filtered.map((c) => (
              <Link to={`/citizen/complaint/${c.complaintId}`} key={c.complaintId} style={{ textDecoration: "none" }}>
                <div className="complaint-card">
                  <div className="complaint-header">
                    <div>
                      <div className="complaint-title">{ICONS[c.issueType] || "⚠️"} {c.issueType?.replace(/_/g, " ").toUpperCase()}</div>
                      <div className="complaint-location">📍 {c.location}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <span className={`badge badge-${c.status}`}>{c.status?.replace(/_/g, " ")}</span>
                      <span className={`badge badge-${c.severity}`}>{c.severity}</span>
                    </div>
                  </div>
                  <div className="complaint-desc">{c.description?.slice(0, 120)}{c.description?.length > 120 ? "..." : ""}</div>
                  <div className="complaint-footer">
                    <span style={{ fontSize: 12, color: "#718096" }}>🕐 {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {c.assignedTeam && <span style={{ fontSize: 12, color: "#3182ce" }}>👷 {c.assignedTeam}</span>}
                    {c.imageUrl && <span style={{ fontSize: 12, color: "#718096" }}>📷 Photo</span>}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
