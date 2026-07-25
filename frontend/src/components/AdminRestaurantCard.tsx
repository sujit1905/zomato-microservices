import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { BiMapPin, BiPhone, BiCheck, BiLoader } from "react-icons/bi";

interface Props {
  restaurant: any;
  onVerify: () => void;
}

const AdminRestaurantCard = ({ restaurant, onVerify }: Props) => {
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${adminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Restaurant verified successfully! 🎉");
      onVerify();
    } catch {
      toast.error("Failed to verify restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      style={{
        background: "#fff",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        border: "1px solid var(--color-border-light)",
      }}
    >
      {/* Cover Image */}
      <div style={{ height: "140px", position: "relative", background: "var(--color-bg-secondary)" }}>
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🏪</div>
        )}
        <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
          <span style={{
            background: "rgba(0,0,0,0.65)", color: "#fff",
            fontWeight: 700, fontSize: "0.6875rem", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: "var(--radius-full)",
            letterSpacing: "0.5px", backdropFilter: "blur(4px)",
          }}>
            Pending Verification
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--color-dark)", margin: "0 0 4px" }}>
            {restaurant.name}
          </h3>
          {restaurant.description && (
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "0 0 8px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
              {restaurant.description}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "var(--color-text)" }}>
            <BiPhone size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <span>{restaurant.phone || "No phone contact"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            <BiMapPin size={14} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, lineHeight: 1.3 }}>
              {restaurant.autoLocation?.formattedAddress || "Location unavailable"}
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          onClick={verify}
          style={{
            width: "100%", padding: "11px",
            background: "var(--color-success)",
            color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
            fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
            marginTop: "8px",
          }}
        >
          {loading ? <BiLoader size={16} className="animate-spin" /> : <BiCheck size={18} />}
          {loading ? "Verifying..." : "Verify & Approve"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AdminRestaurantCard;
