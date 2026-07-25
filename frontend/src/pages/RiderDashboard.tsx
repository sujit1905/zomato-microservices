import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload, BiUser, BiPhone, BiBell } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/faaah.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import { motion, AnimatePresence } from "framer-motion";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Notification sound enabled");
    } catch {
      toast.error("Interaction required. Tap again to enable sound");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 60000);
    };

    socket.on("order:available", onOrderAvailable);
    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfile(data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setCurrentOrder(data.order);
    } catch {
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailability = async () => {
    if (!navigator.geolocation) {
      toast.error("Location access is required to go online");
      return;
    }

    setToggling(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.patch(
            `${riderService}/api/rider/toggle`,
            {
              isAvailble: !profile?.isAvailble,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          toast.success(profile?.isAvailble ? "You are offline" : "You are online & ready to deliver! 🏍️");
          fetchProfile();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to update availability");
        } finally {
          setToggling(false);
        }
      },
      () => {
        toast.error("Location permission denied. Please enable location to go online.");
        setToggling(false);
      }
    );
  };

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !aadharNumber || !drivingLicenseNumber || !image) {
      toast.error("All fields and profile picture are required");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Location access required to register");
      return;
    }

    setSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const formData = new FormData();
        formData.append("phoneNumber", phoneNumber);
        formData.append("aadharNumber", aadharNumber);
        formData.append("drivingLicenseNumber", drivingLicenseNumber);
        formData.append("latitude", pos.coords.latitude.toString());
        formData.append("longitude", pos.coords.longitude.toString());
        if (image) formData.append("file", image);

        try {
          const { data } = await axios.post(
            `${riderService}/api/rider/new`,
            formData,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          toast.success(data.message || "Rider profile registered!");
          fetchProfile();
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Registration failed");
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        toast.error("Location permission required to complete registration");
        setSubmitting(false);
      }
    );
  };

  if (user?.role !== "rider") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "3rem" }}>🏍️</span>
        <h3 style={{ fontWeight: 700, color: "var(--color-dark)" }}>Access Restricted</h3>
        <p style={{ color: "var(--color-text-muted)" }}>You are not registered as a rider. Please switch role to Rider.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Loading rider details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg-secondary)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: "540px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏍️</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "8px" }}>Join the Rider Team</h1>
            <p style={{ color: "var(--color-text-muted)" }}>Fill in your registration details to start delivering and earning with Zomato</p>
          </div>

          <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-card)", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Picture Upload */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
                Rider Profile Photo <span style={{ color: "var(--color-error)" }}>*</span>
              </label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: `2px dashed ${image ? "var(--color-success)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-lg)", cursor: "pointer",
                background: "var(--color-bg-secondary)", overflow: "hidden",
                height: preview ? "180px" : "120px", transition: "all var(--transition-fast)", position: "relative",
              }}>
                <AnimatePresence>
                  {preview ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "absolute", inset: 0 }}>
                      <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>Click to change</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--color-text-muted)" }}>
                      <BiUpload size={28} color="var(--color-primary)" />
                      <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Click to upload profile photo</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input type="file" accept="image/*" hidden onChange={e => handleImageChange(e.target.files?.[0] || null)} />
              </label>
            </div>

            {/* Aadhar */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>Aadhar Card Number <span style={{ color: "var(--color-error)" }}>*</span></label>
              <input type="number" placeholder="Enter 12-digit Aadhar number" value={aadharNumber} onChange={e => setaadharNumber(e.target.value)} className="input-field" />
            </div>

            {/* Driving License */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>Driving License Number <span style={{ color: "var(--color-error)" }}>*</span></label>
              <input type="text" placeholder="e.g. DL-1420110067890" value={drivingLicenseNumber} onChange={e => setDrivingLicenseNumber(e.target.value)} className="input-field" />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>Contact Phone Number <span style={{ color: "var(--color-error)" }}>*</span></label>
              <input type="number" placeholder="Enter 10-digit mobile number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="input-field" />
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={submitting}
              onClick={handleSubmit}
              style={{
                width: "100%", padding: "16px",
                background: "var(--color-primary)",
                color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
                fontWeight: 700, fontSize: "1.0625rem",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "var(--shadow-primary)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              }}
            >
              {submitting ? (
                <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" /></svg>Submitting...</>
              ) : "Register Rider Profile"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "32px 0 64px" }}>
      <div className="container" style={{ maxWidth: "520px" }}>
        
        {/* Rider Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: "var(--radius-2xl)", boxShadow: "0 10px 40px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: "24px", border: "1px solid var(--color-border-light)" }}>
          
          <div style={{ height: "120px", background: "url('https://images.unsplash.com/photo-1615810220461-197e93098e98?q=80&w=1000&auto=format&fit=crop') center/cover", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))" }} />
          </div>
          
          <div style={{ padding: "0 28px 28px", marginTop: "-54px", textAlign: "center", position: "relative", zIndex: 1 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
              style={{ width: "108px", height: "108px", borderRadius: "50%", border: "5px solid #fff", overflow: "hidden", margin: "0 auto 16px", background: "#F3F4F6", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
              {profile.picture ? (
                <img src={profile.picture} alt={user?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <BiUser size={48} style={{ margin: "24px auto", color: "var(--color-text-muted)" }} />
              )}
            </motion.div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--color-dark)", marginBottom: "4px", fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>{user?.name}</h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", margin: "0 0 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 500 }}>
              <BiPhone size={16} /> {profile.phoneNumber}
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
              <span style={{
                padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: "0.8125rem", fontWeight: 700,
                background: profile.isVerified ? "rgba(22, 163, 74, 0.1)" : "rgba(217, 119, 6, 0.1)",
                color: profile.isVerified ? "#16A34A" : "#D97706",
                display: "flex", alignItems: "center", gap: "4px"
              }}>
                {profile.isVerified ? "✓ Verified Partner" : "⌛ Pending Approval"}
              </span>

              <span style={{
                padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: "0.8125rem", fontWeight: 700,
                background: profile.isAvailble ? "rgba(22, 163, 74, 0.1)" : "var(--color-bg-secondary)",
                color: profile.isAvailble ? "#16A34A" : "var(--color-text-muted)",
                display: "flex", alignItems: "center", gap: "4px"
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: profile.isAvailble ? "#16A34A" : "var(--color-text-muted)" }} />
                {profile.isAvailble ? "Online" : "Offline"}
              </span>
            </div>

            {/* Hotspot Tip */}
            <div style={{ background: "rgba(245, 158, 11, 0.1)", borderLeft: "4px solid #F59E0B", borderRadius: "0 8px 8px 0", padding: "14px 18px", textAlign: "left", fontSize: "0.875rem", color: "#B45309", lineHeight: 1.5, marginBottom: "28px" }}>
              <strong>💡 Hotspot Area:</strong> Please stay within 500m of restaurant areas to receive active customer orders efficiently.
            </div>

            {/* Availability Toggle */}
            {profile.isVerified && !currentOrder && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={toggleAvailability}
                disabled={toggling}
                style={{
                  width: "100%", padding: "16px",
                  background: profile.isAvailble ? "#1F2937" : "var(--color-primary)",
                  color: "#fff", border: "none", borderRadius: "var(--radius-xl)",
                  fontWeight: 800, fontSize: "1.0625rem", cursor: "pointer",
                  boxShadow: profile.isAvailble ? "0 4px 14px rgba(31, 41, 55, 0.2)" : "0 4px 14px rgba(226, 55, 68, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "all 0.3s ease",
                }}
              >
                {toggling ? (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" /></svg>
                ) : (
                  profile.isAvailble ? "Go Offline 📴" : "Go Online 🛵"
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Audio Banner */}
        <AnimatePresence>
          {!audioUnlocked && (
            <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 24 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                background: "#fff", border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-xl)", padding: "18px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(226, 55, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                    <BiBell size={22} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--color-dark)", margin: "0 0 4px" }}>Order Alerts</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>Enable sound to never miss an order</p>
                  </div>
                </div>
                <button onClick={unlockAudio} style={{ padding: "8px 16px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "var(--radius-lg)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 2px 8px rgba(226, 55, 68, 0.25)" }}>
                  Enable
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Incoming Orders */}
        {profile.isAvailble && incomingOrders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            <h3 style={{ fontWeight: 800, color: "var(--color-dark)", fontSize: "1.125rem", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
              Incoming Requests
            </h3>
            {incomingOrders.map((id) => (
              <RiderOrderRequest
                key={id}
                orderId={id}
                onAccepted={() => {
                  fetchProfile();
                  fetchCurrentOrder();
                }}
              />
            ))}
          </div>
        )}

        {/* Current Order Tracking */}
        {currentOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <RiderCurrentOrder order={currentOrder} onStatusUpdate={fetchCurrentOrder} />
            <RiderOrderMap order={currentOrder} />
          </div>
        )}

      </div>
    </div>
  );
};

export default RiderDashboard;
