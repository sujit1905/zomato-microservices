import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed, LuSearch, LuMapPin } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash, BiEditAlt, BiCheck, BiHome, BiBriefcase, BiStar } from "react-icons/bi";
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
  title?: string;
  houseNumber?: string;
  apartment?: string;
  landmark?: string;
  pinCode?: string;
  city?: string;
  area?: string;
  isDefault?: boolean;
  location?: {
    coordinates: [number, number];
  };
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

const MapFocusController = ({ coords }: { coords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 16);
    }
  }, [coords, map]);
  return null;
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Address inputs
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [title, setTitle] = useState<"Home" | "Work" | "Other">("Home");
  const [houseNumber, setHouseNumber] = useState("");
  const [apartment, setApartment] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Edit states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Address entry option tab
  const [addressOption, setAddressOption] = useState<"gps" | "manual">("gps");

  // Search manual states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
      
      const addr = data.address || {};
      setCity(addr.city || addr.town || addr.village || "");
      setArea(addr.suburb || addr.neighbourhood || addr.road || "");
      setPinCode(addr.postcode || "");
    } catch { toast.error("Failed to fetch address"); }
  };

  const setLocationFromMap = (lat: number, lng: number) => {
    setLatitude(lat); setLongitude(lng); fetchFormattedAddress(lat, lng);
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setAddresses(data || []);
    } catch { toast.error("Failed to load addresses"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAddresses();

    // Check GPS permissions on page load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setLatitude(lat);
          setLongitude(lng);
          fetchFormattedAddress(lat, lng);
        },
        (error) => {
          // If denied, automatically toggle to manual mode
          if (error.code === error.PERMISSION_DENIED) {
            setAddressOption("manual");
            toast.success("GPS denied, switched to manual address details");
          }
        }
      );
    } else {
      setAddressOption("manual");
    }
  }, []);

  // Search Nominatim Address
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch {
        console.log("Error querying Nominatim search");
      } finally {
        setSearchingAddress(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside manual search container dropdown close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchResultClick = (result: any) => {
    setFormattedAddress(result.display_name);
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    setLatitude(lat);
    setLongitude(lng);
    setSearchQuery(result.display_name);
    setShowSearchResults(false);

    // Try parsing address components
    const nameDetails = result.display_name.split(",");
    if (nameDetails.length > 0) {
      setArea(nameDetails[0].trim());
    }
    if (nameDetails.length > 1) {
      setCity(nameDetails[1].trim());
    }
  };

  const saveAddress = async () => {
    if (!mobile) { toast.error("Mobile number is required"); return; }
    if (!formattedAddress) { toast.error("Please provide or select an address location"); return; }
    if (latitude === null || longitude === null) { toast.error("Latitude and longitude coordinates are missing"); return; }

    const payload = {
      mobile,
      formattedAddress,
      latitude,
      longitude,
      title,
      houseNumber,
      apartment,
      landmark,
      pinCode,
      city,
      area,
      isDefault,
    };

    try {
      setSaving(true);
      if (isEditMode && editId) {
        await axios.put(`${restaurantService}/api/address/${editId}`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        toast.success("Address updated successfully!");
      } else {
        await axios.post(`${restaurantService}/api/address/new`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        toast.success("Address saved successfully!");
      }
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const startEditAddress = (addr: Address) => {
    setIsEditMode(true);
    setEditId(addr._id);
    setMobile(String(addr.mobile));
    setFormattedAddress(addr.formattedAddress);
    if (addr.location) {
      setLongitude(addr.location.coordinates[0]);
      setLatitude(addr.location.coordinates[1]);
    }
    setTitle((addr.title as any) || "Home");
    setHouseNumber(addr.houseNumber || "");
    setApartment(addr.apartment || "");
    setLandmark(addr.landmark || "");
    setPinCode(addr.pinCode || "");
    setCity(addr.city || "");
    setArea(addr.area || "");
    setIsDefault(addr.isDefault || false);

    // Switch view options
    setAddressOption("manual");
    setSearchQuery(addr.formattedAddress);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch { toast.error("Failed to delete address"); }
    finally { setDeletingId(null); }
  };

  const makeAddressDefault = async (id: string) => {
    try {
      await axios.put(`${restaurantService}/api/address/${id}/default`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      toast.success("Default address updated");
      fetchAddresses();
    } catch {
      toast.error("Failed to set default address");
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditId(null);
    setMobile("");
    setFormattedAddress("");
    setLatitude(null);
    setLongitude(null);
    setTitle("Home");
    setHouseNumber("");
    setApartment("");
    setLandmark("");
    setPinCode("");
    setCity("");
    setArea("");
    setIsDefault(false);
    setSearchQuery("");
  };

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "32px 0 64px" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "6px" }}>
              Address Management
            </h1>
            <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Add and modify your shipping/delivery locations</p>
          </div>
          {isEditMode && (
            <button onClick={resetForm} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
              Cancel Edit Mode
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "28px", alignItems: "start" }} className="address-grid">
          
          {/* Left panel: Mode selection and Inputs Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Mode selection tabs */}
            <div style={{ display: "flex", background: "#fff", padding: "6px", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
              <button
                onClick={() => setAddressOption("gps")}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem",
                  background: addressOption === "gps" ? "var(--color-primary-light)" : "none",
                  color: addressOption === "gps" ? "var(--color-primary)" : "var(--color-text-muted)",
                  transition: "all var(--transition-fast)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}
              >
                <LuMapPin size={18} /> GPS Mapping Pinpoint
              </button>
              <button
                onClick={() => setAddressOption("manual")}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem",
                  background: addressOption === "manual" ? "var(--color-primary-light)" : "none",
                  color: addressOption === "manual" ? "var(--color-primary)" : "var(--color-text-muted)",
                  transition: "all var(--transition-fast)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}
              >
                <LuSearch size={18} /> Manual Search / Enter
              </button>
            </div>

            {/* GPS Map mapping view */}
            {addressOption === "gps" && (
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)" }}>
                  <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0, fontSize: "1rem" }}>Pinpoint delivery on map</h3>
                </div>
                <div style={{ position: "relative", height: "340px", background: "#eee" }}>
                  <MapContainer
                    center={[latitude || 28.6139, longitude || 77.209]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                    <LocationPicker setLocation={setLocationFromMap} />
                    <LocateMeButton onLocate={setLocationFromMap} />
                    <MapFocusController coords={latitude && longitude ? [latitude, longitude] : null} />
                    {latitude && longitude && <Marker position={[latitude, longitude]} />}
                  </MapContainer>
                </div>
                <div style={{ padding: "14px 20px", background: "var(--color-bg-secondary)", fontSize: "0.8125rem", color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)" }}>
                  💡 Drag the map or click directly to change your delivery location coordinate.
                </div>
              </div>
            )}

            {/* Manual Address search autocomplete */}
            {addressOption === "manual" && (
              <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div ref={searchContainerRef} style={{ position: "relative" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>
                    Search Area, Landmark or Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                      <LuSearch size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="Type area name, pin code, or street name..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                      onFocus={() => setShowSearchResults(true)}
                      className="input-field"
                      style={{ paddingLeft: "44px" }}
                    />
                    {searchingAddress && (
                      <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }}>
                        <BiLoader className="animate-spin" color="var(--color-primary)" />
                      </span>
                    )}
                  </div>

                  {/* Autocomplete results dropdown */}
                  <AnimatePresence>
                    {showSearchResults && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        style={{
                          position: "absolute", left: 0, right: 0, top: "calc(100% + 6px)", background: "#fff",
                          border: "1px solid var(--color-border)", borderRadius: "12px", boxShadow: "var(--shadow-xl)",
                          zIndex: 10, overflow: "hidden", maxHeight: "250px", overflowY: "auto"
                        }}
                      >
                        {searchResults.map((result, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSearchResultClick(result)}
                            style={{
                              padding: "12px 16px", borderBottom: idx < searchResults.length - 1 ? "1px solid var(--color-border-light)" : "none",
                              fontSize: "0.875rem", cursor: "pointer", transition: "background var(--transition-fast)"
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-bg-secondary)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            📍 {result.display_name}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Address inputs Form fields */}
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: "0 0 4px", fontSize: "1rem" }}>Address Details</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="address-form-grid">
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>House No. / Flat No.</label>
                  <input
                    type="text" placeholder="e.g. 102, Building A"
                    value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Apartment / Society Name</label>
                  <input
                    type="text" placeholder="e.g. Green Meadows Resort"
                    value={apartment} onChange={(e) => setApartment(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="address-form-grid2">
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Area / Locality</label>
                  <input
                    type="text" placeholder="e.g. Indiranagar"
                    value={area} onChange={(e) => setArea(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>City</label>
                  <input
                    type="text" placeholder="e.g. Bangalore"
                    value={city} onChange={(e) => setCity(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="address-form-grid3">
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>PIN Code</label>
                  <input
                    type="text" placeholder="e.g. 560038"
                    value={pinCode} onChange={(e) => setPinCode(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Landmark (Optional)</label>
                  <input
                    type="text" placeholder="e.g. Near HDFC Bank ATM"
                    value={landmark} onChange={(e) => setLandmark(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "6px" }}>Contact Phone Number</label>
                <input
                  type="number" placeholder="Enter 10-digit mobile number"
                  value={mobile} onChange={(e) => setMobile(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Tag option Home Work Other */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>Save Address As</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    { key: "Home", icon: <BiHome size={16} /> },
                    { key: "Work", icon: <BiBriefcase size={16} /> },
                    { key: "Other", icon: <LuMapPin size={16} /> }
                  ].map(({ key, icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTitle(key as any)}
                      style={{
                        flex: 1, padding: "10px 16px", borderRadius: "8px", border: "1.5px solid var(--color-border)",
                        fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        background: title === key ? "var(--color-primary)" : "#fff",
                        color: title === key ? "#fff" : "var(--color-text)",
                        borderColor: title === key ? "var(--color-primary)" : "var(--color-border)",
                        transition: "all var(--transition-fast)", cursor: "pointer"
                      }}
                    >
                      {icon} {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default address checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)", cursor: "pointer" }}
                />
                <label htmlFor="defaultAddress" style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", cursor: "pointer", userSelect: "none" }}>
                  Set as my primary delivery address
                </label>
              </div>

              {/* Save trigger button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={saving || !formattedAddress}
                onClick={saveAddress}
                style={{
                  width: "100%", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  background: !formattedAddress ? "#D1D5DB" : "var(--color-primary)",
                  color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
                  fontWeight: 700, fontSize: "1rem", cursor: !formattedAddress ? "not-allowed" : "pointer",
                  boxShadow: !formattedAddress ? "none" : "var(--shadow-primary)",
                  marginTop: "8px"
                }}
              >
                {saving ? <BiLoader size={20} className="animate-spin" /> : (isEditMode ? <BiCheck size={20} /> : <BiPlus size={20} />)}
                {saving ? "Saving Details..." : (isEditMode ? "Update Address" : "Save Address")}
              </motion.button>
            </div>

          </div>

          {/* Right panel: Saved addresses list */}
          <div style={{ position: "sticky", top: "88px" }}>
            <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 700, color: "var(--color-dark)", margin: 0, fontSize: "1.0625rem" }}>Saved Locations</h3>
                <span style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.75rem", padding: "2px 10px", borderRadius: "var(--radius-full)" }}>{addresses.length}</span>
              </div>
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px" }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "var(--radius-lg)" }} />)}
                  </div>
                ) : addresses.length === 0 ? (
                  <div style={{ padding: "36px", textAlign: "center" }}>
                    <p style={{ fontSize: "2rem", marginBottom: "8px" }}>📍</p>
                    <p style={{ fontWeight: 600, color: "var(--color-dark)", margin: "0 0 4px" }}>No address found</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>Add your first delivery address on the left form</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {addresses.map((addr) => {
                      const tagEmoji = addr.title === "Home" ? "🏠" : (addr.title === "Work" ? "💼" : "📍");
                      return (
                        <motion.div
                          key={addr._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                          style={{
                            padding: "16px", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--color-border)",
                            background: addr.isDefault ? "var(--color-primary-light)" : "var(--color-bg-secondary)",
                            borderColor: addr.isDefault ? "var(--color-primary)" : "var(--color-border)",
                            position: "relative", display: "flex", flexDirection: "column", gap: "10px",
                            transition: "all var(--transition-fast)"
                          }}
                        >
                          {/* Top Row: Tag, default status badge & action buttons */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "1.1rem" }}>{tagEmoji}</span>
                              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-dark)" }}>{addr.title || "Home"}</span>
                              {addr.isDefault && (
                                <span style={{ background: "var(--color-primary)", color: "#fff", fontSize: "0.6875rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  Default
                                </span>
                              )}
                            </div>

                            <div style={{ display: "flex", gap: "4px" }}>
                              {!addr.isDefault && (
                                <button
                                  onClick={() => makeAddressDefault(addr._id)}
                                  title="Make default delivery address"
                                  style={{ padding: "6px", color: "var(--color-text-muted)", background: "none", borderRadius: "4px", cursor: "pointer" }}
                                  onMouseEnter={e => (e.currentTarget.style.color = "var(--color-primary)")}
                                  onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
                                >
                                  <BiStar size={15} />
                                </button>
                              )}
                              <button
                                onClick={() => startEditAddress(addr)}
                                title="Edit Address"
                                style={{ padding: "6px", color: "var(--color-text-muted)", background: "none", borderRadius: "4px", cursor: "pointer" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-primary)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
                              >
                                <BiEditAlt size={16} />
                              </button>
                              <button
                                onClick={() => deleteAddress(addr._id)} disabled={deletingId === addr._id}
                                title="Delete Address"
                                style={{ padding: "6px", color: "var(--color-error)", background: "none", borderRadius: "4px", cursor: "pointer" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-error-bg)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                              >
                                {deletingId === addr._id ? <BiLoader size={15} className="animate-spin" /> : <BiTrash size={15} />}
                              </button>
                            </div>
                          </div>

                          {/* Address information body */}
                          <div>
                            {addr.houseNumber && <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-dark)" }}>{addr.houseNumber}, </span>}
                            {addr.apartment && <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-dark)" }}>{addr.apartment}, </span>}
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "4px 0" }}>{addr.formattedAddress}</p>
                            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0, display: "flex", gap: "4px", alignItems: "center" }}>
                              📱 <span>{addr.mobile}</span>
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @media(max-width:768px) {
          .address-grid { grid-template-columns: 1fr !important; }
          .address-form-grid, .address-form-grid2, .address-form-grid3 { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>
    </div>
  );
};

export default AddAddressPage;
