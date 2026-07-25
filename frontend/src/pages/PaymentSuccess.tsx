import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { motion } from "framer-motion";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => { fetchCart(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F0FDF4 0%, #fff 60%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
        style={{ width: "100%", maxWidth: "480px", background: "#fff", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden", textAlign: "center" }}
      >
        {/* Green top bar */}
        <div style={{ height: "6px", background: "linear-gradient(90deg, var(--color-success), #4ade80)" }} />

        <div style={{ padding: "48px 40px" }}>
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
            style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "var(--color-success-bg)",
              border: "3px solid var(--color-success)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "2.5rem",
            }}
          >
            🎉
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "12px" }}
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ color: "var(--color-text-muted)", fontSize: "1rem", marginBottom: "28px", lineHeight: 1.6 }}
          >
            Your order has been placed successfully. We're preparing your food right now! 🍽️
          </motion.p>

          {/* Payment ID */}
          {paymentId && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)", padding: "14px 20px", marginBottom: "28px" }}
            >
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "0 0 4px", fontWeight: 600 }}>Payment Reference</p>
              <p style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--color-dark)", margin: 0, wordBreak: "break-all" }}>{paymentId}</p>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <button
              onClick={() => navigate("/orders")}
              className="btn btn-primary btn-lg btn-block"
              style={{ justifyContent: "center" }}
            >
              🏍️ Track Your Order
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-secondary btn-lg btn-block"
              style={{ justifyContent: "center" }}
            >
              🛒 Order More Food
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
