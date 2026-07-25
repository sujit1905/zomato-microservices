import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) { setVerifying(false); return; }
      try {
        await axios.post(`${utilsService}/api/payment/stripe/verify`, { sessionId });
        toast.success("Payment verified successfully! 🎉");
        setSuccess(true);
      } catch {
        toast.error("Stripe verification failed");
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };
    verifyPayment();
  }, [sessionId]);

  if (verifying) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Verifying your payment...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: success ? "linear-gradient(135deg, #F0FDF4 0%, #fff 60%)" : "linear-gradient(135deg, #FEF2F2 0%, #fff 60%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
        style={{ width: "100%", maxWidth: "460px", background: "#fff", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden", textAlign: "center" }}
      >
        <div style={{ height: "6px", background: success ? "linear-gradient(90deg, var(--color-success), #4ade80)" : "linear-gradient(90deg, var(--color-error), #f87171)" }} />
        <div style={{ padding: "48px 36px" }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ fontSize: "4rem", marginBottom: "24px" }}
          >
            {success ? "🎉" : "❌"}
          </motion.div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "12px" }}>
            {success ? "Order Placed!" : "Payment Failed"}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", marginBottom: "32px", lineHeight: 1.6 }}>
            {success
              ? "Your Stripe payment was verified. Your food is being prepared! 🍽️"
              : "We couldn't verify your payment. Please contact support if amount was deducted."
            }
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {success && (
              <button onClick={() => navigate("/orders")} className="btn btn-primary btn-lg btn-block" style={{ justifyContent: "center" }}>
                🏍️ Track Your Order
              </button>
            )}
            <button onClick={() => navigate("/")} className="btn btn-secondary btn-lg btn-block" style={{ justifyContent: "center" }}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
