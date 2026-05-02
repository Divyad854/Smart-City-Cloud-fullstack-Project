import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";

const STATUSES = ["pending", "under_review", "assigned", "in_progress", "resolved", "rejected"];

export default function AdminComplaintDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    status: "",
    assignedTeam: "",
    note: ""
  });

  /* =========================
     LOAD COMPLAINT
  ========================= */

  const loadComplaint = () => {

    API.get(`/complaints/${id}`)
      .then((r) => {

        const c = r.data.complaint;

        setComplaint(c);

        setForm({
          status: c.status,
          assignedTeam: c.assignedTeam || "",
          note: ""
        });

      })
      .catch(() => navigate("/admin/complaints"))
      .finally(() => setLoading(false));

  };

  /* =========================
     LOAD TEAMS FROM API
  ========================= */

  const loadTeams = () => {

    API.get("/teams")
      .then((r) => setTeams(r.data.teams || []))
      .catch(() => setTeams([]));

  };

  useEffect(() => {

    loadComplaint();
    loadTeams();

  }, [id]);

  /* =========================
     UPDATE COMPLAINT
  ========================= */

  const update = async (e) => {

    e.preventDefault();

    setUpdating(true);

    try {

      await API.put(`/complaints/${id}/status`, {
        ...form,
        assignedTo: "admin"
      });

      toast.success("Complaint updated successfully!");

      loadComplaint();

    } catch (err) {

      toast.error(err.response?.data?.message || "Update failed");

    } finally {

      setUpdating(false);

    }

  };

  /* =========================
     LOADING STATE
  ========================= */

  if (loading)
    return (
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <div className="loading-screen">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );

  if (!complaint) return null;

  return (

    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <div className="top-bar">

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            <button
              className="btn btn-outline"
              style={{ fontSize: 13 }}
              onClick={() => navigate("/admin/complaints")}
            >
              ← Back
            </button>

            <h2>Manage Complaint</h2>

          </div>

          <span
            className={`badge badge-${complaint.severity}`}
            style={{ fontSize: 14, padding: "6px 16px" }}
          >
            {complaint.severity} severity
          </span>

        </div>

        <div className="page-content">

          <div className="grid-2">

            {/* LEFT SIDE */}

            <div>

              {/* Complaint Info */}

              <div className="card" style={{ marginBottom: 16 }}>

                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                  Complaint Info
                </h3>

                <table style={{ width: "100%" }}>

                  <tbody>

                    {[
                      ["Complaint ID", <span style={{ fontFamily: "monospace", fontSize: 12 }}>{complaint.complaintId}</span>],
                      ["Issue Type", complaint.issueType?.replace(/_/g, " ").toUpperCase()],
                      ["Location", complaint.location],
                      ["Reporter", `${complaint.userName} (${complaint.username})`],
                      ["Email", complaint.userEmail],
                      ["Status", <span className={`badge badge-${complaint.status}`}>{complaint.status?.replace(/_/g, " ")}</span>],
                      ["Severity", <span className={`badge badge-${complaint.severity}`}>{complaint.severity}</span>],
                      ["Assigned Team", complaint.assignedTeam || "—"],
                      ["Reported On", new Date(complaint.createdAt).toLocaleString("en-IN")]
                    ].map(([label, value]) => (

                      <tr key={label}>

                        <td style={{ padding: "8px 0", fontSize: 13, color: "#718096", fontWeight: 600, width: 140 }}>
                          {label}
                        </td>

                        <td style={{ padding: "8px 0", fontSize: 13, color: "#1a202c" }}>
                          {value}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* Description */}

              <div className="card" style={{ marginBottom: 16 }}>

                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                  Description
                </h3>

                <p style={{ fontSize: 14, color: "#4a5568", lineHeight: 1.6 }}>
                  {complaint.description}
                </p>

              </div>

              {/* Image */}

              {complaint.imageUrl && (

                <div className="card" style={{ marginBottom: 16 }}>

                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                    Photo Evidence
                  </h3>

                  <img
                    src={complaint.imageUrl}
                    alt="incident"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      maxHeight: 280,
                      objectFit: "cover"
                    }}
                  />

                  <a
                    href={complaint.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ marginTop: 8, fontSize: 13 }}
                  >
                    View Full Image
                  </a>

                </div>

              )}

              {/* AI Analysis */}

              {complaint.aiAnalysis && (

                <div className="card">

                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                    🤖 AI Analysis (Rekognition)
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>

                    {complaint.aiAnalysis.labels?.map((l) => (

                      <span
                        key={l.name}
                        style={{
                          background: "#ebf8ff",
                          color: "#1e40af",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        {l.name} — {l.confidence}%
                      </span>

                    ))}

                  </div>

                </div>

              )}

            </div>


            {/* RIGHT SIDE */}

            <div>

              {/* Admin Actions */}

              <div className="card" style={{ marginBottom: 16, border: "2px solid #3182ce" }}>

                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#3182ce" }}>
                  ⚙️ Admin Actions
                </h3>

                <form onSubmit={update}>

                  <div className="form-group">

                    <label>Update Status</label>

                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >

                      {STATUSES.map((s) => (

                        <option key={s} value={s}>
                          {s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </option>

                      ))}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>Assign Service Team</label>

                    <select
                      value={form.assignedTeam}
                      onChange={(e) => setForm({ ...form, assignedTeam: e.target.value })}
                    >

                      <option value="">— Select Team —</option>

                      {teams.map((t) => (

                        <option key={t} value={t}>
                          {t}
                        </option>

                      ))}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>Note / Remarks</label>

                    <textarea
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="Add a note about this update..."
                      rows={3}
                      style={{ resize: "vertical" }}
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={updating}
                  >

                    {updating ? "Updating..." : "✅ Update Complaint"}

                  </button>

                </form>

              </div>

              {/* Timeline */}

              <div className="card">

                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                  Status Timeline
                </h3>

                <ul className="timeline">

                  {[...(complaint.statusHistory || [])].reverse().map((h, i) => (

                    <li key={i} className="timeline-item">

                      <div
                        className="timeline-dot"
                        style={{
                          background:
                            h.status === "resolved"
                              ? "#38a169"
                              : h.status === "rejected"
                              ? "#e53e3e"
                              : "#3182ce"
                        }}
                      >
                        {h.status === "resolved" ? "✓" : h.status === "rejected" ? "✕" : "●"}
                      </div>

                      <div className="time">
                        {new Date(h.timestamp).toLocaleString("en-IN")}
                      </div>

                      <div className="tl-status">
                        {h.status?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </div>

                      <div className="tl-note">{h.note}</div>

                      {h.updatedBy && (
                        <div style={{ fontSize: 12, color: "#a0aec0" }}>
                          by {h.updatedBy}
                        </div>
                      )}

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