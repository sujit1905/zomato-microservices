import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";
import { motion } from "framer-motion";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult: any) => {
    if (!authResult || !authResult.code) {
      console.error("Google Login did not return an authorization code:", authResult);
      toast.error("Google login failed client-side");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, { code: authResult.code });
      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Problem while login";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => toast.error("Google Login failed client-side"),
    flow: "auth-code",
  });

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
        {/* Decorative circles */}
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
            🍅
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
            Discover the best food & drinks in your city, delivered fast to your door.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginTop: "36px" }}
          >
            {["⚡ Fast Delivery", "🍕 1000+ Restaurants", "💳 Safe Payments"].map((pill) => (
              <span
                key={pill}
                style={{
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {pill}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right panel — login form */}
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
        <div style={{ width: "100%", maxWidth: "380px" }}>
          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "8px" }}>
              Welcome back 👋
            </h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>
              Sign in to order your favourite food
            </p>
          </div>

          {/* Google Login Button */}
          <motion.button
            onClick={() => googleLogin()}
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "16px 24px",
              background: "#fff",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              color: "var(--color-text)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "var(--shadow-sm)",
              transition: "border-color var(--transition-fast)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {loading ? (
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#E23744" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" />
              </svg>
            ) : (
              <FcGoogle size={22} />
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "28px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
              Secure sign in
            </span>
            <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          </div>



          {/* T&C */}
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", textAlign: "center", lineHeight: 1.6 }}>
            By continuing, you agree to our{" "}
            <span style={{ color: "var(--color-primary)", fontWeight: 500, cursor: "pointer" }}>Terms of Service</span>
            {" & "}
            <span style={{ color: "var(--color-primary)", fontWeight: 500, cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </div>
      </motion.div>

      {/* Responsive: hide left panel on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
