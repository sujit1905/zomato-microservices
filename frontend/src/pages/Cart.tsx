import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus, BiTrash, BiArrowBack } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/ui/EmptyState";

const Cart = () => {
  const { cart, subTotal, quauntity, fetchCart } = useAppData();
  const navigate = useNavigate();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse restaurants and add something delicious!"
          action={{ label: "Browse Restaurants", onClick: () => navigate("/") }}
        />
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;
  const freeDeliveryAt = 250;
  const progressPct = Math.min((subTotal / freeDeliveryAt) * 100, 100);

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchCart();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchCart();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear your cart?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCart();
      toast.success("Cart cleared");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "24px 0 64px" }}>
      <div className="container">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-text-muted)", fontWeight: 500,
            fontSize: "0.9rem", marginBottom: "20px",
            padding: 0,
          }}
        >
          <BiArrowBack size={18} />
          Back
        </button>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: "24px",
          alignItems: "start",
        }} className="cart-grid">

          {/* Left: Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Restaurant info */}
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              padding: "20px 24px", boxShadow: "var(--shadow-card)",
              display: "flex", alignItems: "center", gap: "16px",
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "var(--radius-md)",
                background: "var(--color-primary-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", flexShrink: 0,
              }}>
                🍽️
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "2px" }}>
                  {restaurant.name}
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
                  {restaurant.autoLocation.formattedAddress}
                </p>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: "var(--radius-full)",
                background: restaurant.isOpen ? "var(--color-success-bg)" : "var(--color-error-bg)",
                color: restaurant.isOpen ? "#16A34A" : "var(--color-error)",
                fontWeight: 700, fontSize: "0.75rem",
              }}>
                {restaurant.isOpen ? "OPEN" : "CLOSED"}
              </span>
            </div>

            {/* Cart Items */}
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)", overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 24px", borderBottom: "1px solid var(--color-border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>
                  Your Order ({quauntity} item{quauntity !== 1 ? "s" : ""})
                </h3>
                <button
                  onClick={clearCart}
                  disabled={clearingCart}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "none", border: "none",
                    color: "var(--color-error)", fontSize: "0.875rem",
                    fontWeight: 600, cursor: "pointer",
                    padding: "6px 10px", borderRadius: "var(--radius-sm)",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-error-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  {clearingCart ? <VscLoading className="animate-spin" size={14} /> : <BiTrash size={14} />}
                  Clear Cart
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <AnimatePresence>
                  {cart.map((cartItem: ICart) => {
                    const item = cartItem.itemId as IMenuItem;
                    const isLoading = loadingItemId === item._id;

                    return (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          display: "flex", gap: "16px", alignItems: "center",
                          padding: "20px 24px",
                          borderBottom: "1px solid var(--color-border-light)",
                        }}
                      >
                        {/* Image */}
                        <div style={{
                          width: "72px", height: "72px",
                          borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0,
                        }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{
                              width: "100%", height: "100%",
                              background: "var(--color-bg-secondary)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "1.5rem",
                            }}>🍴</div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: "4px" }}>
                            {item.name}
                          </h4>
                          <p style={{ fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 600, margin: 0 }}>
                            ₹{item.price} each
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button
                            disabled={isLoading}
                            onClick={() => decreaseQty(item._id)}
                            style={{
                              width: "32px", height: "32px",
                              border: "1.5px solid var(--color-primary)",
                              background: "#fff",
                              borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: "var(--color-primary)",
                              transition: "all var(--transition-fast)",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "var(--color-primary)";
                              e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "#fff";
                              e.currentTarget.style.color = "var(--color-primary)";
                            }}
                          >
                            {isLoading ? <VscLoading size={14} className="animate-spin" /> : <BiMinus size={16} />}
                          </button>

                          <span style={{
                            width: "32px", textAlign: "center",
                            fontWeight: 700, fontSize: "1rem", color: "var(--color-dark)",
                          }}>
                            {cartItem.quauntity}
                          </span>

                          <button
                            disabled={isLoading}
                            onClick={() => increaseQty(item._id)}
                            style={{
                              width: "32px", height: "32px",
                              border: "1.5px solid var(--color-primary)",
                              background: "var(--color-primary)",
                              borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: "#fff",
                              transition: "all var(--transition-fast)",
                            }}
                          >
                            {isLoading ? <VscLoading size={14} className="animate-spin" /> : <BiPlus size={16} />}
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p style={{
                          minWidth: "64px", textAlign: "right",
                          fontWeight: 700, fontSize: "1rem", color: "var(--color-dark)",
                        }}>
                          ₹{item.price * cartItem.quauntity}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right: Order Summary (sticky) */}
          <div style={{ position: "sticky", top: "88px" }}>
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)", overflow: "hidden",
            }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontWeight: 800, color: "var(--color-dark)", margin: 0, fontSize: "1.125rem" }}>
                  Order Summary
                </h3>
              </div>

              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Free delivery progress */}
                {deliveryFee > 0 && (
                  <div style={{
                    padding: "12px 14px",
                    background: "var(--color-primary-light)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "4px",
                  }}>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 600, marginBottom: "8px" }}>
                      Add ₹{freeDeliveryAt - subTotal} more for FREE delivery 🚀
                    </p>
                    <div style={{ height: "6px", background: "rgba(226,55,68,0.15)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        style={{ height: "100%", background: "var(--color-primary)", borderRadius: "var(--radius-full)" }}
                      />
                    </div>
                  </div>
                )}

                {[
                  { label: "Subtotal", value: `₹${subTotal}` },
                  {
                    label: "Delivery Fee",
                    value: deliveryFee === 0 ? (
                      <span style={{ color: "var(--color-success)", fontWeight: 600 }}>FREE 🎉</span>
                    ) : `₹${deliveryFee}`,
                  },
                  { label: "Platform Fee", value: `₹${platformFee}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)" }}>{label}</span>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-dark)" }}>{value as any}</span>
                  </div>
                ))}

                <div style={{ height: "1px", background: "var(--color-border)", margin: "4px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-dark)" }}>Grand Total</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)" }}>₹{grandTotal}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/checkout")}
                  disabled={!restaurant.isOpen}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: restaurant.isOpen ? "var(--color-primary)" : "#D1D5DB",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: restaurant.isOpen ? "pointer" : "not-allowed",
                    marginTop: "8px",
                    boxShadow: restaurant.isOpen ? "var(--shadow-primary)" : "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {!restaurant.isOpen ? "Restaurant is Closed" : "Proceed to Checkout →"}
                </motion.button>

                <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
                  🔒 Secure checkout with Razorpay & Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
