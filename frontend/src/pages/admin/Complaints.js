import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const load = () => {
    API.get("/complaints/all").then((r) => setComplaints(r.data.complaints || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = complaints.filter((c) => {
    const matchStatus = filter === "all" || c.status === filter;
    const matchSev = severityFilter === "all" || c.severity === severityFilter;
    const matchSearch = !search || c.location?.toLowerCase().includes(search.toLowerCase()) || c.issueType?.toLowerCase().includes(search.toLowerCase()) || c.userName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSev && matchSearch;
  });

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <h2>📋 All Complaints ({filtered.length})</h2>
          <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={load}>🔄 Refresh</button>
        </div>
        <div className="page-content">
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search by location, type, or reporter..." style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14 }} />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14 }}>
                <option value="all">All Status</option>
                {["pending","under_review","assigned","in_progress","resolved","rejected"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>
                ))}
              </select>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14 }}>
                <option value="all">All Severity</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {loading ? <div style={{ textAlign: "center", padding: 60 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">📭</div><h3>No complaints found</h3></div>
          : (
            <div className="card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Issue Type</th><th>Location</th><th>Reporter</th>
                      <th>Severity</th><th>Status</th><th>Date</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.complaintId}>
                        <td style={{ fontFamily: "monospace", fontSize: 12, color: "#718096" }}>{c.complaintId?.slice(0,8)}</td>
                        <td style={{ fontWeight: 600, textTransform: "capitalize" }}>{c.issueType?.replace(/_/g," ")}</td>
                        <td style={{ fontSize: 13, color: "#718096", maxWidth: 160 }}>{c.location}</td>
                        <td style={{ fontSize: 13 }}>{c.userName || c.username}</td>
                        <td><span className={`badge badge-${c.severity}`}>{c.severity}</span></td>
                        <td><span className={`badge badge-${c.status}`}>{c.status?.replace(/_/g," ")}</span></td>
                        <td style={{ fontSize: 12, color: "#718096" }}>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                        <td><Link to={`/admin/complaint/${c.complaintId}`} className="btn btn-primary" style={{ fontSize: 12, padding: "5px 12px" }}>Manage</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
