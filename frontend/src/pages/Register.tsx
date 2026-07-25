import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { motion } from "framer-motion";
import { BiHide, BiShow, BiLockAlt, BiEnvelope, BiUser } from "react-icons/bi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  // Password validation: min 8 characters, at least one letter and one number
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) {
      return "Password must contain both letters and numbers";
    }
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
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
      const { data } = await axios.post(`${authService}/api/auth/register`, {
        name,
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!");
      setUser(data.user);
      setIsAuth(true);
      navigate("/select-role");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "var(--color-bg)",
    }}>
      {/* Left panel — brand visual */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(145deg, #E23744 0%, #c42f3a 50%, #1C1C1C 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
        className="login-left-panel"
      >
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", color: "#fff" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{ fontSize: "80px", marginBottom: "24px", lineHeight: 1 }}
          >
            🍔
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "3rem",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-1px",
              margin: "0 0 12px",
            }}
          >
            Zomato
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: "1.125rem",
              color: "rgba(255,255,255,0.8)",
              maxWidth: "280px",
              lineHeight: 1.6,
              margin: "0 auto",
            }}
          >
            Create an account to start ordering your favorite foods in seconds.
          </motion.p>
        </div>
      </motion.div>

      {/* Right panel — register form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "8px" }}>
              Get Started 🚀
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>
              Create your new account today
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                  <BiUser size={18} />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                Password
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

            {/* Confirm Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                  <BiLockAlt size={18} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
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
                "Create Account"
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.9375rem" }}>
            <span style={{ color: "var(--color-text-muted)" }}>Already have an account? </span>
            <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Register;
