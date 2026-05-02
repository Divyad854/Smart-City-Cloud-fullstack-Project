import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
export default function ServiceComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
const { user } = useAuth();

useEffect(() => {

  if(!user) return;

  API.get(`/complaints/assigned/${encodeURIComponent(user.team)}`)
  .then((r) => {

    const data = r.data.complaints || [];
    setComplaints(data);

  })
  .catch(()=>{})
  .finally(()=>setLoading(false));

}, [user]);

  const filtered = filter === "active"
    ? complaints.filter(c => !["resolved","rejected"].includes(c.status))
    : filter === "resolved"
    ? complaints.filter(c => c.status === "resolved")
    : complaints;
console.log("USER DATA:", user);
console.log("TEAM:", user?.team);
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <h2>📋 Assigned Tasks ({filtered.length})</h2>
        </div>
        <div className="page-content">
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["active","Active Tasks"],["resolved","Completed"],["all","All"]].map(([val,label]) => (
              <button key={val} className={`btn ${filter === val ? "btn-success" : "btn-outline"}`} style={{ fontSize: 13, padding: "6px 16px" }} onClick={() => setFilter(val)}>
                {label}
                <span style={{ marginLeft: 6, background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                  {val === "active" ? complaints.filter(c => !["resolved","rejected"].includes(c.status)).length
                   : val === "resolved" ? complaints.filter(c => c.status === "resolved").length
                   : complaints.length}
                </span>
              </button>
            ))}
          </div>

          {loading ? <div style={{ textAlign: "center", padding: 60 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">📭</div><h3>No tasks found</h3></div>
          : filtered.map((c) => (
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
                <div className="complaint-desc">{c.description?.slice(0,100)}{c.description?.length > 100 ? "..." : ""}</div>
                <div className="complaint-footer">
                  <span style={{ fontSize: 12, color: "#718096" }}>📅 {new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                  {c.assignedTeam && <span style={{ fontSize: 12, color: "#38a169", fontWeight: 600 }}>👷 {c.assignedTeam}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
