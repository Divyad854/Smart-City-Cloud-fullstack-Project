import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";

const COLORS = ["#3182ce", "#38a169", "#d69e2e", "#e53e3e", "#805ad5", "#dd6b20"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/complaints/stats/summary"),
      API.get("/complaints/all"),
    ]).then(([statsRes, allRes]) => {
      setStats(statsRes.data);
      setRecent((allRes.data.complaints || []).slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: "Pending", value: stats.pending },
    { name: "In Progress", value: stats.inProgress },
    { name: "Resolved", value: stats.resolved },
  ] : [];

  const barData = stats?.byType ? Object.entries(stats.byType).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })) : [];

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <h2>📊 Admin Dashboard</h2>
          <Link to="/admin/complaints" className="btn btn-primary">View All Complaints</Link>
        </div>
        <div className="page-content">
          {loading ? <div style={{ textAlign: "center", padding: 80 }}><div className="spinner" style={{ margin: "0 auto" }} /></div> : (
            <>
              <div className="stats-grid">
                {[
                  { icon: "📋", value: stats?.total || 0, label: "Total Complaints", color: "#1a202c" },
                  { icon: "⏳", value: stats?.pending || 0, label: "Pending", color: "#d69e2e" },
                  { icon: "🔄", value: stats?.inProgress || 0, label: "In Progress", color: "#3182ce" },
                  { icon: "✅", value: stats?.resolved || 0, label: "Resolved", color: "#38a169" },
                  { icon: "🔴", value: stats?.high || 0, label: "High Severity", color: "#e53e3e" },
                  { icon: "🟡", value: stats?.medium || 0, label: "Medium Severity", color: "#d69e2e" },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <span className="stat-icon">{s.icon}</span>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Complaints by Type</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3182ce" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Complaints</h3>
                  <Link to="/admin/complaints" style={{ fontSize: 13, color: "#3182ce" }}>View all →</Link>
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>ID</th><th>Type</th><th>Location</th><th>Reported By</th><th>Severity</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {recent.map((c) => (
                        <tr key={c.complaintId}>
                          <td style={{ fontFamily: "monospace", fontSize: 12, color: "#718096" }}>{c.complaintId?.slice(0, 8)}</td>
                          <td style={{ fontWeight: 600 }}>{c.issueType?.replace(/_/g, " ")}</td>
                          <td style={{ fontSize: 13, color: "#718096" }}>{c.location}</td>
                          <td style={{ fontSize: 13 }}>{c.userName || c.username}</td>
                          <td><span className={`badge badge-${c.severity}`}>{c.severity}</span></td>
                          <td><span className={`badge badge-${c.status}`}>{c.status?.replace(/_/g, " ")}</span></td>
                          <td><Link to={`/admin/complaint/${c.complaintId}`} className="btn btn-outline" style={{ fontSize: 12, padding: "4px 10px" }}>Manage</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
