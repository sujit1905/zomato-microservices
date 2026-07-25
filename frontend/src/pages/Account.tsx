import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage, BiChevronRight } from "react-icons/bi";
import { motion } from "framer-motion";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();
  const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const menuItems = [
    { icon: "📦", label: "My Orders", desc: "View and track your orders", path: "/orders", iconEl: <BiPackage size={20} color="var(--color-primary)" /> },
    { icon: "📍", label: "Saved Addresses", desc: "Manage delivery addresses", path: "/address", iconEl: <BiMapPin size={20} color="var(--color-primary)" /> },
  ];

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "32px 0 64px" }}>
      <div className="container" style={{ maxWidth: "640px" }}>
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden", marginBottom: "20px" }}
        >
          {/* Cover gradient */}
          <div style={{ height: "80px", background: "linear-gradient(135deg, var(--color-primary) 0%, #c42f3a 100%)" }} />

          <div style={{ padding: "0 24px 24px", marginTop: "-36px" }}>
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "var(--color-dark)",
                border: "3px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.75rem", fontWeight: 800, color: "#fff",
                fontFamily: "var(--font-display)",
                overflow: "hidden",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {user?.image ? (
                <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : firstLetter}
            </motion.div>

            <div style={{ marginTop: "12px" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>
                {user?.name}
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", margin: "0 0 12px" }}>
                {user?.email}
              </p>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "4px 12px",
                background: "var(--color-success-bg)",
                color: "#16A34A",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8125rem", fontWeight: 600,
              }}>
                ✓ Verified Account
              </span>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden", marginBottom: "20px" }}
        >
          {menuItems.map(({ iconEl, label, desc, path }, i) => (
            <motion.button
              key={path}
              whileHover={{ x: 4 }}
              onClick={() => navigate(path)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "16px",
                padding: "20px 24px",
                background: "none", border: "none",
                borderBottom: i < menuItems.length - 1 ? "1px solid var(--color-border-light)" : "none",
                cursor: "pointer", textAlign: "left",
                transition: "background var(--transition-fast)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-bg-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "var(--radius-md)",
                background: "var(--color-primary-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {iconEl}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "var(--color-dark)", margin: "0 0 2px", fontSize: "0.9375rem" }}>{label}</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>{desc}</p>
              </div>
              <BiChevronRight size={20} color="var(--color-text-muted)" />
            </motion.button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}
        >
          <motion.button
            whileHover={{ x: 4 }}
            onClick={logoutHandler}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "16px",
              padding: "20px 24px",
              background: "none", border: "none", cursor: "pointer",
              transition: "background var(--transition-fast)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-error-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "var(--radius-md)",
              background: "var(--color-error-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BiLogOut size={20} color="var(--color-error)" />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontWeight: 700, color: "var(--color-error)", margin: 0, fontSize: "0.9375rem" }}>Logout</p>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>Sign out of your account</p>
            </div>
            <BiChevronRight size={20} color="var(--color-error)" style={{ opacity: 0.5 }} />
          </motion.button>
        </motion.div>

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--color-text-light)", marginTop: "24px" }}>
          Zomato v1.0 · © 2025 Zomato Technologies
        </p>
      </div>
    </div>
  );
};

export default Account;
