import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader, BiMapPin, BiPlus } from "react-icons/bi";
import { motion } from "framer-motion";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quauntity } = useAppData();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) { setLoadingAddress(false); return; }
      try {
        const { data } = await axios.get(`${restaurantService}/api/address/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAddresses(data || []);
      } catch {
        console.log("Failed to fetch addresses");
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses[0]._id);
    }
  }, [addresses, selectedAddressId]);

  if (!cart || cart.length === 0) {
    return (
      <div style={{ display: "flex", minHeight: "60vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "3rem", marginBottom: "12px" }}>🛒</p>
          <p style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-dark)" }}>Your cart is empty</p>
          <button onClick={() => navigate("/")} className="btn btn-primary" style={{ marginTop: "16px" }}>Browse Restaurants</button>
        </div>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        { paymentMethod, addressId: selectedAddressId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      return data;
    } catch {
      toast.error("Failed to create Order");
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;
      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsService}/api/payment/create`, { orderId });
      const { razorpayOrderId, key } = data;
      const options = {
        key, amount: amount * 100, currency: "INR",
        name: "Zomato",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            toast.success("Payment successful 🎉");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#E23744" },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Payment failed. Please refresh page.");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;
      const { orderId } = order;
      const { data } = await axios.post(
        `${utilsService}/api/payment/stripe/create`,
        { orderId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (data.url) window.location.href = data.url;
      else toast.error("Failed to create payment session");
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoadingStripe(false);
    }
  };

  const steps = ["Delivery Address", "Order Summary", "Payment"];

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "32px 0 64px" }}>
      <div className="container">
        {/* Page header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "8px" }}>
            Checkout
          </h1>
          {/* Steps indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "16px" }}>
            {steps.map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{step}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: "64px", height: "2px", background: "var(--color-border)", margin: "0 4px", marginBottom: "20px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "24px", alignItems: "start",
        }} className="checkout-grid">

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Restaurant */}
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              padding: "20px 24px", boxShadow: "var(--shadow-card)",
              display: "flex", alignItems: "center", gap: "14px",
            }}>
              <span style={{ fontSize: "1.5rem" }}>🏪</span>
              <div>
                <p style={{ fontWeight: 700, color: "var(--color-dark)", fontSize: "1rem", marginBottom: "2px" }}>{restaurant.name}</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>{restaurant.autoLocation.formattedAddress}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)", overflow: "hidden",
            }}>
              <div style={{
                padding: "18px 24px", borderBottom: "1px solid var(--color-border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BiMapPin size={20} color="var(--color-primary)" />
                  <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Delivery Address</h3>
                </div>
                <button
                  onClick={() => navigate("/address")}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "none", border: "none",
                    color: "var(--color-primary)", fontWeight: 600,
                    fontSize: "0.875rem", cursor: "pointer",
                  }}
                >
                  <BiPlus size={16} />
                  Add New
                </button>
              </div>

              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {loadingAddress ? (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <div style={{ padding: "16px 0" }}>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: "12px" }}>No address found. Please add one.</p>
                    <button onClick={() => navigate("/address")} className="btn btn-primary btn-sm">
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <label
                      key={addr._id}
                      style={{
                        display: "flex", gap: "14px", alignItems: "flex-start",
                        padding: "16px",
                        border: `1.5px solid ${selectedAddressId === addr._id ? "var(--color-primary)" : "var(--color-border)"}`,
                        borderRadius: "var(--radius-lg)",
                        cursor: "pointer",
                        background: selectedAddressId === addr._id ? "var(--color-primary-light)" : "#fff",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        style={{ marginTop: "2px", accentColor: "var(--color-primary)" }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, color: "var(--color-dark)", marginBottom: "3px", fontSize: "0.9375rem" }}>
                          {addr.formattedAddress}
                        </p>
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
                          📱 {addr.mobile}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Order items */}
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)", overflow: "hidden",
            }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Order Items</h3>
              </div>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {cart.map((cartItem: ICart) => {
                  const item = cartItem.itemId as IMenuItem;
                  return (
                    <div key={cartItem._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{
                          width: "24px", height: "24px", borderRadius: "50%",
                          background: "var(--color-bg-secondary)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)",
                          border: "1px solid var(--color-border)",
                        }}>
                          {cartItem.quauntity}
                        </span>
                        <span style={{ fontSize: "0.9375rem", color: "var(--color-text)" }}>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--color-dark)" }}>₹{item.price * cartItem.quauntity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Payment & Summary */}
          <div style={{ position: "sticky", top: "88px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Price breakdown */}
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)", overflow: "hidden",
            }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Bill Summary</h3>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: `Items (${quauntity})`, value: `₹${subTotal}` },
                  { label: "Delivery Fee", value: deliveryFee === 0 ? "FREE 🎉" : `₹${deliveryFee}` },
                  { label: "Platform Fee", value: `₹${platformFee}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>{label}</span>
                    <span style={{
                      fontWeight: 600, fontSize: "0.9375rem",
                      color: value === "FREE 🎉" ? "var(--color-success)" : "var(--color-dark)",
                    }}>{value}</span>
                  </div>
                ))}

                <div style={{ height: "1px", background: "var(--color-border)", margin: "4px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-dark)" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)" }}>₹{grandTotal}</span>
                </div>

                {subTotal < 250 && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-primary)", margin: "4px 0 0", fontWeight: 500 }}>
                    💡 Add ₹{250 - subTotal} more for free delivery
                  </p>
                )}
              </div>
            </div>

            {/* Payment methods */}
            <div style={{
              background: "#fff", borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-card)", overflow: "hidden",
            }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BiCreditCard size={20} color="var(--color-primary)" />
                  <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Choose Payment</h3>
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Razorpay */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
                  onClick={payWithRazorpay}
                  style={{
                    width: "100%", padding: "15px 20px",
                    background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
                    color: "#fff", border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: 700, fontSize: "0.9375rem",
                    cursor: !selectedAddressId ? "not-allowed" : "pointer",
                    opacity: !selectedAddressId ? 0.6 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
                  }}
                >
                  {loadingRazorpay ? <BiLoader size={20} className="animate-spin" /> : "💳"}
                  Pay with Razorpay
                </motion.button>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>or</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
                </div>

                {/* Stripe */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={!selectedAddressId || loadingStripe || creatingOrder}
                  onClick={payWithStripe}
                  style={{
                    width: "100%", padding: "15px 20px",
                    background: "linear-gradient(135deg, #1C1C1C, #2D2D2D)",
                    color: "#fff", border: "none",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: 700, fontSize: "0.9375rem",
                    cursor: !selectedAddressId ? "not-allowed" : "pointer",
                    opacity: !selectedAddressId ? 0.6 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  {loadingStripe ? <BiLoader size={20} className="animate-spin" /> : "⚡"}
                  Pay with Stripe
                </motion.button>

                <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  🔒 100% Secure & Encrypted Payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
