import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../api/index.js";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Reset token is missing.");

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      toast.success(res.data.message || "Password reset successfully.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 26, textAlign: "center" }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Set a new password</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>Choose a new password for your MCA Repo account.</p>
        </div>
        <div className="card" style={{ padding: "28px 24px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: "center" }} disabled={loading}>
              {loading ? "Updating..." : "Reset password"}
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
