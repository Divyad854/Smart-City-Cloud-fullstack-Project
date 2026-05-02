import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import API from "../../utils/api";
import { toast } from "react-toastify";

export default function CreateServiceMember() {

  const [teams, setTeams] = useState([]);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    team: ""
  });

  useEffect(() => {
    API.get("/teams")
      .then(r => setTeams(r.data.teams || []))
      .catch(() => toast.error("Failed to load teams"));
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION (IMPORTANT FIX)
    if (!form.username || !form.email || !form.password) {
      return toast.error("Please fill all fields");
    }

    if (!form.team) {
      return toast.error("Please select a team"); // ✅ FIX
    }

    try {
      await API.post("/admin/service-users", form);

      toast.success("Service member created");

      setForm({
        username: "",
        email: "",
        password: "",
        team: ""
      });

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="layout">

      <Sidebar />

      <div className="main-content">

        <div className="top-bar">
          <h2>Create Service Member</h2>
        </div>

        <div className="page-content">

          <div className="card" style={{ maxWidth: 500 }}>

            <form onSubmit={submit}>

              <div className="form-group">
                <label>Username</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Team</label>

                <select
                  value={form.team}
                  onChange={(e) => setForm({ ...form, team: e.target.value })}
                >
                  {/* ✅ FIX: disabled default */}
                  <option value="" disabled>Select Team</option>

                  {teams.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary btn-full">
                Create Member
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}