import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";

export default function ReportIncident() {

  const { user } = useAuth();
  const navigate = useNavigate();

  const [issueTypes, setIssueTypes] = useState([]);

  const [form, setForm] = useState({
    issueType: "",
    description: "",
    location: "",
    latitude: "",
    longitude: ""
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);


  /* ===============================
     LOAD ISSUE TYPES FROM API
  =============================== */

  const loadIssueTypes = async () => {
    try {

      const res = await API.get("/issue-types");

      setIssueTypes(res.data.issueTypes || []);

    } catch (err) {

      toast.error("Failed to load issue types");

    }
  };


  useEffect(() => {

    loadIssueTypes();

  }, []);



  /* ===============================
     FORM CHANGE
  =============================== */

  const handle = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  /* ===============================
     IMAGE HANDLER
  =============================== */

  const handleImage = (file) => {

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setImage(file);

    setImagePreview(URL.createObjectURL(file));

  };


  /* ===============================
     GET GPS LOCATION
  =============================== */

  const getLocation = () => {

    if (!navigator.geolocation) {
      return toast.error("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));

        toast.success("Location captured!");

      },

      () => toast.error("Could not get location")

    );

  };


  /* ===============================
     SUBMIT COMPLAINT
  =============================== */

  const submit = async (e) => {

    e.preventDefault();

    if (!form.issueType || !form.description || !form.location) {

      return toast.error("Fill all required fields");

    }

    setLoading(true);

    try {

      const data = new FormData();

      Object.entries(form).forEach(([k, v]) => data.append(k, v));

      data.append("username", user.username);
      data.append("userEmail", user.email);
      data.append("userName", user.name);

      if (image) {
        data.append("image", image);
      }

      const res = await API.post(
        "/complaints/report",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(`Complaint submitted! ID: ${res.data.complaintId}`);

      navigate("/citizen/complaints");

    } catch (err) {

      toast.error(err.response?.data?.message || "Failed to submit");

    } finally {

      setLoading(false);

    }

  };


  /* ===============================
     UI
  =============================== */

  return (

    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <div className="top-bar">
          <h2>📝 Report an Incident</h2>
        </div>

        <div className="page-content">

          <div className="card" style={{ maxWidth: 700, margin: "0 auto" }}>

            <form onSubmit={submit}>


              {/* ISSUE TYPE */}

              <div className="form-group">

                <label>Issue Type *</label>

                <select
                  name="issueType"
                  value={form.issueType}
                  onChange={handle}
                >

                  <option value="">Select issue type</option>

                  {issueTypes.map((type) => (

                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>

                  ))}

                </select>

              </div>



              {/* LOCATION */}

              <div className="form-group">

                <label>Location / Area *</label>

                <div style={{ display: "flex", gap: 8 }}>

                  <input
                    name="location"
                    value={form.location}
                    onChange={handle}
                    placeholder="e.g. Satellite Road, Ahmedabad"
                    style={{ flex: 1 }}
                  />

                  {/* <button
                    type="button"
                    className="btn btn-outline"
                    onClick={getLocation}
                  >
                    📍 GPS
                  </button> */}

                </div>

                {form.latitude && (

                  <p style={{
                    fontSize: 12,
                    color: "#718096",
                    marginTop: 4
                  }}>
                    GPS: {form.latitude}, {form.longitude}
                  </p>

                )}

              </div>



              {/* DESCRIPTION */}

              <div className="form-group">

                <label>Description *</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handle}
                  placeholder="Describe the problem in detail..."
                  rows={4}
                  style={{ resize: "vertical" }}
                />

              </div>



              {/* IMAGE UPLOAD */}

              <div className="form-group">

                <label>Upload Photo (optional)</label>

                <div
                  className={`upload-area ${dragOver ? "active" : ""} ${imagePreview ? "active" : ""}`}

                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}

                  onDragLeave={() => setDragOver(false)}

                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleImage(e.dataTransfer.files[0]);
                  }}

                  onClick={() =>
                    document.getElementById("imgInput").click()
                  }
                >

                  {imagePreview ? (

                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{
                        maxHeight: 200,
                        borderRadius: 8,
                        maxWidth: "100%"
                      }}
                    />

                  ) : (

                    <>
                      <div style={{ fontSize: 40 }}>📷</div>
                      <p style={{ color: "#718096", marginTop: 8 }}>
                        Click or drag photo here (max 10MB)
                      </p>
                    </>

                  )}

                </div>

                <input
                  id="imgInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleImage(e.target.files[0])
                  }
                />

                {imagePreview && (

                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginTop: 8, fontSize: 12 }}
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  >
                    ✕ Remove Photo
                  </button>

                )}

              </div>



              {/* BUTTONS */}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? "Submitting..." : "🚀 Submit Complaint"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/citizen")}
                >
                  Cancel
                </button>

              </div>


            </form>

          </div>

        </div>

      </div>

    </div>

  );

}