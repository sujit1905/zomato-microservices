import axios from "axios";
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiLockAlt, BiHide, BiShow, BiCheckCircle } from "react-icons/bi";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) {
      return "Password must contain both letters and numbers";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    const passError = validatePassword(password);
    if (passError) {
      toast.error(passError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${authService}/api/auth/reset-password/${token}`, {
        password,
      });
      toast.success(data.message || "Password updated successfully!");
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to reset password";
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
          <span style={{ fontSize: "40px" }}>🛡️</span>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginTop: "12px", marginBottom: "8px" }}>
            Reset Password
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", margin: 0 }}>
            {success
              ? "Your password has been changed"
              : "Enter and confirm your new secure password below"}
          </p>
        </div>

        {success ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              style={{ color: "var(--color-success)", display: "flex" }}
            >
              <BiCheckCircle size={64} />
            </motion.div>
            <div style={{
              background: "var(--color-success-bg)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              fontWeight: 500,
              fontSize: "0.9375rem",
              lineHeight: 1.5,
              color: "var(--color-success)"
            }}>
              Your password has been updated. Redirecting to Sign In in a few seconds...
            </div>
            <Link to="/login" className="btn btn-primary btn-block">
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* New Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                  <BiLockAlt size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters with numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "44px", paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--color-text-light)",
                    display: "flex", alignItems: "center"
                  }}
                >
                  {showPassword ? <BiHide size={18} /> : <BiShow size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                  <BiLockAlt size={18} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "44px", paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--color-text-light)",
                    display: "flex", alignItems: "center"
                  }}
                >
                  {showConfirmPassword ? <BiHide size={18} /> : <BiShow size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary btn-block"
              style={{ padding: "14px", marginTop: "8px" }}
            >
              {loading ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" />
                </svg>
              ) : (
                "Update Password"
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
