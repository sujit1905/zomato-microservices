import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();

  // Random rating and delivery time for visual richness
  const rating = (4.0 + Math.random() * 0.9).toFixed(1);
  const deliveryTime = `${20 + Math.floor(Math.random() * 20)}-${35 + Math.floor(Math.random() * 15)} mins`;

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
          }}>
            <span style={{
              background: "rgba(0,0,0,0.75)",
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

        {/* Open badge */}
        {isOpen && (
          <div style={{ position: "absolute", top: "10px", right: "10px" }}>
            <span style={{
              background: "rgba(255,255,255,0.95)",
              color: "#16A34A",
              fontWeight: 700,
              fontSize: "0.6875rem",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(34,197,94,0.3)",
              letterSpacing: "0.3px",
            }}>
              OPEN
            </span>
          </div>
        )}

        {/* Distance badge */}
        <div style={{ position: "absolute", bottom: "10px", left: "10px" }}>
          <span style={{
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
          }}>
            📍 {distance} km
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--color-dark)",
          margin: "0 0 4px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {name}
        </h3>

        {/* Rating & Delivery */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: "#16A34A",
            color: "#fff",
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "4px",
          }}>
            ★ {rating}
          </span>
          <span style={{ color: "var(--color-border)", fontSize: "12px" }}>•</span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
            {deliveryTime}
          </span>
        </div>

        {/* Free delivery chip */}
        {isOpen && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: "var(--color-primary-light)",
            color: "var(--color-primary)",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
          }}>
            🎉 Free delivery above ₹250
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
