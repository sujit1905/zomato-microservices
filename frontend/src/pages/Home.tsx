import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { motion } from "framer-motion";
import { RestaurantCardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";


const CATEGORIES = [
  { label: "Biryani", emoji: "🍛" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Burger", emoji: "🍔" },
  { label: "Chinese", emoji: "🥡" },
  { label: "Sushi", emoji: "🍣" },
  { label: "Desserts", emoji: "🍰" },
  { label: "Pasta", emoji: "🍝" },
  { label: "Wraps", emoji: "🌯" },
  { label: "Salads", emoji: "🥗" },
  { label: "Smoothies", emoji: "🥤" },
];

const OFFERS = [
  { title: "Free Delivery", desc: "On orders above ₹250", emoji: "🚀", color: "#E23744" },
  { title: "50% OFF", desc: "On your first 3 orders", emoji: "🎉", color: "#8B5CF6" },
  { title: "Extra 10% Off", desc: "Pay with Stripe or Razorpay", emoji: "💳", color: "#F59E0B" },
];

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const Home = () => {
  const { location, city } = useAppData();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${restaurantService}/api/restaurant/all`, {
        params: { latitude: location.latitude, longitude: location.longitude, search },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, [location, search]);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

      {/* Hero Section */}
      {!search && (
        <section style={{
          background: "linear-gradient(135deg, #1C1C1C 0%, #2D1B1B 50%, #1C1C1C 100%)",
          padding: "56px 0 48px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative blobs */}
          <div style={{
            position: "absolute", top: "-100px", right: "10%",
            width: "400px", height: "400px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(226,55,68,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-80px", left: "5%",
            width: "300px", height: "300px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(226,55,68,0.15)",
                border: "1px solid rgba(226,55,68,0.3)",
                borderRadius: "var(--radius-full)",
                padding: "6px 16px",
                marginBottom: "20px",
              }}>
                <span style={{ color: "var(--color-primary)", fontSize: "0.8125rem", fontWeight: 600 }}>
                  📍 Delivering to {city}
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.15,
                maxWidth: "620px",
                marginBottom: "16px",
              }}>
                Hungry? We've got <span style={{ color: "var(--color-primary)" }}>thousands</span> of options
              </h1>

              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "480px", marginBottom: "32px" }}>
                Order from top restaurants near you. Fast delivery, real-time tracking, and exclusive deals — every day.
              </p>

              {/* Offer pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {OFFERS.map((offer) => (
                  <motion.div
                    key={offer.title}
                    whileHover={{ scale: 1.04 }}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "var(--radius-lg)",
                      padding: "12px 18px",
                      cursor: "default",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{offer.emoji}</span>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9375rem", margin: 0 }}>{offer.title}</p>
                      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", margin: 0 }}>{offer.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Category Chips */}
      {!search && (
        <section style={{
          borderBottom: "1px solid var(--color-border)",
          background: "#fff",
          padding: "0",
        }}>
          <div className="container">
            <div
              className="hide-scrollbar"
              style={{
                display: "flex", gap: "8px",
                overflowX: "auto",
                padding: "16px 0",
              }}
            >
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "6px", padding: "12px 20px",
                    background: "var(--color-bg-secondary)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    minWidth: "80px",
                    transition: "all var(--transition-fast)",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.background = "var(--color-primary-light)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.background = "var(--color-bg-secondary)";
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{cat.emoji}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text)" }}>{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Restaurants Section */}
      <section style={{ padding: "32px 0 64px" }}>
        <div className="container">
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>
                {search ? `Results for "${search}"` : "Restaurants near you"}
              </h2>
              {!loading && (
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", margin: 0 }}>
                  {restaurants.length} restaurant{restaurants.length !== 1 ? "s" : ""} available
                </p>
              )}
            </div>
          </div>

          {/* Loading skeletons */}
          {(loading || !location) && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "20px",
            }}>
              {[...Array(8)].map((_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          )}

          {/* Results */}
          {!loading && location && restaurants.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "20px",
              }}
            >
              {restaurants.map((res) => {
                const [resLng, resLat] = res.autoLocation.coordinates;
                const distance = getDistanceKm(location.latitude, location.longitude, resLat, resLng);
                return (
                  <RestaurantCard
                    key={res._id}
                    id={res._id}
                    name={res.name}
                    image={res.image ?? ""}
                    distance={`${distance}`}
                    isOpen={res.isOpen}
                  />
                );
              })}
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && location && restaurants.length === 0 && (
            <EmptyState
              icon="🍽️"
              title={search ? "No results found" : "No restaurants nearby"}
              description={
                search
                  ? `We couldn't find restaurants matching "${search}". Try a different search.`
                  : "We're expanding! Check back soon or try a different location."
              }
              action={search ? { label: "Clear search", onClick: () => window.history.pushState({}, "", "/") } : undefined}
            />
          )}
        </div>
      </section>

      {/* App Download CTA Banner */}
      {!search && !loading && (
        <section style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #c42f3a 100%)",
          padding: "48px 0",
        }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <h2 style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800, marginBottom: "8px" }}>
                Get the Zomato app
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "1rem" }}>
                Order faster, track live, and get exclusive app-only deals
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["App Store", "Play Store"].map((store) => (
                <div key={store} style={{
                  padding: "12px 24px",
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  borderRadius: "var(--radius-lg)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  transition: "background var(--transition-fast)",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                >
                  {store === "App Store" ? "🍎" : "🤖"} {store}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
