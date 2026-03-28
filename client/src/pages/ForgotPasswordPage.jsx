import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/index.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      toast.success(res.data.message || "If the email exists, a reset link has been sent.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 26, textAlign: "center" }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Forgot password</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>We will send a reset link to your verified email.</p>
        </div>
        <div className="card" style={{ padding: "28px 24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: "center" }} disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
        <p style={{ marginTop: 18, textAlign: "center", fontSize: 14, color: "var(--text3)" }}>
          Back to <Link to="/login" style={{ color: "var(--accent2)" }}>login</Link>
        </p>
      </div>
    </div>
  );
}
