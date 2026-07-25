import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { authService, restaurantService } from "../main";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiUser, BiPackage, BiMapPin, BiHeart, BiBell,
  BiCreditCard, BiCog, BiLockOpen, BiLogOut,
  BiLoader, BiCheck
} from "react-icons/bi";
import type { IOrder } from "../types";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
  title?: string;
  houseNumber?: string;
  apartment?: string;
  landmark?: string;
  pinCode?: string;
  isDefault?: boolean;
}

type TabType =
  | "profile"
  | "orders"
  | "addresses"
  | "wishlist"
  | "notifications"
  | "payments"
  | "settings"
  | "password";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Profile inputs
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.image || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Change password inputs
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Wishlist, Notifications mock states
  const [wishlist, setWishlist] = useState<any[]>([
    { id: "1", name: "Pizza Hut", cuisine: "Italian, Pizza", rating: "4.2", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
    { id: "2", name: "Biryani Zone", cuisine: "North Indian, Biryani", rating: "4.4", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500" }
  ]);

  const [notifications, setNotifications] = useState<any[]>([
    { id: "1", title: "Order Delivered", message: "Your order from Pizza Hut has been delivered successfully.", time: "1 hour ago", read: false },
    { id: "2", title: "Mega Offer!", message: "Get 50% discount on your first order using code ZOMATO50.", time: "1 day ago", read: true }
  ]);

  const [cardDetails, setCardDetails] = useState<any[]>([
    { id: "1", brand: "Visa", last4: "4242", expiry: "12/28", holder: user?.name || "Cardholder" },
    { id: "2", brand: "Mastercard", last4: "8890", expiry: "06/29", holder: user?.name || "Cardholder" }
  ]);

  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushAlerts: true,
    weeklyDigest: false,
    orderSms: true
  });

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";

  // Fetch orders when orders tab is open
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/myorder`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch {
      console.log("Failed to fetch orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch saved addresses when addresses tab is open
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAddresses(data || []);
    } catch {
      console.log("Failed to fetch addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) {
      toast.error("Name cannot be empty");
      return;
    }
    setUpdatingProfile(true);
    try {
      // Simulate/mock save: In real microservices, admin or user endpoints can handle this. We will update the state directly.
      if (user) {
        setUser({ ...user, name: profileName, image: profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png" });
        toast.success("Profile updated successfully!");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill in new password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message || "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const removeWishlist = (id: string) => {
    setWishlist(wishlist.filter(w => w.id !== id));
    toast.success("Removed from wishlist");
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteSavedCard = (id: string) => {
    setCardDetails(cardDetails.filter(c => c.id !== id));
    toast.success("Card removed successfully");
  };

  const tabsConfig = [
    { key: "profile", label: "Profile", icon: <BiUser size={18} /> },
    { key: "orders", label: "Orders", icon: <BiPackage size={18} /> },
    { key: "addresses", label: "Addresses", icon: <BiMapPin size={18} /> },
    { key: "wishlist", label: "Wishlist", icon: <BiHeart size={18} /> },
    { key: "notifications", label: "Notifications", icon: <BiBell size={18} /> },
    { key: "payments", label: "Payments", icon: <BiCreditCard size={18} /> },
    { key: "settings", label: "Settings", icon: <BiCog size={18} /> },
    { key: "password", label: "Password", icon: <BiLockOpen size={18} /> },
  ];

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "40px 0 80px" }}>
      <div className="container" style={{ maxWidth: "1040px" }}>
        
        {/* Profile Card Header banner */}
        <div style={{
          background: "#fff", borderRadius: "var(--radius-xl)", overflow: "hidden",
          boxShadow: "var(--shadow-card)", marginBottom: "32px", display: "flex", flexWrap: "wrap",
          border: "1px solid var(--color-border-light)"
        }}>
          <div style={{ flex: 1, padding: "24px 32px", display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "var(--color-primary-light)",
              border: "3px solid var(--color-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)",
              overflow: "hidden"
            }}>
              {user?.image ? (
                <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : firstLetter}
            </div>
            <div>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--color-dark)", margin: "0 0 2px" }}>
                {user?.name}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
                {user?.email} · <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.8125rem" }}>{user?.role?.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <div style={{ padding: "24px 32px", display: "flex", alignItems: "center" }}>
            <button onClick={logoutHandler} className="btn btn-danger" style={{ gap: "8px" }}>
              <BiLogOut /> Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "32px" }} className="dashboard-grid">
          
          {/* Navigation Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }} className="dashboard-sidebar">
            {tabsConfig.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as TabType)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 18px", borderRadius: "10px",
                  fontWeight: activeTab === t.key ? 700 : 500,
                  fontSize: "0.9375rem",
                  background: activeTab === t.key ? "var(--color-primary-light)" : "transparent",
                  color: activeTab === t.key ? "var(--color-primary)" : "var(--color-text-muted)",
                  transition: "all var(--transition-fast)", textAlign: "left", cursor: "pointer"
                }}
                onMouseEnter={e => {
                  if (activeTab !== t.key) e.currentTarget.style.background = "#fff";
                }}
                onMouseLeave={e => {
                  if (activeTab !== t.key) e.currentTarget.style.background = "transparent";
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Active Tab View Panel */}
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", padding: "32px", boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border-light)", minHeight: "450px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* 1. Profile Tab */}
                {activeTab === "profile" && (
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", marginBottom: "20px" }}>Profile Information</h3>
                    <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Profile Photo URL</label>
                        <input
                          type="text"
                          value={profileImage}
                          onChange={(e) => setProfileImage(e.target.value)}
                          className="input-field"
                          placeholder="Link to your avatar photo..."
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-light)", marginBottom: "6px" }}>Email Address (Non-editable)</label>
                        <input
                          type="text"
                          value={user?.email}
                          disabled
                          className="input-field"
                          style={{ background: "var(--color-bg-secondary)", cursor: "not-allowed" }}
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={updatingProfile}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-start", marginTop: "12px", padding: "12px 24px" }}
                      >
                        {updatingProfile ? <BiLoader className="animate-spin" size={18} /> : <BiCheck size={18} />}
                        Save Changes
                      </motion.button>
                    </form>
                  </div>
                )}

                {/* 2. Orders Tab */}
                {activeTab === "orders" && (
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", marginBottom: "20px" }}>Recent Orders</h3>
                    {loadingOrders ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                        <BiLoader className="animate-spin" size={32} color="var(--color-primary)" />
                      </div>
                    ) : orders.length === 0 ? (
                      <p style={{ color: "var(--color-text-muted)" }}>No past orders found.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {orders.map(o => (
                          <div key={o._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", border: "1px solid var(--color-border)", borderRadius: "12px", background: "var(--color-bg-secondary)" }}>
                            <div>
                              <p style={{ fontWeight: 700, margin: "0 0 2px" }}>{o.restaurantName}</p>
                              <p style={{ fontSize: "0.75rem", color: "var(--color-text-light)", margin: "0 0 4px" }}>Order #{o._id.slice(-8).toUpperCase()}</p>
                              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
                                {o.items.map(i => `${i.name} x${i.quauntity}`).join(", ")}
                              </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p style={{ fontWeight: 800, color: "var(--color-primary)", margin: "0 0 4px" }}>₹{o.totalAmount}</p>
                              <span style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.06)", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>{o.status.toUpperCase()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Saved Addresses Tab */}
                {activeTab === "addresses" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", margin: 0 }}>Delivery Addresses</h3>
                      <button onClick={() => navigate("/address")} className="btn btn-primary btn-sm">Manage / Add</button>
                    </div>
                    {loadingAddresses ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                        <BiLoader className="animate-spin" size={32} color="var(--color-primary)" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <p style={{ color: "var(--color-text-muted)" }}>No saved delivery locations.</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="dashboard-address-grid">
                        {addresses.map(addr => (
                          <div key={addr._id} style={{ padding: "16px", border: "1px solid var(--color-border)", borderRadius: "12px", background: "var(--color-bg-secondary)" }}>
                            <span style={{ fontSize: "0.75rem", background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: 700, padding: "2px 8px", borderRadius: "4px" }}>
                              {addr.title || "Home"}
                            </span>
                            <p style={{ fontWeight: 600, fontSize: "0.875rem", margin: "8px 0 2px" }}>
                              {addr.houseNumber ? `${addr.houseNumber}, ` : ""}{addr.apartment ? `${addr.apartment}, ` : ""}{addr.formattedAddress}
                            </p>
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>📱 {addr.mobile}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Wishlist Tab */}
                {activeTab === "wishlist" && (
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", marginBottom: "20px" }}>Favorite Restaurants</h3>
                    {wishlist.length === 0 ? (
                      <p style={{ color: "var(--color-text-muted)" }}>No favorites added yet.</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="dashboard-wishlist-grid">
                        {wishlist.map(w => (
                          <div key={w.id} style={{ display: "flex", gap: "14px", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
                            <img src={w.image} alt={w.name} style={{ width: "90px", height: "90px", objectFit: "cover" }} />
                            <div style={{ padding: "10px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                              <div>
                                <h4 style={{ fontWeight: 700, fontSize: "0.9375rem", margin: "0 0 2px" }}>{w.name}</h4>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>{w.cuisine}</p>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#fff", background: "#16A34A", fontSize: "0.75rem", fontWeight: 700, padding: "1px 6px", borderRadius: "4px" }}>★ {w.rating}</span>
                                <button onClick={() => removeWishlist(w.id)} style={{ color: "var(--color-error)", fontSize: "0.75rem", fontWeight: 600 }}>Remove</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Notifications Tab */}
                {activeTab === "notifications" && (
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", marginBottom: "20px" }}>Alert Center</h3>
                    {notifications.length === 0 ? (
                      <p style={{ color: "var(--color-text-muted)" }}>All caught up!</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            style={{
                              padding: "16px", border: "1px solid var(--color-border)", borderRadius: "12px", cursor: "pointer",
                              background: n.read ? "none" : "var(--color-primary-light)",
                              borderColor: n.read ? "var(--color-border)" : "rgba(226,55,68,0.2)",
                              transition: "all var(--transition-fast)"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                              <h4 style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-dark)", margin: 0 }}>{n.title}</h4>
                              <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>{n.time}</span>
                            </div>
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Payment Methods Tab */}
                {activeTab === "payments" && (
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", marginBottom: "20px" }}>Saved Credit & Debit Cards</h3>
                    {cardDetails.length === 0 ? (
                      <p style={{ color: "var(--color-text-muted)" }}>No cards saved.</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="dashboard-cards-grid">
                        {cardDetails.map(c => (
                          <div key={c.id} style={{
                            padding: "20px", background: "linear-gradient(135deg, #1C1C1C 0%, #2D2D2D 100%)",
                            borderRadius: "14px", color: "#fff", display: "flex", flexDirection: "column",
                            justifyContent: "space-between", height: "130px", boxShadow: "var(--shadow-md)"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <span style={{ fontWeight: 800, fontSize: "0.875rem", fontStyle: "italic" }}>{c.brand}</span>
                              <button onClick={() => deleteSavedCard(c.id)} style={{ color: "#EF4444", fontSize: "0.75rem", fontWeight: 600 }}>Remove</button>
                            </div>
                            <p style={{ letterSpacing: "1.5px", fontWeight: 700, fontSize: "1.0625rem", margin: 0 }}>•••• •••• •••• {c.last4}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", opacity: 0.8 }}>
                              <span>{c.holder.toUpperCase()}</span>
                              <span>EXP: {c.expiry}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Settings Tab */}
                {activeTab === "settings" && (
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", marginBottom: "20px" }}>Account Settings</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {[
                        { key: "emailAlerts", label: "Email Promotions", desc: "Receive email updates for local deals and offers." },
                        { key: "pushAlerts", label: "Push Notifications", desc: "Receive desktop updates on food dispatch and deliveries." },
                        { key: "weeklyDigest", label: "Weekly Newsletter", desc: "Digest summarizing top trending restaurants nearby." },
                        { key: "orderSms", label: "Transactional SMS Alerts", desc: "Receive text status messages directly on your phone." }
                      ].map(item => (
                        <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ fontWeight: 700, margin: "0 0 2px", fontSize: "0.9375rem" }}>{item.label}</p>
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={(settings as any)[item.key]}
                            onChange={(e) => {
                              setSettings({ ...settings, [item.key]: e.target.checked });
                              toast.success("Preferences updated!");
                            }}
                            style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)", cursor: "pointer" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Password Tab */}
                {activeTab === "password" && (
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-dark)", marginBottom: "20px" }}>Change Account Password</h3>
                    <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Old Password</label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="input-field"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field"
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="input-field"
                          placeholder="Re-enter new password"
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={updatingPassword}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-start", marginTop: "12px", padding: "12px 24px" }}
                      >
                        {updatingPassword ? <BiLoader className="animate-spin" size={18} /> : <BiCheck size={18} />}
                        Update Password
                      </motion.button>
                    </form>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .dashboard-sidebar { flex-direction: row !important; overflow-x: auto !important; padding-bottom: 8px !important; }
          .dashboard-sidebar button { flex-shrink: 0 !important; }
          .dashboard-address-grid, .dashboard-wishlist-grid, .dashboard-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Account;
