import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../utils/api";

export default function Register() {

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
const submit = async (e) => {
  e.preventDefault();

  if (!form.username || !form.email || !form.password || !form.fullName)
    return toast.error("Fill all required fields");

  if (form.password !== form.confirmPassword)
    return toast.error("Passwords do not match");

  if (form.password.length < 8)
    return toast.error("Password must be at least 8 characters");

  setLoading(true);

  try {
    const res = await API.post("/auth/register", {
      ...form,
      role: "citizen"
    });

    // ✅ HANDLE EXISTING USER
    if (res.data.alreadyExists) {
      toast.info("Account already exists. Please verify your email.");
    } else {
      toast.success("Registration successful! Check your email for verification code.");
    }

    // ✅ ALWAYS GO TO VERIFY PAGE
    navigate("/confirm-email", { state: { username: form.username } });

  } catch (err) {
    toast.error(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">

      <div className="auth-card" style={{ maxWidth: 520 }}>

        <div className="auth-logo">
          <span className="logo-icon">🏙️</span>
          <h1>Smart City Platform</h1>
        </div>

        <h2 className="auth-title">Create Account</h2>

        <p className="auth-subtitle">
          Join the platform to report and track city issues
        </p>

        <form onSubmit={submit}>

          <div className="form-row">

            <div className="form-group">
              <label>Full Name *</label>

              <input
                name="fullName"
                value={form.fullName}
                onChange={handle}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Username *</label>

              <input
                name="username"
                value={form.username}
                onChange={handle}
                placeholder="johndoe"
              />
            </div>

          </div>

          <div className="form-group">
            <label>Email *</label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              name="phone"
              value={form.phone}
              onChange={handle}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Password *</label>

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                placeholder="Min 8 characters"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>

              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handle}
                placeholder="Repeat password"
              />
            </div>

          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>

      </div>

    </div>
  );
}