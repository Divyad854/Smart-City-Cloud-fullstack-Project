import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error("Fill all fields");
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      
      login(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "service_team") navigate("/service");
      else navigate("/citizen");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🏙️</span>
          <h1>Smart City Platform</h1>
          <p>Incident & Complaint Monitoring System</p>
        </div>
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">Enter your credentials to continue</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
           <input
  name="email"
  value={form.email}
  onChange={handle}
  placeholder="Enter your email"
/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="Your password" />
          </div>
          <div style={{ textAlign: "right", marginBottom: "16px" }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: "13px" }}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </div>
       
      </div>
    </div>
  );
}
