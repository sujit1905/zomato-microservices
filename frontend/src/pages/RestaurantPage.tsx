import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import { motion } from "framer-motion";
import { MenuItemSkeleton } from "../components/ui/Skeleton";

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"menu" | "info">("menu");

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurant(data || null);
    } catch {
      console.log("Failed to fetch restaurant");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const { data } = await axios.get(`${restaurantService}/api/item/all/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMenuItems(data);
    } catch {
      console.log("Failed to fetch menu");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: "16px",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid var(--color-primary-light)",
          borderTopColor: "var(--color-primary)",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Loading restaurant...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: "12px",
      }}>
        <p style={{ fontSize: "3rem" }}>🍽️</p>
        <h3 style={{ fontWeight: 700, color: "var(--color-dark)" }}>Restaurant not found</h3>
        <p style={{ color: "var(--color-text-muted)" }}>The restaurant you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh" }}>
      {/* Profile */}
      <div className="container" style={{ paddingTop: "28px", paddingBottom: "0" }}>
        <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={false} />
      </div>

      {/* Tab Bar */}
      <div style={{
        position: "sticky", top: "64px", zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border)",
        marginTop: "0",
      }}>
        <div className="container">
          <div style={{ display: "flex", gap: "0" }}>
            {[
              { key: "menu", label: `Menu (${menuItems.length})` },
              { key: "info", label: "Info" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                style={{
                  padding: "16px 24px",
                  background: "none", border: "none",
                  fontSize: "0.9375rem", fontWeight: 600,
                  color: activeTab === key ? "var(--color-primary)" : "var(--color-text-muted)",
                  borderBottom: activeTab === key ? "2px solid var(--color-primary)" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  marginBottom: "-1px",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: "24px", paddingBottom: "48px" }}>
        {activeTab === "menu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "#fff",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>
                🍴 Menu
              </h3>
            </div>

            {menuLoading ? (
              <div>
                {[...Array(5)].map((_, i) => <MenuItemSkeleton key={i} />)}
              </div>
            ) : (
              <MenuItems
                isSeller={false}
                items={menuItems}
                onItemDeleted={() => {}}
              />
            )}
          </motion.div>
        )}

        {activeTab === "info" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              {
                icon: "📍",
                title: "Address",
                value: restaurant.autoLocation.formattedAddress || "Not available",
              },
              {
                icon: "📞",
                title: "Contact",
                value: String(restaurant.phone),
              },
              {
                icon: "🕐",
                title: "Status",
                value: restaurant.isOpen ? "Currently Open" : "Currently Closed",
              },
              {
                icon: "✅",
                title: "Verification",
                value: restaurant.isVerified ? "Verified by Zomato" : "Pending Verification",
              },
            ].map(({ icon, title, value }) => (
              <div
                key={title}
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px",
                  boxShadow: "var(--shadow-card)",
                  display: "flex", gap: "16px", alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "1.75rem" }}>{icon}</span>
                <div>
                  <p style={{ fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px", fontSize: "0.875rem" }}>{title}</p>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", margin: 0 }}>{value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RestaurantPage;
