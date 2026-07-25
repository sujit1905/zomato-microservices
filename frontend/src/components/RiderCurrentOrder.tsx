import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BiPhone } from "react-icons/bi";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const updateStatus = async () => {
    try {
      await axios.put(`${riderService}/api/rider/order/update/${order._id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Order status updated ✓");
      onStatusUpdate();
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to update"); }
  };

  const statusEmoji = order.status === "rider_assigned" ? "🏪" : "🏠";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}
    >
      {/* Status bar */}
      <div style={{ height: "5px", background: "linear-gradient(90deg, var(--color-primary), #ff6b6b)" }} />

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "0 0 3px" }}>Current Delivery</p>
            <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--color-dark)", margin: 0 }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </h3>
          </div>
          <span style={{
            padding: "5px 12px", borderRadius: "var(--radius-full)",
            background: "var(--color-primary-light)", color: "var(--color-primary)",
            fontWeight: 700, fontSize: "0.75rem",
          }}>
            {order.status.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Route info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {/* Pickup */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#FEF3C7", border: "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.9rem" }}>
              🏪
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#D97706", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pickup</p>
              <p style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0, fontSize: "0.9375rem" }}>{order.restaurantName}</p>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ paddingLeft: "16px", color: "var(--color-text-muted)", fontSize: "1.25rem", lineHeight: 1 }}>↓</div>

          {/* Drop */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-success-bg)", border: "2px solid var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.9rem" }}>
              🏠
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-success)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Drop</p>
              <p style={{ fontWeight: 600, color: "var(--color-dark)", margin: 0, fontSize: "0.875rem" }}>{order.deliveryAddress.fromattedAddress}</p>
            </div>
          </div>
        </div>

        {/* Earnings & Total */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <div style={{ background: "var(--color-success-bg)", borderRadius: "var(--radius-md)", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", color: "#16A34A", fontWeight: 600, margin: "0 0 3px" }}>Your Earning</p>
            <p style={{ fontWeight: 800, fontSize: "1.25rem", color: "#16A34A", margin: 0 }}>₹{order.riderAmount}</p>
          </div>
          <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "12px", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, margin: "0 0 3px" }}>Order Total</p>
            <p style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", margin: 0 }}>₹{order.totalAmount}</p>
          </div>
        </div>

        {/* Customer call */}
        {order.deliveryAddress.mobile && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-lg)", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BiPhone size={18} color="var(--color-primary)" />
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>Customer</p>
                <p style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>{order.deliveryAddress.mobile}</p>
              </div>
            </div>
            <a href={`tel:${order.deliveryAddress.mobile}`} style={{
              padding: "8px 16px", background: "#2563EB", color: "#fff",
              borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "0.875rem",
              textDecoration: "none",
            }}>Call</a>
          </div>
        )}

        {/* Action button */}
        {(order.status === "rider_assigned" || order.status === "picked_up") && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={updateStatus}
            style={{
              width: "100%", padding: "14px",
              background: order.status === "rider_assigned" ? "#D97706" : "#16A34A",
              color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
              fontWeight: 700, fontSize: "1rem", cursor: "pointer",
              boxShadow: order.status === "rider_assigned" ? "0 4px 12px rgba(217,119,6,0.35)" : "0 4px 12px rgba(22,163,74,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {statusEmoji} {order.status === "rider_assigned" ? "Reached Restaurant → Picked Up" : "Mark as Delivered ✓"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default RiderCurrentOrder;
