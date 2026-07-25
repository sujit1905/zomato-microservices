import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";
import { motion, AnimatePresence } from "framer-motion";

type Role = "customer" | "rider" | "seller" | null;

const ROLE_CONFIG = {
  customer: { emoji: "🛒", label: "Customer", desc: "Order food from restaurants near you", color: "var(--color-primary)", bg: "var(--color-primary-light)" },
  seller: { emoji: "🍽️", label: "Restaurant Owner", desc: "Manage your restaurant, menu & orders", color: "#7C3AED", bg: "#F5F3FF" },
  rider: { emoji: "🏍️", label: "Delivery Rider", desc: "Earn by delivering food to customers", color: "#0891B2", bg: "#ECFEFF" },
};

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const addRole = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const roles: Role[] = ["customer", "seller", "rider"];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1C1C1C 0%, #2D1B1B 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: "-100px", right: "10%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(226,55,68,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-80px", left: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "560px", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🍅</div>
          <h1 style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, marginBottom: "10px" }}>
            Join Zomato as...
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", margin: 0 }}>
            Choose how you want to use the platform
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
          {roles.map((r, i) => {
            if (!r) return null;
            const config = ROLE_CONFIG[r];
            const isSelected = role === r;
            return (
              <motion.button
                key={r}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole(r)}
                style={{
                  display: "flex", alignItems: "center", gap: "20px",
                  padding: "20px 24px",
                  background: isSelected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                  border: `2px solid ${isSelected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "var(--radius-xl)", cursor: "pointer",
                  textAlign: "left", transition: "all var(--transition-fast)",
                  backdropFilter: "blur(8px)",
                  boxShadow: isSelected ? "0 8px 32px rgba(226,55,68,0.2)" : "none",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: "56px", height: "56px", borderRadius: "var(--radius-lg)",
                  background: isSelected ? config.bg : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.75rem", flexShrink: 0,
                  transition: "background var(--transition-fast)",
                }}>
                  {config.emoji}
                </div>
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.0625rem", margin: "0 0 4px" }}>{config.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", margin: 0 }}>{config.desc}</p>
                </div>
                {/* Radio */}
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  border: `2px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.3)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  transition: "all var(--transition-fast)",
                }}>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fff" }} />
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!role || loading}
          onClick={addRole}
          style={{
            width: "100%", padding: "17px",
            background: role ? "var(--color-primary)" : "rgba(255,255,255,0.15)",
            color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
            fontWeight: 700, fontSize: "1.0625rem", cursor: !role ? "not-allowed" : "pointer",
            boxShadow: role ? "var(--shadow-primary)" : "none",
            transition: "all var(--transition-base)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          }}
        >
          {loading ? (
            <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" /></svg>Setting up...</>
          ) : (
            role ? `Continue as ${ROLE_CONFIG[role]?.label} →` : "Select your role to continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SelectRole;
