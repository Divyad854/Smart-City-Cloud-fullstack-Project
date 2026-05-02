import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";

const SERVICE_STATUSES = ["assigned", "in_progress", "resolved"];

export default function ServiceComplaintDetail() {

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  /* =========================
     LOAD COMPLAINT
  ========================= */

  const load = async () => {

    try {

      const r = await API.get(`/complaints/${id}`);

      const data = r.data.complaint;

      setComplaint(data);
      setStatus(data.status);

    } catch (err) {

      toast.error("Complaint not found");
      navigate("/service/complaints");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    load();

  }, [id]);

  /* =========================
     UPDATE STATUS
  ========================= */

  const update = async (e) => {

    e.preventDefault();

    if (!note.trim()) {
      return toast.error("Please add a note about the update");
    }

    setUpdating(true);

    try {

      await API.put(`/complaints/${id}/status`, {
        status,
        note,
        assignedTo: user?.name || user?.username
      });

      toast.success("Task updated successfully");

      load();

    } catch (err) {

      toast.error(err.response?.data?.message || "Update failed");

    } finally {

      setUpdating(false);

    }

  };

  /* =========================
     LOADING SCREEN
  ========================= */

  if (loading) {

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

  }

  if (!complaint) return null;

  /* =========================
     PAGE UI
  ========================= */

  return (

    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <div className="top-bar">

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            <button
              className="btn btn-outline"
              style={{ fontSize: 13 }}
              onClick={() => navigate("/service/complaints")}
            >
              ← Back
            </button>

            <h2>Task Details</h2>

          </div>

          <span
            className={`badge badge-${complaint.status}`}
            style={{ fontSize: 14, padding: "6px 16px" }}
          >
            {complaint.status?.replace(/_/g, " ")}
          </span>

        </div>

        <div className="page-content">

          <div className="grid-2">

            {/* LEFT SIDE */}

            <div>

              <div className="card" style={{ marginBottom: 16 }}>

                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                  Task Information
                </h3>

                <table style={{ width: "100%" }}>

                  <tbody>

                    <tr>
                      <td>Issue Type</td>
                      <td>{complaint.issueType?.replace(/_/g, " ")}</td>
                    </tr>

                    <tr>
                      <td>Location</td>
                      <td>{complaint.location}</td>
                    </tr>

                    <tr>
                      <td>Severity</td>
                      <td>
                        <span className={`badge badge-${complaint.severity}`}>
                          {complaint.severity}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td>Assigned Team</td>
                      <td>{complaint.assignedTeam || "—"}</td>
                    </tr>

                    <tr>
                      <td>Reported On</td>
                      <td>
                        {new Date(complaint.createdAt).toLocaleString("en-IN")}
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

              <div className="card" style={{ marginBottom: 16 }}>

                <h3>Problem Description</h3>

                <p>{complaint.description}</p>

              </div>

              {complaint.imageUrl && (

                <div className="card">

                  <h3>Site Photo</h3>

                  <img
                    src={complaint.imageUrl}
                    alt="site"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      maxHeight: 260,
                      objectFit: "cover"
                    }}
                  />

                </div>

              )}

            </div>

            {/* RIGHT SIDE */}

            <div>

              <div
                className="card"
                style={{ marginBottom: 16, border: "2px solid #38a169" }}
              >

                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 16,
                    color: "#38a169"
                  }}
                >
                  🔧 Update Task Status
                </h3>

                <form onSubmit={update}>

                  <div className="form-group">

                    <label>Status</label>

                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >

                      {SERVICE_STATUSES.map((s) => (

                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>

                      ))}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>Work Note *</label>

                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-success btn-full"
                    disabled={updating}
                  >

                    {updating
                      ? "Updating..."
                      : status === "resolved"
                      ? "✅ Mark as Resolved"
                      : "🔄 Update Status"}

                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}