import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash, BiMapPin } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

// Fix leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const LocationPicker = ({ setLocation }: { setLocation: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { setLocation(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const LocateMeButton = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { const { latitude, longitude } = pos.coords; map.flyTo([latitude, longitude], 16, { animate: true }); onLocate(latitude, longitude); },
      () => toast.error("Location permission denied")
    );
  };
  return (
    <button
      onClick={locateUser}
      style={{
        position: "absolute", right: "12px", top: "12px", zIndex: 1000,
        display: "flex", alignItems: "center", gap: "8px",
        background: "#fff", border: "1.5px solid var(--color-border)",
        borderRadius: "var(--radius-md)", padding: "8px 14px",
        fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
        boxShadow: "var(--shadow-md)", color: "var(--color-text)",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text)"; }}
    >
      <LuLocateFixed size={15} />
      Use my location
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch { toast.error("Failed to fetch address"); }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat); setLongitude(lng); fetchFormattedAddress(lat, lng);
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setAddresses(data || []);
    } catch { toast.error("Failed to load addresses"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const addAddress = async () => {
    if (!mobile || !formattedAddress || latitude === null || longitude === null) { toast.error("Please select a location on the map"); return; }
    try {
      setAdding(true);
      await axios.post(`${restaurantService}/api/address/new`, { formattedAddress, mobile, latitude, longitude }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Address saved successfully!");
      setMobile(""); setFormattedAddress(""); setLatitude(null); setLongitude(null);
      fetchAddresses();
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to save address"); }
    finally { setAdding(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Address deleted");
      fetchAddresses();
    } catch { toast.error("Failed to delete address"); }
    finally { setDeletingId(null); }
  };

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "32px 0 64px" }}>
      <div className="container" style={{ maxWidth: "880px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "6px" }}>
            Manage Addresses
          </h1>
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Pin your delivery location on the map below</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }} className="address-grid">
          {/* Left — Map & Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Map */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "10px" }}>
                <BiMapPin size={20} color="var(--color-primary)" />
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Pin your location</h3>
              </div>
              <div style={{ position: "relative", height: "320px" }}>
                <MapContainer
                  center={[latitude || 28.6139, longitude || 77.209]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                  <LocationPicker setLocation={setLocation} />
                  <LocateMeButton onLocate={setLocation} />
                  {latitude && longitude && <Marker position={[latitude, longitude]} />}
                </MapContainer>
              </div>
              <div style={{ padding: "14px 20px", background: "var(--color-bg-secondary)", fontSize: "0.8125rem", color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)" }}>
                💡 Click anywhere on the map to drop a pin at your delivery location
              </div>
            </div>

            {/* Selected address preview */}
            <AnimatePresence>
              {formattedAddress && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: "var(--color-success-bg)", borderRadius: "var(--radius-lg)", padding: "14px 18px", border: "1px solid rgba(34,197,94,0.2)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.25rem" }}>📍</span>
                  <p style={{ fontSize: "0.875rem", color: "#16A34A", margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{formattedAddress}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: "0 0 4px" }}>Contact Details</h3>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Mobile Number</label>
                <input
                  type="number" placeholder="Enter 10-digit mobile number"
                  value={mobile} onChange={(e) => setMobile(e.target.value)}
                  className="input-field"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={adding || !latitude}
                onClick={addAddress}
                style={{
                  width: "100%", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  background: !latitude ? "#D1D5DB" : "var(--color-primary)",
                  color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
                  fontWeight: 700, fontSize: "1rem", cursor: !latitude ? "not-allowed" : "pointer",
                  boxShadow: !latitude ? "none" : "var(--shadow-primary)",
                }}
              >
                {adding ? <BiLoader size={20} className="animate-spin" /> : <BiPlus size={20} />}
                {adding ? "Saving..." : "Save Address"}
              </motion.button>
              {!latitude && <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>Please pin a location on the map first</p>}
            </div>
          </div>

          {/* Right — Saved addresses */}
          <div style={{ position: "sticky", top: "88px" }}>
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0 }}>Saved Addresses</h3>
                <span style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.75rem", padding: "2px 10px", borderRadius: "var(--radius-full)" }}>{addresses.length}</span>
              </div>
              <div style={{ padding: "12px" }}>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px" }}>
                    {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "var(--radius-lg)" }} />)}
                  </div>
                ) : addresses.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center" }}>
                    <p style={{ fontSize: "2rem", marginBottom: "8px" }}>📍</p>
                    <p style={{ fontWeight: 600, color: "var(--color-dark)", margin: "0 0 4px" }}>No addresses saved</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>Add your first delivery address above</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {addresses.map((addr) => (
                      <motion.div key={addr._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px",
                          borderRadius: "var(--radius-lg)", marginBottom: "4px",
                          border: "1.5px solid var(--color-border)", background: "var(--color-bg-secondary)",
                          transition: "border-color var(--transition-fast)",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
                      >
                        <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", background: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <BiMapPin size={18} color="var(--color-primary)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-dark)", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{addr.formattedAddress}</p>
                          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>📱 {addr.mobile}</p>
                        </div>
                        <button
                          onClick={() => deleteAddress(addr._id)} disabled={deletingId === addr._id}
                          style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--color-error)", flexShrink: 0, borderRadius: "var(--radius-sm)", transition: "background var(--transition-fast)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--color-error-bg)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                          {deletingId === addr._id ? <BiLoader size={16} className="animate-spin" /> : <BiTrash size={16} />}
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.address-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

export default AddAddressPage;
