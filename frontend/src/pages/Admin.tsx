import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/ui/EmptyState";

const Admin = () => {
  const [restaurant, setRestaurant] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${adminService}/api/v1/admin/restaurant/pending`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const response = await axios.get(
        `${adminService}/api/v1/admin/rider/pending`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setRestaurant(data.restaurants || []);
      setRiders(response.data.riders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Loading admin panel...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "40px 0 80px" }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>
              Admin Panel
            </h1>
            <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Review and approve merchant & rider applications</p>
          </div>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ padding: "8px 16px", background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", fontSize: "0.875rem", fontWeight: 600 }}>
              🏪 {restaurant.length} Restaurants Pending
            </span>
            <span style={{ padding: "8px 16px", background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", fontSize: "0.875rem", fontWeight: 600 }}>
              🏍️ {riders.length} Riders Pending
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: "flex", gap: "4px",
          background: "var(--color-bg-tertiary)",
          borderRadius: "var(--radius-xl)",
          padding: "4px",
          marginBottom: "28px",
          width: "fit-content",
          border: "1px solid var(--color-border-light)",
        }}>
          {[
            { key: "restaurant", label: "Pending Restaurants", count: restaurant.length },
            { key: "rider", label: "Pending Riders", count: riders.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              style={{
                padding: "10px 24px",
                background: tab === key ? "#fff" : "none",
                border: "none", borderRadius: "var(--radius-lg)",
                fontWeight: 700, fontSize: "0.9375rem",
                color: tab === key ? "var(--color-primary)" : "var(--color-text-muted)",
                cursor: "pointer",
                boxShadow: tab === key ? "var(--shadow-sm)" : "none",
                transition: "all var(--transition-fast)",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              {label}
              <span style={{
                padding: "2px 8px", borderRadius: "var(--radius-full)",
                background: tab === key ? "var(--color-primary-light)" : "var(--color-border)",
                color: tab === key ? "var(--color-primary)" : "var(--color-text-muted)",
                fontSize: "0.75rem", fontWeight: 700,
              }}>{count}</span>
            </button>
          ))}
        </div>

        {/* List Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "restaurant" && (
              restaurant.length === 0 ? (
                <EmptyState icon="🏪" title="No Pending Restaurants" description="All merchant registration requests have been reviewed." />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {restaurant.map((r) => (
                    <AdminRestaurantCard key={r._id} restaurant={r} onVerify={fetchData} />
                  ))}
                </div>
              )
            )}

            {tab === "rider" && (
              riders.length === 0 ? (
                <EmptyState icon="🏍️" title="No Pending Riders" description="All delivery partner registration requests have been reviewed." />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {riders.map((r) => (
                    <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
                  ))}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Admin;
