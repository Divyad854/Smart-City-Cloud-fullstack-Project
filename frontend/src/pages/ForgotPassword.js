import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../utils/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ================= STEP 1: SEND CODE =================
  const sendCode = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Email is required");

    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Reset code sent to your email");
      setStep(2); // 👉 go to verify step
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 2: VERIFY CODE =================
  const verifyCode = (e) => {
    e.preventDefault();

    if (!code) return toast.error("Enter verification code");

    // ⚠️ Cognito verifies code only during reset-password
    // So here we just move forward
    setStep(3);
  };

  // ================= STEP 3: RESET PASSWORD =================
  const resetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword)
      return toast.error("Fill all fields");

    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    if (password.length < 8)
      return toast.error("Password must be at least 8 characters");

    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        email,
        code,
        newPassword: password,
      });

      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <span className="logo-icon">🔒</span>
          <h1>Reset Password</h1>
        </div>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <form onSubmit={sendCode}>
            <div className="form-group">
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <form onSubmit={verifyCode}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />
            </div>

            <button className="btn btn-primary btn-full">
              Verify Code
            </button>
          </form>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <form onSubmit={resetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            ← Back to login
          </Link>
        </div>

      </div>
    </div>
  );
}