import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";

const COLORS = ["#e53e3e","#d69e2e","#38a169","#3182ce","#805ad5","#dd6b20","#0bc5ea","#ed64a6"];

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/complaints/stats/summary"), API.get("/complaints/all")])
      .then(([s, a]) => { setStats(s.data); setComplaints(a.data.complaints || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const severityData = stats ? [
    { name: "High", value: stats.high, fill: "#e53e3e" },
    { name: "Medium", value: stats.medium, fill: "#d69e2e" },
    { name: "Low", value: stats.low || (stats.total - stats.high - stats.medium), fill: "#38a169" },
  ] : [];

  const typeData = stats?.byType ? Object.entries(stats.byType).map(([name, value], i) => ({ name: name.replace(/_/g," "), value, fill: COLORS[i % COLORS.length] })) : [];

  const statusData = stats ? [
    { name: "Pending", value: stats.pending, fill: "#d69e2e" },
    { name: "In Progress", value: stats.inProgress, fill: "#3182ce" },
    { name: "Resolved", value: stats.resolved, fill: "#38a169" },
  ] : [];

  // Group complaints by date (last 7 days)
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const count = complaints.filter((c) => new Date(c.createdAt).toDateString() === d.toDateString()).length;
    last7.push({ date: label, complaints: count });
  }

  if (loading) return <div className="layout"><Sidebar /><div className="main-content"><div className="loading-screen"><div className="spinner" /></div></div></div>;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar"><h2>📈 Analytics & Reports</h2></div>
        <div className="page-content">
          <div className="stats-grid">
            {[
              { icon: "📋", value: stats?.total, label: "Total Complaints", color: "#1a202c" },
              { icon: "⏳", value: stats?.pending, label: "Pending", color: "#d69e2e" },
              { icon: "🔄", value: stats?.inProgress, label: "In Progress", color: "#3182ce" },
              { icon: "✅", value: stats?.resolved, label: "Resolved", color: "#38a169" },
              { icon: "🔴", value: stats?.high, label: "High Severity", color: "#e53e3e" },
              { icon: "📊", value: stats?.total ? Math.round((stats.resolved/stats.total)*100) + "%" : "0%", label: "Resolution Rate", color: "#805ad5" },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Line chart - last 7 days */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Complaints — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#3182ce" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>By Severity</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {severityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>By Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>By Issue Type</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={typeData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {typeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
