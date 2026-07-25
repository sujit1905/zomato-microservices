import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(interval); onAccepted(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      setAccepting(true);
      await axios.post(`${riderService}/api/rider/accept/${orderId}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Order Accepted! 🏍️");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept");
      onAccepted();
    } finally { setAccepting(false); }
  };

  const pct = (secondsLeft / 60) * 100;
  const urgentColor = secondsLeft <= 15 ? "#DC2626" : secondsLeft <= 30 ? "#D97706" : "#16A34A";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        background: "#fff", borderRadius: "var(--radius-xl)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        border: "2px solid #16A34A", overflow: "hidden",
      }}
    >
      {/* Countdown bar */}
      <div style={{ height: "4px", background: "#E5E7EB" }}>
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: `${pct}%` }}
          style={{ height: "100%", background: urgentColor, transition: "background 0.5s" }}
        />
      </div>

      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ fontSize: "2.5rem", marginBottom: "8px" }}
          >
            🏍️
          </motion.div>
          <p style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--color-dark)", margin: "0 0 4px" }}>
            New Delivery Request!
          </p>
          <p style={{
            fontSize: "0.9rem", fontWeight: 700,
            color: urgentColor,
            margin: 0,
          }}>
            Accept within {secondsLeft}s
          </p>
        </div>

        {/* Order info */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)", padding: "12px 16px", marginBottom: "14px" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "0 0 2px" }}>Order ID</p>
          <p style={{ fontWeight: 700, color: "var(--color-dark)", fontFamily: "monospace", fontSize: "1rem", margin: 0 }}>
            #{orderId.slice(-10).toUpperCase()}
          </p>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={accepting}
          onClick={acceptOrder}
          style={{
            width: "100%", padding: "14px",
            background: "#16A34A",
            color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
            fontWeight: 700, fontSize: "1.0625rem",
            cursor: accepting ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {accepting ? (
            <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" /></svg>Accepting...</>
          ) : "✓ Accept Delivery"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RiderOrderRequest;
