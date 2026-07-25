import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();

  // Random rating, delivery time, cuisines, price, and offers for visual richness
  const rating = (4.0 + Math.random() * 0.9).toFixed(1);
  const deliveryTime = `${20 + Math.floor(Math.random() * 20)}-${35 + Math.floor(Math.random() * 15)} mins`;
  const isVeg = name.toLowerCase().includes("veg") || Math.random() > 0.4;
  const cuisines = name.toLowerCase().includes("pizza") ? "Italian, Fast Food, Pizza" : (name.toLowerCase().includes("burger") ? "Burgers, Fast Food, Beverages" : "North Indian, Chinese, Continental");
  const priceForTwo = 150 + Math.floor(Math.random() * 8) * 50;
  const discountPercent = 10 * (1 + Math.floor(Math.random() * 5));

  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from Favorites" : "Added to Favorites! ❤️");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onClick={() => navigate(`/restaurant/${id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/restaurant/${id}`)}
      aria-label={`${name}, ${distance} km away, ${isOpen ? "Open" : "Closed"}`}
      style={{
        cursor: "pointer",
        borderRadius: "var(--radius-lg)",
        background: "#fff",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        transition: "box-shadow var(--transition-base)",
        outline: "none",
        opacity: !isOpen ? 0.85 : 1,
        position: "relative",
      }}
      className="card-hover"
    >
      {/* Image */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "60%", overflow: "hidden" }}>
        <img
          src={image}
          alt={name}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform var(--transition-slow)",
            filter: !isOpen ? "grayscale(60%)" : "none",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        />

        {/* Closed overlay */}
        {!isOpen && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1,
          }}>
            <span style={{
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.875rem",
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(255,255,255,0.15)",
              letterSpacing: "0.5px",
            }}>
              CLOSED
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          style={{
            position: "absolute", top: "10px", left: "10px", zIndex: 2,
            background: "rgba(255, 255, 255, 0.9)", border: "none",
            borderRadius: "50%", width: "32px", height: "32px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "var(--shadow-sm)",
            color: isFavorite ? "var(--color-primary)" : "var(--color-text-light)",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>

        {/* Discount Badge */}
        {isOpen && (
          <div style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 2 }}>
            <span style={{
              background: "var(--color-primary)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.75rem",
              padding: "4px 10px",
              borderRadius: "4px",
              boxShadow: "var(--shadow-sm)",
            }}>
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Veg/Non-veg Dot Indicator */}
        <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2, display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{
            background: "rgba(255,255,255,0.9)",
            border: `1px solid ${isVeg ? "#16A34A" : "#EF4444"}`,
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.625rem",
            fontWeight: 700,
            color: isVeg ? "#16A34A" : "#EF4444",
          }}>
            {isVeg ? "🟢 VEG" : "🔴 NON-VEG"}
          </span>
        </div>

        {/* Distance badge */}
        <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 2 }}>
          <span style={{
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
          }}>
            📍 {Number(distance).toFixed(1)} km
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <h3 style={{
            fontSize: "1.0625rem",
            fontWeight: 700,
            color: "var(--color-dark)",
            margin: "0 0 4px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}>
            {name}
          </h3>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            background: "#16A34A",
            color: "#fff",
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: "4px",
            flexShrink: 0,
          }}>
            ★ {rating}
          </span>
        </div>

        {/* Cuisines */}
        <p style={{
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
          margin: "2px 0 6px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {cuisines}
        </p>

        {/* Price & Delivery Time */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", borderTop: "1px solid var(--color-border-light)", paddingTop: "8px" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            ₹{priceForTwo} for two
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
            ⏱️ {deliveryTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
