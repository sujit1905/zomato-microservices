import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import { motion, AnimatePresence } from "framer-motion";

type SellerTab = "orders" | "menu" | "add-item";

const TABS = [
  { key: "orders", label: "Orders", emoji: "📋" },
  { key: "menu",   label: "Menu Items", emoji: "🍴" },
  { key: "add-item", label: "Add Item", emoji: "➕" },
];

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("orders");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurant(data.restaurant || null);
      if (data.token) { localStorage.setItem("token", data.token); window.location.reload(); }
    } catch { console.log("Failed to fetch restaurant"); }
    finally { setLoading(false); }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/item/all/${restaurantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMenuItems(data);
    } catch { console.log("Failed to fetch menu"); }
  };

  useEffect(() => { fetchMyRestaurant(); }, []);
  useEffect(() => { if (restaurant?._id) { fetchMenuItems(restaurant._id); } }, [restaurant]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: "4px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Loading your dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh" }}>
      {/* Seller header banner */}
      <div style={{ background: "linear-gradient(135deg, #1C1C1C 0%, #2D1B1B 100%)", padding: "20px 0 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "rgba(226,55,68,0.2)", border: "1px solid rgba(226,55,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
              🍽️
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", margin: 0 }}>Seller Dashboard</p>
              <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", margin: 0 }}>{restaurant.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: "24px", paddingBottom: "64px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Restaurant Profile Card */}
        <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={true} />

        {/* Tab Panel */}
        <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)" }}>
            {TABS.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setTab(key as SellerTab)}
                style={{
                  flex: 1, padding: "16px 8px",
                  background: "none", border: "none",
                  fontSize: "0.9rem", fontWeight: 600,
                  color: tab === key ? "var(--color-primary)" : "var(--color-text-muted)",
                  borderBottom: tab === key ? "2.5px solid var(--color-primary)" : "2.5px solid transparent",
                  cursor: "pointer", transition: "all var(--transition-fast)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  marginBottom: "-1px",
                }}
              >
                <span>{emoji}</span>
                <span className="tab-label">{label}</span>
                {key === "menu" && (
                  <span style={{
                    padding: "1px 7px", borderRadius: "var(--radius-full)",
                    background: tab === key ? "var(--color-primary-light)" : "var(--color-bg-secondary)",
                    color: tab === key ? "var(--color-primary)" : "var(--color-text-muted)",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}>{menuItems.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ padding: tab === "menu" ? "0" : "28px 24px" }}
            >
              {tab === "orders" && <div style={{ padding: "24px" }}><RestaurantOrders restaurantId={restaurant._id} /></div>}
              {tab === "menu" && (
                <MenuItems items={menuItems} onItemDeleted={() => fetchMenuItems(restaurant._id)} isSeller={true} />
              )}
              {tab === "add-item" && (
                <AddMenuItem onItemAdded={() => { fetchMenuItems(restaurant._id); setTab("menu"); }} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
