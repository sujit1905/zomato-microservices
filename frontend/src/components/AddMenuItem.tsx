import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload, BiX } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const resetForm = () => { setName(""); setDescription(""); setPrice(""); setImage(null); setPreview(null); };

  const handleSubmit = async () => {
    if (!name || !price || !image) { toast.error("Name, price and image are required"); return; }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);
    try {
      setLoading(true);
      await axios.post(`${restaurantService}/api/item/new`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Menu item added! 🍽️");
      resetForm();
      onItemAdded();
    } catch { toast.error("Failed to add item"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "24px" }}>Add Menu Item</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Image upload */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
            Item Image <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: `2px dashed ${image ? "var(--color-success)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-lg)", cursor: "pointer",
            background: "var(--color-bg-secondary)",
            overflow: "hidden", position: "relative",
            height: preview ? "180px" : "120px",
            transition: "all var(--transition-fast)",
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
                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Click to upload photo</span>
                  <span style={{ fontSize: "0.75rem" }}>PNG, JPG up to 5MB</span>
                </motion.div>
              )}
            </AnimatePresence>
            <input type="file" accept="image/*" hidden onChange={e => handleImageChange(e.target.files?.[0] || null)} />
          </label>
          {image && (
            <button onClick={() => handleImageChange(null)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--color-error)", fontSize: "0.8125rem", cursor: "pointer", marginTop: "6px" }}>
              <BiX size={14} /> Remove image
            </button>
          )}
        </div>

        {/* Name */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
            Item Name <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <input type="text" placeholder="e.g. Chicken Biryani" value={name} onChange={e => setName(e.target.value)} className="input-field" />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
            Description <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea placeholder="Describe the item, ingredients, spice level..." value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} style={{ resize: "none" }} />
        </div>

        {/* Price */}
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
            Price (₹) <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--color-text-muted)" }}>₹</span>
            <input type="number" placeholder="199" value={price} onChange={e => setPrice(e.target.value)} className="input-field" style={{ paddingLeft: "30px" }} min="0" />
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          onClick={handleSubmit}
          style={{
            width: "100%", padding: "14px",
            background: "var(--color-primary)",
            color: "#fff", border: "none",
            borderRadius: "var(--radius-lg)",
            fontWeight: 700, fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "var(--shadow-primary)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}
        >
          {loading ? (
            <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="30 60" strokeLinecap="round" /></svg>Adding...</>
          ) : "✓ Add to Menu"}
        </motion.button>
      </div>
    </div>
  );
};

export default AddMenuItem;
