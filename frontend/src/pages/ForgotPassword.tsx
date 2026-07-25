import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiEnvelope, BiArrowBack } from "react-icons/bi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${authService}/api/auth/forgot-password`, { email });
      toast.success(data.message || "Reset link sent!");
      setSubmitted(true);
      // For developer/fallback testing convenience:
      if (data.resetToken) {
        console.log("DEV NOTE - Reset Link:", `http://localhost:5173/reset-password/${data.resetToken}`);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to send reset link";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg-secondary)",
      padding: "24px 16px",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)",
          padding: "36px",
          border: "1px solid var(--color-border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "40px" }}>🔑</span>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginTop: "12px", marginBottom: "8px" }}>
            Forgot Password
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", margin: 0 }}>
            {submitted
              ? "We've sent a recovery link to your inbox"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {submitted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{
              background: "var(--color-success-bg)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              textAlign: "center",
              color: "var(--color-success)",
              fontWeight: 500,
              fontSize: "0.9375rem",
              lineHeight: 1.5,
            }}>
              📧 A password reset link has been dispatched to <strong>{email}</strong>. Please check your spam folder if you do not receive it shortly.
            </div>
            <Link to="/login" className="btn btn-secondary btn-block" style={{ gap: "8px" }}>
              <BiArrowBack /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                  <BiEnvelope size={18} />
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary btn-block"
              style={{ padding: "14px" }}
            >
              {loading ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" />
                </svg>
              ) : (
                "Send Reset Link"
              )}
            </motion.button>

            <Link to="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--color-text-muted)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
              <BiArrowBack /> Back to Sign In
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
