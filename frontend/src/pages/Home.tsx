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

/* ─── Professional SVG icons ─── */
const CATEGORIES = [
  {
    label: "Biryani",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="34" rx="18" ry="8" fill="#F59E0B" opacity=".25"/><path d="M8 28c0-8.837 7.163-16 16-16s16 7.163 16 16H8z" fill="#F59E0B"/><path d="M6 28h36a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4z" fill="#D97706"/><path d="M14 20c1-3 4-5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    label: "Pizza",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><path d="M24 6L42 38H6L24 6z" fill="#FDE68A"/><circle cx="24" cy="24" r="3" fill="#DC2626"/><circle cx="18" cy="30" r="2.5" fill="#DC2626"/><circle cx="30" cy="30" r="2.5" fill="#DC2626"/><path d="M6 38h36" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/></svg>,
  },
  {
    label: "Burger",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><path d="M8 20c0-8.837 7.163-16 16-16s16 7.163 16 16H8z" fill="#F59E0B"/><rect x="6" y="20" width="36" height="6" rx="2" fill="#16A34A"/><rect x="6" y="26" width="36" height="6" rx="2" fill="#EF4444"/><rect x="6" y="32" width="36" height="8" rx="3" fill="#D97706"/></svg>,
  },
  {
    label: "Chinese",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><path d="M24 8C14 8 8 20 8 28C8 36 15 42 24 42C33 42 40 36 40 28C40 20 34 8 24 8Z" fill="#EF4444" opacity=".85"/><path d="M16 22L20 34M28 22L24 34" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="20" r="3" fill="#FEF9C3"/></svg>,
  },
  {
    label: "Sushi",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="28" rx="16" ry="10" fill="#F1F5F9"/><ellipse cx="24" cy="26" rx="14" ry="8" fill="#fff" stroke="#E2E8F0" strokeWidth="1"/><ellipse cx="24" cy="24" rx="8" ry="5" fill="#EF4444"/><ellipse cx="24" cy="23" rx="6" ry="3.5" fill="#FCA5A5"/></svg>,
  },
  {
    label: "Desserts",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><path d="M16 26C16 18 32 18 32 26L30 38H18L16 26Z" fill="#FBBF24"/><path d="M20 14Q24 6 28 14" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" fill="none"/><circle cx="24" cy="14" r="3" fill="#EC4899"/></svg>,
  },
  {
    label: "Pasta",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><path d="M12 18Q18 28 24 22Q30 16 36 26" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M14 24Q20 34 26 28Q32 22 38 32" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M10 30Q16 40 22 34Q28 28 34 38" stroke="#FBBF24" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>,
  },
  {
    label: "Wraps",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><path d="M10 36L24 10L38 36Q30 44 18 40Q10 38 10 36Z" fill="#FDE68A"/><path d="M18 30Q24 18 30 30" fill="#16A34A" opacity=".7"/><path d="M20 34Q24 24 28 34" fill="#EF4444" opacity=".8"/></svg>,
  },
  {
    label: "Salads",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="30" rx="16" ry="10" fill="#BBF7D0"/><circle cx="18" cy="26" r="5" fill="#16A34A" opacity=".8"/><circle cx="28" cy="24" r="4" fill="#4ADE80" opacity=".9"/><circle cx="22" cy="32" r="4" fill="#EF4444" opacity=".8"/><circle cx="30" cy="30" r="3" fill="#FBBF24"/></svg>,
  },
  {
    label: "Smoothies",
    icon: <svg width="28" height="28" viewBox="0 0 48 48" fill="none"><path d="M16 14L18 38Q18 42 24 42Q30 42 30 38L32 14Z" fill="#A78BFA"/><path d="M14 14H34" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/><ellipse cx="24" cy="22" rx="6" ry="4" fill="#DDD6FE" opacity=".6"/></svg>,
  },
];

const OFFERS = [
  {
    title: "Free Delivery",
    desc: "On orders above ₹250",
    color: "#E23744",
    bg: "rgba(226,55,68,0.07)",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1 3h15v13H1V3zM16 8h4l3 3v5h-7V8z" stroke="#E23744" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="5.5" cy="18.5" r="2.5" stroke="#E23744" strokeWidth="1.8"/><circle cx="18.5" cy="18.5" r="2.5" stroke="#E23744" strokeWidth="1.8"/></svg>,
  },
  {
    title: "50% OFF",
    desc: "On your first 3 orders",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.07)",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z" stroke="#7C3AED" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  },
  {
    title: "Extra 10% Off",
    desc: "Pay with Stripe or Razorpay",
    color: "#D97706",
    bg: "rgba(217,119,6,0.07)",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#D97706" strokeWidth="1.8"/><path d="M2 10h20" stroke="#D97706" strokeWidth="1.8"/></svg>,
  },
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
  animate: { transition: { staggerChildren: 0.06 } },
};

const Home = () => {
  const { location, city } = useAppData();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      // When searching: fetch all restaurants globally (no location filter)
      // When browsing: show only nearby restaurants (requires location)
      const params: Record<string, string | number> = {};
      if (search) {
        params.search = search;
      } else if (location?.latitude && location?.longitude) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      } else {
        // No search and no location yet — wait
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`${restaurantService}/api/restaurant/all`, {
        params,
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

  const showSkeletons = loading || (!search && !location);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

      {/* Hero Section – clean white/light design */}
      {!search && (
        <section style={{
          background: "linear-gradient(135deg, #fff8f8 0%, #ffffff 45%, #fdf4ff 100%)",
          padding: "52px 0 44px",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--color-border-light)",
        }}>
          {/* Decorative blobs */}
          <div style={{
            position: "absolute", top: "-80px", right: "8%",
            width: "380px", height: "380px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(226,55,68,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-60px", left: "3%",
            width: "280px", height: "280px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              {/* Location pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                background: "rgba(226,55,68,0.07)",
                border: "1px solid rgba(226,55,68,0.18)",
                borderRadius: "var(--radius-full)",
                padding: "5px 14px",
                marginBottom: "18px",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E23744"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>
                <span style={{ color: "var(--color-primary)", fontSize: "0.8125rem", fontWeight: 600 }}>
                  Delivering to {city}
                </span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.875rem, 4.5vw, 3rem)",
                fontWeight: 900,
                color: "var(--color-dark)",
                lineHeight: 1.15,
                maxWidth: "580px",
                marginBottom: "14px",
              }}>
                Hungry? We've got{" "}
                <span style={{ color: "var(--color-primary)", position: "relative", display: "inline-block" }}>
                  thousands
                  <svg viewBox="0 0 200 10" preserveAspectRatio="none" style={{ position: "absolute", bottom: "-4px", left: 0, right: 0, width: "100%", height: "7px" }}>
                    <path d="M0 5 Q50 0 100 5 Q150 10 200 5" stroke="#E23744" strokeWidth="2" fill="none" opacity="0.35"/>
                  </svg>
                </span>{" "}
                of options
              </h1>

              <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", maxWidth: "460px", marginBottom: "28px", lineHeight: 1.6 }}>
                Order from top restaurants near you. Fast delivery, real-time tracking, and exclusive deals — every day.
              </p>

              {/* Offer pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {OFFERS.map((offer) => (
                  <motion.div
                    key={offer.title}
                    whileHover={{ scale: 1.03, y: -2 }}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      background: offer.bg,
                      border: `1px solid ${offer.color}22`,
                      borderRadius: "var(--radius-lg)",
                      padding: "11px 16px",
                      cursor: "default",
                    }}
                  >
                    <div style={{
                      width: "36px", height: "36px",
                      background: `${offer.color}14`,
                      borderRadius: "9px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {offer.icon}
                    </div>
                    <div>
                      <p style={{ color: offer.color, fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>{offer.title}</p>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.775rem", margin: 0 }}>{offer.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Category Chips with professional SVG icons */}
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
                display: "flex", gap: "10px",
                overflowX: "auto",
                padding: "16px 0",
              }}
            >
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "7px", padding: "12px 18px",
                    background: "var(--color-bg-secondary)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    minWidth: "80px",
                    transition: "all var(--transition-fast)",
                    flexShrink: 0,
                    outline: "none",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.background = "var(--color-primary-light)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(226,55,68,0.1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.background = "var(--color-bg-secondary)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ width: "28px", height: "28px" }}>{cat.icon}</div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text)" }}>{cat.label}</span>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>
                {search ? `Results for "${search}"` : "Restaurants near you"}
              </h2>
              {!loading && (
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
                  {search
                    ? `${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} found across all locations`
                    : `${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} available nearby`}
                </p>
              )}
            </div>
            {search && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(226,55,68,0.07)",
                border: "1px solid rgba(226,55,68,0.18)",
                borderRadius: "var(--radius-full)",
                padding: "5px 14px",
                fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 600,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#E23744" strokeWidth="2"/><path d="M20 20l-3-3" stroke="#E23744" strokeWidth="2" strokeLinecap="round"/></svg>
                Searching everywhere
              </div>
            )}
          </div>

          {/* Loading skeletons */}
          {showSkeletons && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
              {[...Array(8)].map((_, i) => <RestaurantCardSkeleton key={i} />)}
            </div>
          )}

          {/* Results */}
          {!loading && restaurants.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}
            >
              {restaurants.map((res) => {
                let distance = "N/A";
                if (location?.latitude && location?.longitude && res.autoLocation?.coordinates) {
                  const [resLng, resLat] = res.autoLocation.coordinates;
                  distance = `${getDistanceKm(location.latitude, location.longitude, resLat, resLng)}`;
                }
                return (
                  <RestaurantCard
                    key={res._id}
                    id={res._id}
                    name={res.name}
                    image={res.image ?? ""}
                    distance={distance}
                    isOpen={res.isOpen}
                  />
                );
              })}
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && !showSkeletons && restaurants.length === 0 && (
            <EmptyState
              icon="🍽️"
              title={search ? "No results found" : "No restaurants nearby"}
              description={
                search
                  ? `We couldn't find any restaurants matching "${search}". Try a different search term.`
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
          background: "linear-gradient(135deg, var(--color-primary) 0%, #b02030 100%)",
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
              {[
                {
                  label: "App Store",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C17.39 10.1 17.41 12.63 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></svg>,
                },
                {
                  label: "Play Store",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.18 23.55C3.44 23.85 3.82 24 4.22 23.98L13.64 14.56L10.5 11.42L3.18 23.55Z" fill="white"/><path d="M20.72 10.27L17.54 8.42L14.08 11.88L17.54 15.34L20.75 13.47C21.65 12.95 21.65 11.79 20.72 10.27Z" fill="rgba(255,255,255,0.8)"/><path d="M3.08 0.44C2.79 0.73 2.65 1.19 2.65 1.78V22.16C2.65 22.75 2.8 23.21 3.09 23.5L3.18 23.55L13.64 13.09V12.91L3.18 2.45L3.08 0.44Z" fill="rgba(255,255,255,0.65)"/><path d="M4.22 0.02C3.82 0 3.44 0.15 3.18 0.45L13.64 10.91L17.08 7.47L4.22 0.02Z" fill="rgba(255,255,255,0.9)"/></svg>,
                },
              ].map((store) => (
                <motion.div
                  key={store.label}
                  whileHover={{ scale: 1.04 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "11px 22px",
                    background: "rgba(255,255,255,0.16)",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    borderRadius: "var(--radius-lg)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    cursor: "pointer",
                  }}
                >
                  {store.icon} {store.label}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

