import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/quack.mp3";
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";
import { motion, AnimatePresence } from "framer-motion";

const ACTIVE_STATUSES = ["placed", "accepted", "preparing", "ready_for_rider", "rider_assigned", "picked_up"];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { audioRef.current = new Audio(audio); audioRef.current.load(); }, []);

  const unlockAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.play().then(() => {
      audioRef.current!.pause(); audioRef.current!.currentTime = 0; setAudioUnlocked(true);
    }).catch(() => {});
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/restaurant/${restaurantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch { console.log("Failed to fetch orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;
    const onNewOrder = () => { if (audioUnlocked && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); } fetchOrders(); };
    socket.on("order:new", onNewOrder);
    return () => { socket.off("order:new", onNewOrder); };
  }, [socket, audioUnlocked]);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => fetchOrders();
    socket.on("order:rider_assigned", onUpdate);
    return () => { socket.off("order:rider_assigned", onUpdate); };
  }, [socket]);

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(o => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Sound notification banner */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{
              background: "var(--color-info-bg)", border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "var(--radius-lg)", padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.5rem" }}>🔔</span>
              <div>
                <p style={{ fontWeight: 700, color: "#1E40AF", margin: "0 0 2px", fontSize: "0.9375rem" }}>Enable Order Notifications</p>
                <p style={{ color: "#3B82F6", fontSize: "0.8125rem", margin: 0 }}>Get alerted with a sound when new orders arrive</p>
              </div>
            </div>
            <button onClick={unlockAudio} style={{ padding: "8px 18px", background: "#2563EB", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}>
              Enable Sound
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {[
          { label: "Active Orders", value: activeOrders.length, color: "var(--color-primary)", bg: "var(--color-primary-light)", emoji: "🔥" },
          { label: "Completed", value: completedOrders.length, color: "var(--color-success)", bg: "var(--color-success-bg)", emoji: "✅" },
          { label: "Revenue", value: `₹${orders.filter(o => o.paymentStatus === "paid").reduce((s, o) => s + o.totalAmount, 0)}`, color: "#7C3AED", bg: "#F5F3FF", emoji: "💰" },
        ].map(({ label, value, color, emoji }) => (
          <div key={label} style={{ background: "#fff", borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "var(--shadow-card)", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{emoji}</p>
            <p style={{ fontSize: "1.375rem", fontWeight: 800, color, marginBottom: "4px" }}>{value}</p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)", padding: "4px", width: "fit-content" }}>
        {[
          { key: "active", label: "Active", count: activeOrders.length },
          { key: "completed", label: "Completed", count: completedOrders.length },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            style={{
              padding: "9px 18px", background: activeTab === key ? "#fff" : "none",
              border: "none", borderRadius: "var(--radius-md)",
              fontWeight: 600, fontSize: "0.875rem",
              color: activeTab === key ? "var(--color-dark)" : "var(--color-text-muted)",
              cursor: "pointer", boxShadow: activeTab === key ? "var(--shadow-sm)" : "none",
              transition: "all var(--transition-fast)", display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            {label}
            <span style={{ padding: "1px 7px", borderRadius: "var(--radius-full)", background: activeTab === key ? "var(--color-primary-light)" : "var(--color-border)", color: activeTab === key ? "var(--color-primary)" : "var(--color-text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Order Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "var(--radius-xl)" }} />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {activeTab === "active" ? (
              activeOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
                  <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎉</p>
                  <p style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px" }}>No active orders right now</p>
                  <p style={{ fontSize: "0.875rem" }}>New orders will appear here in real time</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {activeOrders.map(order => <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />)}
                </div>
              )
            ) : (
              completedOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
                  <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📦</p>
                  <p style={{ fontWeight: 700, color: "var(--color-dark)" }}>No completed orders yet</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {completedOrders.map(order => <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />)}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default RestaurantOrders;
