import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload, BiX } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

interface props { fetchMyRestaurant: () => Promise<void>; }

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { loadingLocation, location } = useAppData();

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) { const r = new FileReader(); r.onloadend = () => setPreview(r.result as string); r.readAsDataURL(file); }
    else { setPreview(null); }
  };

  const handleSubmit = async () => {
    if (!name || !image || !location) { toast.error("Restaurant name, image and location are required"); return; }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);
    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Restaurant registered! 🎉");
      fetchMyRestaurant();
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to register"); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-secondary)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 80px" }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: "580px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🍽️</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.875rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "8px" }}>Register your Restaurant</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Join Zomato and start receiving orders from thousands of hungry customers near you</p>
        </div>

        <div style={{ background: "#fff", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-card)", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Cover Photo */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
              Restaurant Cover Photo <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: `2px dashed ${image ? "var(--color-success)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-lg)", cursor: "pointer",
              background: "var(--color-bg-secondary)", overflow: "hidden",
              height: preview ? "220px" : "140px", transition: "all var(--transition-fast)", position: "relative",
            }}>
              <AnimatePresence>
                {preview ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "absolute", inset: 0 }}>
                    <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontWeight: 600, background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: "0.875rem" }}>Click to change</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "var(--color-text-muted)", padding: "20px" }}>
                    <BiUpload size={32} color="var(--color-primary)" />
                    <p style={{ fontWeight: 600, margin: 0, fontSize: "0.9375rem", color: "var(--color-text)" }}>Upload restaurant photo</p>
                    <p style={{ fontSize: "0.8125rem", margin: 0 }}>High quality image recommended (PNG, JPG)</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <input type="file" accept="image/*" hidden onChange={e => handleImageChange(e.target.files?.[0] || null)} />
            </label>
            {image && (
              <button onClick={() => handleImageChange(null)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--color-error)", fontSize: "0.8125rem", cursor: "pointer", marginTop: "6px" }}>
                <BiX size={14} /> Remove photo
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>Restaurant Name <span style={{ color: "var(--color-error)" }}>*</span></label>
            <input type="text" placeholder="e.g. Spice Garden, The Burger Hub" value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>Contact Number</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>+91</span>
              <input type="number" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" style={{ paddingLeft: "46px" }} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "6px" }}>Description <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
            <textarea placeholder="Tell customers about your restaurant, cuisine type, specialities..." value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} style={{ resize: "none" }} />
          </div>

          {/* Location */}
          <div style={{ padding: "14px 16px", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--color-border)", background: "var(--color-bg-secondary)", display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <BiMapPin size={20} color="var(--color-primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-dark)", margin: "0 0 3px" }}>Restaurant Location</p>
              <p style={{ fontSize: "0.875rem", color: loadingLocation ? "var(--color-text-muted)" : "var(--color-text)", margin: 0 }}>
                {loadingLocation ? "Detecting your location..." : (location?.formattedAddress || "Location not available")}
              </p>
              {!loadingLocation && !location && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-error)", margin: "4px 0 0" }}>Please allow location access to continue</p>
              )}
            </div>
          </div>

          {/* Info banner */}
          <div style={{ padding: "12px 16px", background: "var(--color-info-bg)", borderRadius: "var(--radius-md)", border: "1px solid rgba(59,130,246,0.2)", fontSize: "0.8125rem", color: "#3B82F6", lineHeight: 1.6 }}>
            ℹ️ Your restaurant will undergo a quick verification before appearing to customers. This usually takes 24-48 hours.
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={submitting || !location}
            onClick={handleSubmit}
            style={{
              width: "100%", padding: "16px",
              background: (!location || submitting) ? "#D1D5DB" : "var(--color-primary)",
              color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
              fontWeight: 700, fontSize: "1.0625rem",
              cursor: (!location || submitting) ? "not-allowed" : "pointer",
              boxShadow: (!location || submitting) ? "none" : "var(--shadow-primary)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            }}
          >
            {submitting ? (
              <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" /></svg>Registering...</>
            ) : "🍽️ Register Restaurant"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddRestaurant;
