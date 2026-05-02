import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";

const STATUS_STEPS = ["pending", "under_review", "assigned", "in_progress", "resolved"];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
   if(!complaint){
      navigate("/citizen")
   }
}, [navigate, complaint])

  if (loading) return <div className="layout"><Sidebar /><div className="main-content"><div className="loading-screen"><div className="spinner" /></div></div></div>;
  if (!complaint) return null;

  const stepIndex = STATUS_STEPS.indexOf(complaint.status);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => navigate("/citizen/complaints")}>← Back</button>
            <h2>Complaint Details</h2>
          </div>
          <span className={`badge badge-${complaint.status}`} style={{ fontSize: 14, padding: "6px 14px" }}>{complaint.status?.replace(/_/g, " ")}</span>
        </div>
        <div className="page-content">
          {/* Progress Bar */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Complaint Progress</h3>
            <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
              {STATUS_STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: i <= stepIndex ? (complaint.status === "resolved" ? "#38a169" : "#3182ce") : "#e2e8f0",
                      color: i <= stepIndex ? "white" : "#a0aec0", fontWeight: 700, fontSize: 14
                    }}>
                      {i < stepIndex ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 11, marginTop: 6, color: i <= stepIndex ? "#1a202c" : "#a0aec0", textAlign: "center" }}>
                      {s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 3, background: i < stepIndex ? "#3182ce" : "#e2e8f0", marginBottom: 20 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Incident Information</h3>
                <table style={{ width: "100%" }}>
                  <tbody>
                    {[
                      ["ID", complaint.complaintId?.slice(0, 8) + "..."],
                      ["Issue Type", complaint.issueType?.replace(/_/g, " ").toUpperCase()],
                      ["Location", complaint.location],
                      ["Severity", <span className={`badge badge-${complaint.severity}`}>{complaint.severity}</span>],
                      ["Reported On", new Date(complaint.createdAt).toLocaleString("en-IN")],
                      ["Assigned To", complaint.assignedTeam || "Not yet assigned"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ padding: "8px 0", fontSize: 13, color: "#718096", fontWeight: 600, width: 130 }}>{label}</td>
                        <td style={{ padding: "8px 0", fontSize: 13, color: "#1a202c" }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Description</h3>
                <p style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.6 }}>{complaint.description}</p>
              </div>

              {complaint.imageUrl && (
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Photo Evidence</h3>
                  <img src={complaint.imageUrl} alt="incident" style={{ width: "100%", borderRadius: 8, maxHeight: 300, objectFit: "cover" }} />
                </div>
              )}
            </div>

            <div>
              {complaint.aiAnalysis && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🤖 AI Analysis</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {complaint.aiAnalysis.labels?.map((l) => (
                      <span key={l.name} style={{ background: "#ebf8ff", color: "#1e40af", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                        {l.name} ({l.confidence}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Status Timeline</h3>
                <ul className="timeline">
                  {(complaint.statusHistory || []).map((h, i) => (
                    <li key={i} className="timeline-item">
                      <div className={`timeline-dot`} style={{ background: h.status === "resolved" ? "#38a169" : "#3182ce" }}>✓</div>
                      <div className="time">{new Date(h.timestamp).toLocaleString("en-IN")}</div>
                      <div className="tl-status">{h.status?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="tl-note">{h.note}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
