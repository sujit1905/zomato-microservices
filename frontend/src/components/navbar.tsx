import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useRef, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch, BiX, BiMenu, BiLogOut, BiPackage, BiUser } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { isAuth, city, quauntity, user, setUser, setIsAuth } = useAppData();
  const currLocation = useLocation();
  const navigate = useNavigate();

  const isHomePage = currLocation.pathname === "/";
  const isLoginPage = currLocation.pathname === "/login";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const prevQty = useRef(quauntity);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cart badge bounce on change
  useEffect(() => {
    if (quauntity !== prevQty.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 400);
      prevQty.current = quauntity;
      return () => clearTimeout(t);
    }
  }, [quauntity]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) setSearchParams({ search });
      else setSearchParams({});
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const logout = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    setProfileOpen(false);
    navigate("/login");
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: "var(--z-sticky)",
          transition: "box-shadow var(--transition-base), background var(--transition-base)",
          boxShadow: scrolled ? "var(--shadow-md)" : "0 1px 0 var(--color-border)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Main nav row */}
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 var(--space-lg)", height: "64px" }}>
          {/* Logo */}
          <Link
            to="/"
            aria-label="Zomato Home"
            style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", flexShrink: 0 }}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
              style={{
                width: "34px", height: "34px",
                background: "var(--color-primary)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🍅
            </motion.div>
            <span style={{
              fontSize: "1.375rem",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              color: "var(--color-primary)",
              letterSpacing: "-0.5px",
            }}>
              Zomato
            </span>
          </Link>

          {/* Location pill */}
          {isAuth && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px",
              background: "var(--color-bg-secondary)",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--color-border)",
              maxWidth: "180px",
              flexShrink: 0,
              cursor: "pointer",
            }}
              title={city}
            >
              <BiMapPin size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {city}
              </span>
            </div>
          )}

          {/* Desktop Search (home only) */}
          {isHomePage && (
            <div style={{ flex: 1, display: "none" }} className="nav-search-desktop">
              <SearchInput value={search} onChange={setSearch} />
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Cart */}
            {isAuth && (
              <Link
                to="/cart"
                aria-label={`Cart, ${quauntity} items`}
                style={{ position: "relative", padding: "8px", borderRadius: "var(--radius-md)", display: "flex" }}
              >
                <motion.div animate={cartBounce ? { scale: [1, 1.3, 0.9, 1] } : {}} transition={{ duration: 0.4 }}>
                  <CgShoppingCart size={24} color="var(--color-dark)" />
                </motion.div>
                {quauntity > 0 && (
                  <motion.span
                    key={quauntity}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: "absolute", top: "2px", right: "2px",
                      width: "18px", height: "18px",
                      background: "var(--color-primary)",
                      color: "#fff",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #fff",
                    }}
                  >
                    {quauntity > 9 ? "9+" : quauntity}
                  </motion.span>
                )}
              </Link>
            )}

            {/* Profile / Login */}
            {isAuth ? (
              <div ref={profileRef} style={{ position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                  style={{
                    width: "38px", height: "38px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    fontFamily: "var(--font-display)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid transparent",
                    cursor: "pointer",
                    transition: "border-color var(--transition-fast)",
                    ...(profileOpen ? { borderColor: "var(--color-primary)", background: "var(--color-primary-dark)" } : {}),
                  }}
                >
                  {user?.image ? (
                    <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  ) : firstLetter}
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute", right: 0, top: "calc(100% + 10px)",
                        width: "240px",
                        background: "#fff",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "var(--shadow-xl)",
                        border: "1px solid var(--color-border)",
                        overflow: "hidden",
                        zIndex: "var(--z-dropdown)",
                      }}
                    >
                      {/* User info */}
                      <div style={{ padding: "16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-secondary)" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-dark)", margin: 0 }}>{user?.name}</p>
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "2px 0 0" }}>{user?.email}</p>
                      </div>

                      {/* Menu items */}
                      {[
                        { icon: <BiPackage size={18} />, label: "My Orders", path: "/orders" },
                        { icon: <BiUser size={18} />, label: "Account", path: "/account" },
                      ].map(({ icon, label, path }) => (
                        <button
                          key={path}
                          onClick={() => { navigate(path); setProfileOpen(false); }}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "12px",
                            padding: "13px 16px", background: "none", border: "none",
                            fontSize: "0.9375rem", fontWeight: 500,
                            color: "var(--color-text)", cursor: "pointer",
                            transition: "background var(--transition-fast)",
                            borderBottom: "1px solid var(--color-border-light)",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--color-bg-secondary)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                          <span style={{ color: "var(--color-text-muted)" }}>{icon}</span>
                          {label}
                        </button>
                      ))}

                      <button
                        onClick={logout}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "12px",
                          padding: "13px 16px", background: "none", border: "none",
                          fontSize: "0.9375rem", fontWeight: 500,
                          color: "var(--color-error)", cursor: "pointer",
                          transition: "background var(--transition-fast)",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-error-bg)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        <BiLogOut size={18} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              !isLoginPage && (
                <Link
                  to="/login"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  Sign In
                </Link>
              )
            )}

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              style={{
                display: "none",
                padding: "8px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-secondary)",
                cursor: "pointer",
              }}
            >
              <BiMenu size={22} />
            </button>
          </div>
        </div>

        {/* Home search bar (below nav on mobile) */}
        {isHomePage && (
          <div style={{
            borderTop: "1px solid var(--color-border)",
            padding: "10px var(--space-lg)",
            background: "rgba(255,255,255,0.98)",
          }}>
            <div className="container" style={{ padding: 0 }}>
              <SearchInput value={search} onChange={setSearch} />
            </div>
          </div>
        )}
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "min(320px, 85vw)",
                background: "#fff",
                zIndex: "var(--z-modal)",
                padding: "24px",
                display: "flex", flexDirection: "column", gap: "8px",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--color-primary)" }}>Zomato</span>
                <button onClick={() => setMobileMenuOpen(false)} style={{ padding: "8px", cursor: "pointer", borderRadius: "var(--radius-md)", background: "var(--color-bg-secondary)" }}>
                  <BiX size={22} />
                </button>
              </div>

              {isAuth && (
                <div style={{ padding: "16px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-lg)", marginBottom: "8px" }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "2px 0 0" }}>{user?.email}</p>
                </div>
              )}

              {isAuth ? (
                <>
                  {[
                    { icon: "📦", label: "My Orders", path: "/orders" },
                    { icon: "👤", label: "Account", path: "/account" },
                    { icon: "🛒", label: `Cart (${quauntity})`, path: "/cart" },
                  ].map(({ icon, label, path }) => (
                    <button key={path} onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "14px 16px",
                        background: "none", border: "none", width: "100%",
                        fontSize: "1rem", fontWeight: 600, color: "var(--color-text)",
                        borderRadius: "var(--radius-md)", cursor: "pointer",
                        transition: "background var(--transition-fast)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-bg-secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <span style={{ fontSize: "1.25rem" }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                  <div style={{ marginTop: "auto" }}>
                    <button onClick={logout}
                      style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "14px 16px",
                        background: "var(--color-error-bg)", border: "none", width: "100%",
                        fontSize: "1rem", fontWeight: 600, color: "var(--color-error)",
                        borderRadius: "var(--radius-md)", cursor: "pointer",
                      }}
                    >
                      <BiLogOut size={20} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                !isLoginPage && (
                  <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="btn btn-primary btn-block btn-lg">
                    Sign In to Continue
                  </button>
                )
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-search-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-search-desktop { display: flex !important; }
        }
      `}</style>
    </>
  );
};

const SearchInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div style={{
    display: "flex", alignItems: "center",
    background: "var(--color-bg-secondary)",
    borderRadius: "var(--radius-full)",
    border: "1.5px solid var(--color-border)",
    padding: "0 16px",
    gap: "10px",
    transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
    height: "42px",
  }}
    onFocus={e => {
      const el = e.currentTarget;
      el.style.borderColor = "var(--color-primary)";
      el.style.boxShadow = "0 0 0 3px rgba(226,55,68,0.1)";
      el.style.background = "#fff";
    }}
    onBlur={e => {
      const el = e.currentTarget;
      el.style.borderColor = "var(--color-border)";
      el.style.boxShadow = "none";
      el.style.background = "var(--color-bg-secondary)";
    }}
  >
    <BiSearch size={18} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
    <input
      type="text"
      placeholder="Search for restaurants, cuisines..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search restaurants"
      style={{
        flex: 1, border: "none", background: "none",
        fontSize: "0.9375rem", color: "var(--color-text)",
        outline: "none",
      }}
    />
    {value && (
      <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", color: "var(--color-text-muted)" }}>
        <BiX size={18} />
      </button>
    )}
  </div>
);

export default Navbar;
