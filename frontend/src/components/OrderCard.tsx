import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { VscLoading } from "react-icons/vsc";

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  placed:         { color: "#D97706", bg: "#FFFBEB", label: "New Order",       emoji: "🆕" },
  accepted:       { color: "#16A34A", bg: "#F0FDF4", label: "Accepted",        emoji: "✅" },
  preparing:      { color: "#2563EB", bg: "#EFF6FF", label: "Preparing",       emoji: "👨‍🍳" },
  ready_for_rider:{ color: "#7C3AED", bg: "#F5F3FF", label: "Ready",           emoji: "📦" },
  rider_assigned: { color: "#0891B2", bg: "#ECFEFF", label: "Rider Assigned",  emoji: "🏍️" },
  picked_up:      { color: "#EA580C", bg: "#FFF7ED", label: "On the Way",      emoji: "🚀" },
  delivered:      { color: "#16A34A", bg: "#F0FDF4", label: "Delivered",       emoji: "🎉" },
  cancelled:      { color: "#DC2626", bg: "#FEF2F2", label: "Cancelled",       emoji: "❌" },
};

interface props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);
  const actions = ORDER_ACTIONS[order.status] || [];
  const style = STATUS_STYLES[order.status] || STATUS_STYLES.placed;

  useEffect(() => {
    if (order.status !== "ready_for_rider") { setRetryVisible(false); return; }
    const timer = setTimeout(() => setRetryVisible(true), 10000);
    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Order updated ✓");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        border: `1.5px solid ${style.bg}`,
      }}
    >
      {/* Status bar */}
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${style.color}, ${style.color}80)` }} />

      <div style={{ padding: "16px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <p style={{ fontWeight: 800, color: "var(--color-dark)", fontSize: "0.9375rem", margin: "0 0 2px" }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>
              {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <span style={{
            padding: "5px 12px", borderRadius: "var(--radius-full)",
            background: style.bg, color: style.color,
            fontWeight: 700, fontSize: "0.75rem",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            {style.emoji} {style.label}
          </span>
        </div>

        {/* Items */}
        <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "10px 12px", marginBottom: "10px" }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--color-text)" }}>{item.name} <span style={{ color: "var(--color-text-muted)" }}>×{item.quauntity}</span></span>
              <span style={{ fontWeight: 600, color: "var(--color-dark)" }}>₹{item.price * item.quauntity}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Payment: <span style={{
              fontWeight: 600,
              color: order.paymentStatus === "paid" ? "var(--color-success)" : "var(--color-warning)",
            }}>{order.paymentStatus}</span>
          </span>
          <span style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--color-dark)" }}>₹{order.totalAmount}</span>
        </div>

        {/* Actions */}
        {order.paymentStatus === "paid" && actions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {actions.map((status) => (
              <motion.button
                key={status}
                whileTap={{ scale: 0.96 }}
                disabled={loading}
                onClick={() => updateStatus(status)}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  background: "var(--color-primary)",
                  color: "#fff", border: "none",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600, fontSize: "0.8125rem",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "var(--shadow-primary)",
                }}
              >
                {loading ? <VscLoading size={14} className="animate-spin" /> : null}
                {status.replaceAll("_", " ").replace(/^\w/, c => c.toUpperCase())}
              </motion.button>
            ))}
          </div>
        )}

        {order.status === "ready_for_rider" && retryVisible && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => updateStatus("ready_for_rider")}
            style={{
              width: "100%", marginTop: "8px", padding: "9px",
              background: "none",
              border: "1.5px dashed var(--color-primary)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer",
            }}
          >
            🔄 Retry: Find Rider
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default OrderCard;
