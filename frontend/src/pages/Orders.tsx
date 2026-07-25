import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import { motion, AnimatePresence } from "framer-motion";
import { OrderCardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";

const ACTIVE_STATUSES = ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  placed: { label: "Order Placed", color: "#2563EB", bg: "#EFF6FF", emoji: "📋" },
  accepted: { label: "Accepted", color: "#16A34A", bg: "#F0FDF4", emoji: "✅" },
  preparing: { label: "Preparing", color: "#D97706", bg: "#FFFBEB", emoji: "👨‍🍳" },
  ready_for_rider: { label: "Ready for Pickup", color: "#7C3AED", bg: "#F5F3FF", emoji: "📦" },
  rider_assigned: { label: "Rider Assigned", color: "#0891B2", bg: "#ECFEFF", emoji: "🏍️" },
  picked_up: { label: "On the Way", color: "#EA580C", bg: "#FFF7ED", emoji: "🚀" },
  delivered: { label: "Delivered", color: "#16A34A", bg: "#F0FDF4", emoji: "🎉" },
  cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2", emoji: "❌" },
};

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/myorder`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch {
      console.log("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => fetchOrders();
    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);
    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  if (loading) {
    return (
      <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "32px 0" }}>
        <div className="container">
          <div style={{ marginBottom: "28px" }}>
            <div className="skeleton" style={{ height: "32px", width: "160px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ height: "16px", width: "240px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[...Array(4)].map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "32px 0 64px" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>
            My Orders
          </h1>
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "4px",
          background: "var(--color-bg-tertiary)",
          borderRadius: "var(--radius-lg)",
          padding: "4px",
          marginBottom: "24px",
          width: "fit-content",
        }}>
          {[
            { key: "active", label: "Active", count: activeOrders.length },
            { key: "completed", label: "Completed", count: completedOrders.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              style={{
                padding: "10px 20px",
                background: activeTab === key ? "#fff" : "none",
                border: "none", borderRadius: "var(--radius-md)",
                fontWeight: 600, fontSize: "0.9375rem",
                color: activeTab === key ? "var(--color-dark)" : "var(--color-text-muted)",
                cursor: "pointer",
                boxShadow: activeTab === key ? "var(--shadow-sm)" : "none",
                transition: "all var(--transition-fast)",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              {label}
              <span style={{
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                background: activeTab === key ? "var(--color-primary-light)" : "var(--color-border)",
                color: activeTab === key ? "var(--color-primary)" : "var(--color-text-muted)",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Order list */}
        <AnimatePresence mode="wait">
          {activeTab === "active" ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {activeOrders.length === 0 ? (
                <EmptyState
                  icon="📋"
                  title="No active orders"
                  description="Your active orders will appear here. Place an order to get started!"
                  action={{ label: "Order Now", onClick: () => navigate("/") }}
                />
              ) : (
                activeOrders.map((order) => (
                  <OrderRow key={order._id} order={order} onClick={() => navigate(`/order/${order._id}`)} />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {completedOrders.length === 0 ? (
                <EmptyState icon="📦" title="No completed orders" description="Your past orders will show up here." />
              ) : (
                completedOrders.map((order) => (
                  <OrderRow key={order._id} order={order} onClick={() => navigate(`/order/${order._id}`)} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Orders;

const OrderRow = ({ order, onClick }: { order: IOrder; onClick: () => void }) => {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        cursor: "pointer",
        overflow: "hidden",
        transition: "box-shadow var(--transition-fast)",
        border: "1px solid var(--color-border-light)",
      }}
      className="card-hover"
    >
      {/* Status bar */}
      <div style={{
        height: "4px",
        background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
      }} />

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div>
            <p style={{ fontWeight: 800, color: "var(--color-dark)", fontSize: "1.0625rem", marginBottom: "4px" }}>
              {order.restaurantName}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <span style={{
            padding: "6px 14px",
            background: config.bg,
            color: config.color,
            borderRadius: "var(--radius-full)",
            fontSize: "0.8125rem",
            fontWeight: 700,
            display: "flex", alignItems: "center", gap: "6px",
            whiteSpace: "nowrap",
          }}>
            {config.emoji} {config.label}
          </span>
        </div>

        {/* Items */}
        <p style={{
          fontSize: "0.9rem", color: "var(--color-text-muted)",
          marginBottom: "14px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {order.items.map((item) => `${item.name} ×${item.quauntity}`).join(" · ")}
        </p>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: "14px", borderTop: "1px solid var(--color-border-light)",
        }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{
              fontWeight: 800, fontSize: "1.125rem", color: "var(--color-dark)",
            }}>₹{order.totalAmount}</span>
            <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.875rem" }}>
              View →
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
