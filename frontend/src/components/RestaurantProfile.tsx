import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiMapPin, BiEdit, BiSave, BiX, BiPhone } from "react-icons/bi";
import { useAppData } from "../context/AppContext";
import { motion } from "framer-motion";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description || "");
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    await axios.put(
      `${restaurantService}/api/restaurant/status`,
      { status: false },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <div style={{
      borderRadius: "var(--radius-xl)",
      background: "#fff",
      boxShadow: "var(--shadow-card)",
      overflow: "hidden",
    }}>
      {/* Cover Image */}
      <div style={{
        width: "100%", height: "200px", position: "relative",
        background: "linear-gradient(135deg, #1C1C1C 0%, #2D1B1B 100%)",
      }}>
        {restaurant.image && (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
        }} />

        {/* Open/Closed badge on image */}
        <div style={{ position: "absolute", top: "16px", right: "16px" }}>
          <span style={{
            padding: "6px 16px",
            borderRadius: "var(--radius-full)",
            fontWeight: 700,
            fontSize: "0.8125rem",
            background: isOpen ? "#16A34A" : "#EF4444",
            color: "#fff",
            letterSpacing: "0.5px",
          }}>
            {isOpen ? "● OPEN" : "● CLOSED"}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}
              />
            ) : (
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "6px" }}>
                {restaurant.name}
              </h2>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <BiMapPin size={14} color="var(--color-primary)" />
                {restaurant.autoLocation.formattedAddress || "Location unavailable"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <BiPhone size={14} color="var(--color-primary)" />
                {restaurant.phone}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            {isSeller && editMode && (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={saveChanges}
                  disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 16px",
                    background: "#2563EB",
                    color: "#fff",
                    border: "none", borderRadius: "var(--radius-md)",
                    fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
                  }}
                >
                  <BiSave size={16} />
                  {loading ? "Saving..." : "Save"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(false)}
                  style={{
                    padding: "8px",
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                  }}
                >
                  <BiX size={18} />
                </motion.button>
              </>
            )}

            {isSeller && !editMode && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                style={{
                  padding: "8px 16px",
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem", fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                  color: "var(--color-text)",
                }}
              >
                <BiEdit size={16} />
                Edit
              </motion.button>
            )}
          </div>
        </div>

        {/* Description */}
        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for your restaurant..."
            className="input-field"
            rows={3}
            style={{ resize: "none", marginBottom: "16px" }}
          />
        ) : restaurant.description ? (
          <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", marginBottom: "16px", lineHeight: 1.6 }}>
            {restaurant.description}
          </p>
        ) : null}

        {/* Seller controls */}
        {isSeller && (
          <div style={{
            display: "flex", gap: "10px", flexWrap: "wrap",
            paddingTop: "16px", borderTop: "1px solid var(--color-border)",
          }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleOpenStatus}
              style={{
                padding: "10px 20px",
                background: isOpen ? "var(--color-error)" : "var(--color-success)",
                color: "#fff",
                border: "none", borderRadius: "var(--radius-md)",
                fontWeight: 600, fontSize: "0.9375rem", cursor: "pointer",
                transition: "background var(--transition-fast)",
              }}
            >
              {isOpen ? "Close Restaurant" : "Open Restaurant"}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={logoutHandler}
              style={{
                padding: "10px 20px",
                background: "var(--color-bg-secondary)",
                color: "var(--color-error)",
                border: "1px solid #FECACA",
                borderRadius: "var(--radius-md)",
                fontWeight: 600, fontSize: "0.9375rem", cursor: "pointer",
              }}
            >
              Logout
            </motion.button>

            {restaurant.isVerified ? (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 16px",
                background: "var(--color-success-bg)",
                color: "#16A34A",
                borderRadius: "var(--radius-md)",
                fontWeight: 600, fontSize: "0.875rem",
              }}>
                ✓ Verified Restaurant
              </span>
            ) : (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 16px",
                background: "var(--color-warning-bg)",
                color: "#D97706",
                borderRadius: "var(--radius-md)",
                fontWeight: 600, fontSize: "0.875rem",
              }}>
                ⏳ Pending Verification
              </span>
            )}
          </div>
        )}

        {/* Created date */}
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-light)", marginTop: "12px" }}>
          On Zomato since {new Date(restaurant.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
