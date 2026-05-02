import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../utils/api";

export function ConfirmEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(location.state?.username || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/confirm", { username, code });
      toast.success("Email verified! You can now login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await API.post("/auth/resend-code", { username });
      toast.success("Code resent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">📧</span>
          <h1>Verify Email</h1>
          <p>Check your inbox for the verification code</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" />
          </div>
          <div className="form-group">
            <label>Verification Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={resend} className="btn btn-outline" style={{ fontSize: 13 }}>Resend Code</button>
        </div>
        <div className="auth-footer">
          <Link to="/login" className="auth-link">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmail;
