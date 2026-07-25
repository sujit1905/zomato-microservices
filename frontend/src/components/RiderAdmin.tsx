import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { BiCheck, BiLoader, BiUser, BiCreditCard, BiFile } from "react-icons/bi";

interface Props {
  rider: any;
  onVerify: () => void;
}

const RiderAdmin = ({ rider, onVerify }: Props) => {
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${adminService}/api/v1/verify/rider/${rider._id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Rider verified successfully! 🏍️");
      onVerify();
    } catch {
      toast.error("Failed to verify rider");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      style={{
        background: "#fff",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        border: "1px solid var(--color-border-light)",
      }}
    >
      {/* Profile Picture */}
      <div style={{ height: "140px", position: "relative", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {rider.picture ? (
          <img src={rider.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <BiUser size={48} color="var(--color-text-light)" />
        )}
        <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
          <span style={{
            background: "rgba(0,0,0,0.65)", color: "#fff",
            fontWeight: 700, fontSize: "0.6875rem", textTransform: "uppercase",
            padding: "4px 10px", borderRadius: "var(--radius-full)",
            letterSpacing: "0.5px", backdropFilter: "blur(4px)",
          }}>
            Pending Review
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--color-dark)", margin: "0 0 4px" }}>
            {rider.phoneNumber || "No Phone"}
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>
            Rider ID: {rider._id.slice(-8).toUpperCase()}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Aadhar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "var(--color-text)" }}>
            <BiCreditCard size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block" }}>Aadhar Card</span>
              <span style={{ fontWeight: 600 }}>{rider.aadharNumber || "Not provided"}</span>
            </div>
          </div>

          {/* Driving License */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "var(--color-text)" }}>
            <BiFile size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block" }}>Driving License</span>
              <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{rider.drivingLicenseNumber || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          onClick={verify}
          style={{
            width: "100%", padding: "11px",
            background: "var(--color-success)",
            color: "#fff", border: "none", borderRadius: "var(--radius-lg)",
            fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
            marginTop: "8px",
          }}
        >
          {loading ? <BiLoader size={16} className="animate-spin" /> : <BiCheck size={18} />}
          {loading ? "Approving..." : "Approve Rider"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RiderAdmin;
