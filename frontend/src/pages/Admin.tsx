import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/ui/EmptyState";

type AdminTab = "analytics" | "verification" | "users" | "orders";

// ─── Inline SVG Icons (no emoji, no external icon lib needed here) ─────────────
const IcoBar = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoShield = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoUsers = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoOrders = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcoSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoFilter = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IcoStore = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoBike = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M8 17.5l.7-3.5L12 11l3-3h3M12 11l.7 3.5"/></svg>;
const IcoRevenue = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IcoPeople = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const IcoRest = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E23744" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const IcoTrend = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;

const SPIN_CSS = `@keyframes spin { to { transform: rotate(360deg); } }`;
const Spinner = () => (
  <>
    <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
    <style>{SPIN_CSS}</style>
  </>
);

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  delivered: { bg: "#DCFCE7", color: "#15803D" },
  placed:    { bg: "#FEF9C3", color: "#854D0E" },
  preparing: { bg: "#FFEDD5", color: "#C2410C" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B" },
  picked:    { bg: "#E0F2FE", color: "#0369A1" },
};

const Admin = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>("analytics");
  const [verifyTab, setVerifyTab] = useState<"restaurant" | "rider">("restaurant");

  // Stats
  const [stats, setStats] = useState({ restaurants: 0, riders: 0, users: 0, orders: 0, revenue: 0 });

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("all");
  const [usersLoading, setUsersLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [ordersLoading, setOrdersLoading] = useState(false);

  const PER_PAGE = 10;
  const authHeaders = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const fetchData = useCallback(async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${adminService}/api/v1/admin/restaurant/pending`, { headers: authHeaders }),
        axios.get(`${adminService}/api/v1/admin/rider/pending`, { headers: authHeaders }),
        axios.get(`${adminService}/api/v1/admin/stats`, { headers: authHeaders }),
      ]);
      setRestaurants(r1.data.restaurants || []);
      setRiders(r2.data.riders || []);
      setStats(r3.data || {});
    } catch (e) { console.error("Admin fetch error", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await axios.get(`${adminService}/api/v1/admin/users`, {
        headers: authHeaders,
        params: { page: usersPage, limit: PER_PAGE, search: userSearch, role: userRole },
      });
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setUsersLoading(false); }
  }, [usersPage, userSearch, userRole]);

  useEffect(() => { if (tab === "users") fetchUsers(); }, [tab, fetchUsers]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const { data } = await axios.get(`${adminService}/api/v1/admin/orders`, {
        headers: authHeaders,
        params: { page: ordersPage, limit: PER_PAGE, search: orderSearch, status: orderStatus },
      });
      setOrders(data.orders || []);
      setOrdersTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setOrdersLoading(false); }
  }, [ordersPage, orderSearch, orderStatus]);

  useEffect(() => { if (tab === "orders") fetchOrders(); }, [tab, fetchOrders]);

  const fmtNum = (v: number) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` :
    v >= 1000   ? `₹${(v / 1000).toFixed(1)}K`   : `₹${v}`;

  const totalUserPages = Math.ceil(usersTotal / PER_PAGE);
  const totalOrderPages = Math.ceil(ordersTotal / PER_PAGE);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
      <Spinner />
      <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Loading admin panel...</p>
    </div>
  );

  const TABS = [
    { key: "analytics",    label: "Analytics",                                icon: <IcoBar /> },
    { key: "verification", label: `Verifications (${restaurants.length + riders.length})`, icon: <IcoShield /> },
    { key: "users",        label: `Users (${stats.users || 0})`,               icon: <IcoUsers /> },
    { key: "orders",       label: `Orders (${stats.orders || 0})`,             icon: <IcoOrders /> },
  ];

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "40px 0 80px" }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>Admin Center</h1>
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Real-time platform insights, verifications, and management</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#fff", padding: "5px", borderRadius: "12px", border: "1px solid var(--color-border-light)", marginBottom: "28px", width: "fit-content", boxShadow: "var(--shadow-sm)", flexWrap: "wrap", gap: "3px" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as AdminTab)}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 17px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", border: "none", background: tab === t.key ? "var(--color-primary-light)" : "transparent", color: tab === t.key ? "var(--color-primary)" : "var(--color-text-muted)", transition: "all var(--transition-fast)" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {/* ── ANALYTICS ── */}
            {tab === "analytics" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                  {[
                    { label: "Total Revenue", value: fmtNum(stats.revenue || 0), sub: "Non-cancelled orders", icon: <IcoRevenue />, bg: "#F5F3FF" },
                    { label: "Registered Users", value: (stats.users || 0).toLocaleString(), sub: "All platform users", icon: <IcoPeople />, bg: "#ECFEFF" },
                    { label: "Restaurants", value: (stats.restaurants || 0).toLocaleString(), sub: `${restaurants.length} pending`, icon: <IcoRest />, bg: "var(--color-primary-light)" },
                    { label: "Total Orders", value: (stats.orders || 0).toLocaleString(), sub: "Platform-wide", icon: <IcoTrend />, bg: "#F0FDF4" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#fff", padding: "20px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 5px" }}>{s.label}</p>
                        <h3 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--color-dark)", margin: "0 0 3px", fontFamily: "var(--font-display)" }}>{s.value}</h3>
                        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{s.sub}</span>
                      </div>
                      <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
                    </div>
                  ))}
                </div>

                {/* Quick action cards for pending items */}
                {(restaurants.length > 0 || riders.length > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
                    {restaurants.length > 0 && (
                      <button onClick={() => { setTab("verification"); setVerifyTab("restaurant"); }}
                        style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #FCA5A5", boxShadow: "var(--shadow-sm)", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "14px", transition: "all var(--transition-fast)" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#E23744", flexShrink: 0 }}><IcoStore /></div>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Pending Restaurants</p>
                          <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#E23744" }}>{restaurants.length}</h3>
                        </div>
                      </button>
                    )}
                    {riders.length > 0 && (
                      <button onClick={() => { setTab("verification"); setVerifyTab("rider"); }}
                        style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1.5px solid #C4B5FD", boxShadow: "var(--shadow-sm)", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "14px", transition: "all var(--transition-fast)" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED", flexShrink: 0 }}><IcoBike /></div>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Pending Riders</p>
                          <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#7C3AED" }}>{riders.length}</h3>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Revenue Chart */}
                <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--color-dark)", marginBottom: "18px" }}>Monthly Activity</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "160px", borderBottom: "2px solid var(--color-border)" }}>
                    {[12,18,15,25,30,24,42,38,48,55,62,75].map((val, idx) => (
                      <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <div style={{ height: `${val}%`, width: "20px", background: idx === 11 ? "var(--color-primary)" : "rgba(226,55,68,0.2)", borderRadius: "4px 4px 0 0" }} />
                        <span style={{ fontSize: "0.575rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>{"JFMAMJJASOND"[idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── VERIFICATIONS ── */}
            {tab === "verification" && (
              <div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "22px", flexWrap: "wrap" }}>
                  {[
                    { key: "restaurant", label: `Restaurants (${restaurants.length})`, icon: <IcoStore /> },
                    { key: "rider",      label: `Riders (${riders.length})`,           icon: <IcoBike /> },
                  ].map(t => (
                    <button key={t.key} onClick={() => setVerifyTab(t.key as any)}
                      style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "var(--radius-lg)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", border: "1.5px solid", borderColor: verifyTab === t.key ? "var(--color-primary)" : "var(--color-border)", background: verifyTab === t.key ? "var(--color-primary-light)" : "#fff", color: verifyTab === t.key ? "var(--color-primary)" : "var(--color-text-muted)", transition: "all var(--transition-fast)" }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {verifyTab === "restaurant" ? (
                  restaurants.length === 0
                    ? <EmptyState icon="🏪" title="No Pending Restaurants" description="All merchant registration requests have been reviewed." />
                    : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                        {restaurants.map(r => <AdminRestaurantCard key={r._id} restaurant={r} onVerify={fetchData} />)}
                      </div>
                ) : (
                  riders.length === 0
                    ? <EmptyState icon="🏍️" title="No Pending Riders" description="All delivery partner requests have been reviewed." />
                    : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                        {riders.map(r => <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />)}
                      </div>
                )}
              </div>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <div style={{ background: "#fff", padding: "22px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
                  <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "300px" }}>
                    <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}><IcoSearch /></span>
                    <input type="text" placeholder="Search name or email..." value={userSearch} onChange={e => { setUserSearch(e.target.value); setUsersPage(1); }} className="input-field" style={{ paddingLeft: "36px", paddingTop: "8px", paddingBottom: "8px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--color-text-muted)" }}>
                    <IcoFilter />
                    <select value={userRole} onChange={e => { setUserRole(e.target.value); setUsersPage(1); }} className="input-field" style={{ width: "auto", padding: "7px 12px", height: "auto" }}>
                      <option value="all">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="rider">Rider</option>
                    </select>
                  </div>
                </div>

                {usersLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "36px" }}><Spinner /></div>
                ) : (
                  <>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--color-border-light)", color: "var(--color-text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {["User", "Email", "Role", "Registered"].map(h => (
                              <th key={h} style={{ padding: "11px 14px", textAlign: "left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, i) => (
                            <tr key={u._id || i} style={{ borderBottom: "1px solid var(--color-border-light)", fontSize: "0.875rem" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                              <td style={{ padding: "13px 14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-primary)" }}>{(u.name || "?")[0].toUpperCase()}</span>
                                  </div>
                                  <span style={{ fontWeight: 600, color: "var(--color-dark)" }}>{u.name || "—"}</span>
                                </div>
                              </td>
                              <td style={{ padding: "13px 14px", color: "var(--color-text-muted)" }}>{u.email}</td>
                              <td style={{ padding: "13px 14px" }}>
                                <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700, background: u.role === "seller" ? "#F5F3FF" : u.role === "rider" ? "#ECFEFF" : "#EFF6FF", color: u.role === "seller" ? "#7C3AED" : u.role === "rider" ? "#0891B2" : "#2563EB" }}>
                                  {(u.role || "customer").toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: "13px 14px", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {users.length === 0 && <p style={{ textAlign: "center", padding: "28px", color: "var(--color-text-muted)" }}>No users found.</p>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", flexWrap: "wrap", gap: "10px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>{usersTotal} total users</span>
                      {totalUserPages > 1 && (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button disabled={usersPage === 1} onClick={() => setUsersPage(p => p - 1)} className="btn btn-secondary btn-sm">Prev</button>
                          <span style={{ padding: "5px 12px", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{usersPage}/{totalUserPages}</span>
                          <button disabled={usersPage === totalUserPages} onClick={() => setUsersPage(p => p + 1)} className="btn btn-secondary btn-sm">Next</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── ORDERS ── */}
            {tab === "orders" && (
              <div style={{ background: "#fff", padding: "22px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
                  <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "300px" }}>
                    <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}><IcoSearch /></span>
                    <input type="text" placeholder="Search orders..." value={orderSearch} onChange={e => { setOrderSearch(e.target.value); setOrdersPage(1); }} className="input-field" style={{ paddingLeft: "36px", paddingTop: "8px", paddingBottom: "8px" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--color-text-muted)" }}>
                    <IcoFilter />
                    <select value={orderStatus} onChange={e => { setOrderStatus(e.target.value); setOrdersPage(1); }} className="input-field" style={{ width: "auto", padding: "7px 12px", height: "auto" }}>
                      <option value="all">All Status</option>
                      <option value="placed">Placed</option>
                      <option value="preparing">Preparing</option>
                      <option value="picked">Picked Up</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {ordersLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "36px" }}><Spinner /></div>
                ) : (
                  <>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--color-border-light)", color: "var(--color-text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {["Order ID", "Restaurant", "Items", "Amount", "Status", "Date"].map(h => (
                              <th key={h} style={{ padding: "11px 14px", textAlign: "left" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o, i) => {
                            const sc = STATUS_COLORS[o.status] || { bg: "#F3F4F6", color: "#374151" };
                            const restName = o.restaurantId?.name || o.restaurantName || "—";
                            const items = Array.isArray(o.items)
                              ? o.items.map((it: any) => `${it.name || it.itemId} x${it.quantity}`).join(", ")
                              : "—";
                            const amount = o.totalAmount ?? o.amount ?? 0;
                            return (
                              <tr key={o._id || i} style={{ borderBottom: "1px solid var(--color-border-light)", fontSize: "0.875rem" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                <td style={{ padding: "13px 14px", fontWeight: 700, fontFamily: "monospace", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>#{String(o._id).slice(-8).toUpperCase()}</td>
                                <td style={{ padding: "13px 14px", fontWeight: 600, color: "var(--color-dark)" }}>{restName}</td>
                                <td style={{ padding: "13px 14px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--color-text-muted)" }}>{items}</td>
                                <td style={{ padding: "13px 14px", fontWeight: 700, color: "var(--color-primary)" }}>₹{amount}</td>
                                <td style={{ padding: "13px 14px" }}>
                                  <span style={{ padding: "3px 8px", borderRadius: "9999px", fontSize: "0.68rem", fontWeight: 700, background: sc.bg, color: sc.color }}>{(o.status || "—").toUpperCase()}</span>
                                </td>
                                <td style={{ padding: "13px 14px", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {orders.length === 0 && <p style={{ textAlign: "center", padding: "28px", color: "var(--color-text-muted)" }}>No orders found.</p>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px", flexWrap: "wrap", gap: "10px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>{ordersTotal} total orders</span>
                      {totalOrderPages > 1 && (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button disabled={ordersPage === 1} onClick={() => setOrdersPage(p => p - 1)} className="btn btn-secondary btn-sm">Prev</button>
                          <span style={{ padding: "5px 12px", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{ordersPage}/{totalOrderPages}</span>
                          <button disabled={ordersPage === totalOrderPages} onClick={() => setOrdersPage(p => p + 1)} className="btn btn-secondary btn-sm">Next</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;
