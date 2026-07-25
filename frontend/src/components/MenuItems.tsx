import { useState } from "react";
import type { IMenuItem } from "../types";
import { FiEyeOff } from "react-icons/fi";
import { BsEye } from "react-icons/bs";
import { BiTrash, BiPlus } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const { fetchCart } = useAppData();

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;
    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Item deleted");
      onItemDeleted();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailability = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      onItemDeleted();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId, itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message);
      setAddedItems((prev) => new Set(prev).add(itemId));
      fetchCart();
      setTimeout(() => {
        setAddedItems((prev) => { const n = new Set(prev); n.delete(itemId); return n; });
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add");
    } finally {
      setLoadingItemId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🍽️</p>
        <p style={{ fontWeight: 600, color: "var(--color-dark)" }}>No menu items yet</p>
        {isSeller && <p style={{ fontSize: "0.875rem" }}>Add your first item using the tab above</p>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--color-border)" }}>
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;
        const isAdded = addedItems.has(item._id);

        return (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", gap: "16px", padding: "20px 24px",
              background: item.isAvailable ? "#fff" : "var(--color-bg-secondary)",
              alignItems: "flex-start",
              opacity: !item.isAvailable ? 0.75 : 1,
              transition: "background var(--transition-fast)",
            }}
          >
            {/* Veg/non-veg dot */}
            <div style={{ paddingTop: "2px", flexShrink: 0 }}>
              <div style={{
                width: "16px", height: "16px",
                border: "2px solid #16A34A",
                borderRadius: "3px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16A34A" }} />
              </div>
            </div>

            {/* Item info */}
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px" }}>
                {item.name}
              </h4>
              {item.description && (
                <p style={{
                  fontSize: "0.875rem", color: "var(--color-text-muted)",
                  lineHeight: 1.5, marginBottom: "10px",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden",
                }}>
                  {item.description}
                </p>
              )}
              <p style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-dark)" }}>
                ₹{item.price}
              </p>
            </div>

            {/* Image + CTA */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      filter: !item.isAvailable ? "grayscale(60%)" : "none",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    background: "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem",
                  }}>🍴</div>
                )}
              </div>

              {/* Unavailable overlay */}
              {!item.isAvailable && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "var(--radius-lg)",
                  background: "rgba(0,0,0,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "#fff", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Unavailable</span>
                </div>
              )}

              {/* Add to cart button (customer) */}
              {!isSeller && (
                <div style={{ position: "absolute", bottom: "-12px", left: "50%", transform: "translateX(-50%)", width: "max-content" }}>
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        style={{
                          background: "var(--color-success)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.8125rem",
                          padding: "6px 14px",
                          borderRadius: "var(--radius-full)",
                          boxShadow: "0 2px 8px rgba(34,197,94,0.4)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ✓ Added
                      </motion.div>
                    ) : (
                      <motion.button
                        key="add"
                        whileTap={{ scale: 0.94 }}
                        disabled={!item.isAvailable || isLoading}
                        onClick={() => addToCart(item.restaurantId, item._id)}
                        style={{
                          background: "#fff",
                          border: "1.5px solid var(--color-primary)",
                          color: "var(--color-primary)",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          padding: "6px 18px",
                          borderRadius: "var(--radius-full)",
                          cursor: !item.isAvailable ? "not-allowed" : "pointer",
                          boxShadow: "var(--shadow-sm)",
                          display: "flex", alignItems: "center", gap: "6px",
                          whiteSpace: "nowrap",
                          opacity: !item.isAvailable ? 0.5 : 1,
                        }}
                      >
                        {isLoading ? (
                          <VscLoading size={14} className="animate-spin" />
                        ) : (
                          <BiPlus size={16} />
                        )}
                        {isLoading ? "Adding..." : "ADD"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Seller actions */}
              {isSeller && (
                <div style={{ display: "flex", gap: "6px", marginTop: "8px", justifyContent: "center" }}>
                  <button
                    onClick={() => toggleAvailability(item._id)}
                    title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    style={{
                      padding: "6px", borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      background: "#fff", cursor: "pointer",
                      color: "var(--color-text-muted)",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {item.isAvailable ? <BsEye size={16} /> : <FiEyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    title="Delete item"
                    style={{
                      padding: "6px", borderRadius: "var(--radius-sm)",
                      border: "1px solid #FECACA",
                      background: "var(--color-error-bg)", cursor: "pointer",
                      color: "var(--color-error)",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <BiTrash size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MenuItems;
