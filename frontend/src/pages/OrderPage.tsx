import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";
import { motion } from "framer-motion";
import { BiArrowBack } from "react-icons/bi";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", emoji: "📋" },
  { key: "accepted", label: "Accepted", emoji: "✅" },
  { key: "preparing", label: "Preparing", emoji: "👨‍🍳" },
  { key: "ready_for_rider", label: "Ready", emoji: "📦" },
  { key: "rider_assigned", label: "Rider Assigned", emoji: "🏍️" },
  { key: "picked_up", label: "On the Way", emoji: "🚀" },
  { key: "delivered", label: "Delivered", emoji: "🎉" },
];

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(data);
    } catch { console.log("Failed to fetch order"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => fetchOrder();
    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);
    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join", `user:${id}`);
    return () => { socket.emit("leave", `user:${id}`); };
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;
    const onRiderLocation = ({ latitude, longitude }: any) => setRiderLocation([latitude, longitude]);
    socket.on("rider:location", onRiderLocation);
    return () => { socket.off("rider:location", onRiderLocation); };
  }, [socket]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontSize: "3rem" }}>📦</p>
        <h3 style={{ fontWeight: 700 }}>Order not found</h3>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "24px 0 64px" }}>
      <div className="container">
        <button onClick={() => navigate("/orders")} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontWeight: 500, marginBottom: "20px", padding: 0 }}>
          <BiArrowBack size={18} /> Back to Orders
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }} className="order-grid">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              <div style={{ height: "5px", background: isCancelled ? "var(--color-error)" : "linear-gradient(90deg, var(--color-primary), #ff6b6b)" }} />
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>{order.restaurantName}</h1>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>Order #{order._id.slice(-10).toUpperCase()}</p>
                  </div>
                  <span style={{
                    padding: "6px 16px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "0.8125rem",
                    background: isCancelled ? "var(--color-error-bg)" : "var(--color-primary-light)",
                    color: isCancelled ? "var(--color-error)" : "var(--color-primary)",
                  }}>
                    {isCancelled ? "❌ Cancelled" : STATUS_STEPS[currentStepIdx]?.emoji + " " + STATUS_STEPS[currentStepIdx]?.label}
                  </span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>

            {/* Progress Stepper */}
            {!isCancelled && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", padding: "24px" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: "24px" }}>Order Progress</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStepIdx;
                    const isActive = i === currentStepIdx;
                    return (
                      <div key={step.key} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        {/* Dot & line */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                              width: "32px", height: "32px", borderRadius: "50%",
                              background: isCompleted ? "var(--color-primary)" : "var(--color-bg-secondary)",
                              border: `2px solid ${isCompleted ? "var(--color-primary)" : "var(--color-border)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.875rem",
                              boxShadow: isActive ? "0 0 0 4px rgba(226,55,68,0.15)" : "none",
                            }}
                          >
                            {isCompleted ? <span style={{ color: "#fff", fontSize: "0.875rem" }}>✓</span> : <span style={{ fontSize: "0.875rem" }}>{step.emoji}</span>}
                          </motion.div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ width: "2px", height: "32px", background: isCompleted && i < currentStepIdx ? "var(--color-primary)" : "var(--color-border)", margin: "4px 0" }} />
                          )}
                        </div>
                        {/* Label */}
                        <div style={{ paddingTop: "6px", paddingBottom: "28px" }}>
                          <p style={{ fontWeight: isActive ? 700 : 500, color: isCompleted ? "var(--color-dark)" : "var(--color-text-muted)", margin: 0, fontSize: "0.9375rem" }}>
                            {step.label}
                          </p>
                          {isActive && <p style={{ fontSize: "0.8125rem", color: "var(--color-primary)", margin: "2px 0 0", fontWeight: 600 }}>Current status</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Map */}
            {(order.status === "rider_assigned" || order.status === "picked_up") && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--color-border)" }}>
                  <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>🗺️ Live Tracking</h3>
                </div>
                <div style={{ padding: "16px" }}>
                  {riderLocation ? (
                    <UserOrderMap riderLocation={riderLocation} deliveryLocation={[order.deliveryAddress.latitude!, order.deliveryAddress.longitude!]} />
                  ) : (
                    <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Waiting for rider location...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Summary */}
          <div style={{ position: "sticky", top: "88px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Items */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Items Ordered</h3>
              </div>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9375rem", color: "var(--color-text)" }}>{item.name} <span style={{ color: "var(--color-text-muted)" }}>×{item.quauntity}</span></span>
                    <span style={{ fontWeight: 600, color: "var(--color-dark)" }}>₹{item.price * item.quauntity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Bill Details</h3>
              </div>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Subtotal", value: `₹${order.subtotal}` },
                  { label: "Delivery Fee", value: `₹${order.deliveryFee}` },
                  { label: "Platform Fee", value: `₹${order.platfromFee}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>{label}</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <div style={{ height: "1px", background: "var(--color-border)" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: "1.0625rem" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-dark)" }}>₹{order.totalAmount}</span>
                </div>
                <div style={{ background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginTop: "4px" }}>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
                    💳 {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)} · <span style={{ color: order.paymentStatus === "paid" ? "var(--color-success)" : "var(--color-warning)", fontWeight: 600 }}>{order.paymentStatus}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", padding: "20px 24px" }}>
              <h3 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: "12px" }}>📍 Delivery Address</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 4px" }}>{order.deliveryAddress.fromattedAddress}</p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>📱 {order.deliveryAddress.mobile}</p>
            </div>

            {/* Rider info */}
            {order.riderName && (
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", padding: "20px 24px" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: "12px" }}>🏍️ Your Rider</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🏍️</div>
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>{order.riderName}</p>
                    {order.riderPhone && <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>📱 {order.riderPhone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .order-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default OrderPage;
