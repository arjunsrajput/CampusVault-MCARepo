import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/index.js";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.error || "Verification failed.");
      });
  }, [searchParams]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", textAlign: "center", padding: "30px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
          {status === "verifying" ? "Verifying..." : status === "success" ? "Email verified" : "Verification failed"}
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 18 }}>{message}</p>
        <Link to="/login" className="btn btn-primary" style={{ justifyContent: "center" }}>
          Go to login
        </Link>
      </div>
    </div>
  );
}
