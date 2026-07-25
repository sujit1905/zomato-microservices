import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/ui/EmptyState";
import {
  BiStats, BiCheckShield, BiUserPin, BiPurchaseTag,
  BiSearch, BiFilterAlt, BiTrendingUp, BiDollarCircle,
  BiGroup, BiRestaurant
} from "react-icons/bi";

type AdminTab = "analytics" | "verification" | "users" | "orders";

const Admin = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Tabs
  const [tab, setTab] = useState<AdminTab>("analytics");
  // Sub-tab inside verification
  const [verifyTab, setVerifyTab] = useState<"restaurant" | "rider">("restaurant");

  // Filters, search, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock Users List
  const mockUsers = [
    { _id: "u1", name: "Sujit Mecwan", email: "sujit@gmail.com", role: "seller", status: "active", createdAt: "2026-07-01" },
    { _id: "u2", name: "Rahul Sharma", email: "rahul@yahoo.com", role: "customer", status: "active", createdAt: "2026-07-12" },
    { _id: "u3", name: "Amit Patel", email: "amit@gmail.com", role: "rider", status: "verified", createdAt: "2026-07-15" },
    { _id: "u4", name: "Pooja Roy", email: "pooja@outlook.com", role: "customer", status: "active", createdAt: "2026-07-20" },
    { _id: "u5", name: "Vikram Singh", email: "vikram@gmail.com", role: "rider", status: "pending", createdAt: "2026-07-25" },
    { _id: "u6", name: "Neha Gupta", email: "neha@gmail.com", role: "customer", status: "inactive", createdAt: "2026-07-25" }
  ];

  // Mock Orders List
  const mockOrders = [
    { _id: "o1", customerName: "Rahul Sharma", restaurantName: "Pizza Hut", items: "Margherita Pizza x2, Pepsi x1", amount: 540, status: "delivered", createdAt: "2026-07-25 14:32" },
    { _id: "o2", customerName: "Pooja Roy", restaurantName: "Burger King", items: "Whopper Burger x1, Fries x1", amount: 280, status: "preparing", createdAt: "2026-07-25 22:15" },
    { _id: "o3", customerName: "Sujit Mecwan", restaurantName: "Biryani Zone", items: "Chicken Biryani x1", amount: 320, status: "placed", createdAt: "2026-07-25 22:45" },
    { _id: "o4", customerName: "Rahul Sharma", restaurantName: "Subway", items: "Italian BMT Sub x1", amount: 240, status: "cancelled", createdAt: "2026-07-24 19:10" },
    { _id: "o5", customerName: "Pooja Roy", restaurantName: "KFC", items: "Hot & Crispy Chicken x4", amount: 480, status: "delivered", createdAt: "2026-07-24 13:05" }
  ];

  const fetchData = async () => {
    try {
      const resPendingRest = await axios.get(
        `${adminService}/api/v1/admin/restaurant/pending`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const resPendingRider = await axios.get(
        `${adminService}/api/v1/admin/rider/pending`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setRestaurants(resPendingRest.data.restaurants || []);
      setRiders(resPendingRider.data.riders || []);
    } catch (error) {
      console.log("Failed to load admin verification lists", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalEarnings = 18450;
  const growthRate = 12.4;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>Loading admin panel...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Filter users
  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter orders
  const filteredOrders = mockOrders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || o.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) || o.items.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated elements
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div style={{ background: "var(--color-bg-secondary)", minHeight: "100vh", padding: "40px 0 80px" }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: "4px" }}>
              Admin Center
            </h1>
            <p style={{ color: "var(--color-text-muted)", margin: 0 }}>Oversee users, verify applications, and track global store metrics</p>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div style={{
          display: "flex", background: "#fff", padding: "6px", borderRadius: "12px", border: "1px solid var(--color-border-light)",
          marginBottom: "32px", width: "fit-content", boxShadow: "var(--shadow-sm)"
        }}>
          {[
            { key: "analytics", label: "Analytics Overview", icon: <BiStats size={18} /> },
            { key: "verification", label: `Verifications (${restaurants.length + riders.length})`, icon: <BiCheckShield size={18} /> },
            { key: "users", label: "Users Registry", icon: <BiUserPin size={18} /> },
            { key: "orders", label: "Global Orders", icon: <BiPurchaseTag size={18} /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as AdminTab); setCurrentPage(1); setSearchQuery(""); }}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px",
                fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", border: "none",
                background: tab === t.key ? "var(--color-primary-light)" : "none",
                color: tab === t.key ? "var(--color-primary)" : "var(--color-text-muted)",
                transition: "all var(--transition-fast)"
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* 1. ANALYTICS TAB */}
            {tab === "analytics" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                
                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }} className="admin-stats-grid">
                  {[
                    { label: "Total Revenue", value: `₹${totalEarnings}`, percentage: `+${growthRate}% MoM`, icon: <BiDollarCircle size={24} color="#7C3AED" />, bg: "#F5F3FF" },
                    { label: "Active Customers", value: "1,248", percentage: "+8.2% MoM", icon: <BiGroup size={24} color="#0891B2" />, bg: "#ECFEFF" },
                    { label: "Registered Restaurants", value: "94", percentage: "+4 new today", icon: <BiRestaurant size={24} color="var(--color-primary)" />, bg: "var(--color-primary-light)" },
                    { label: "System Orders", value: "3,892", percentage: "+18% growth", icon: <BiTrendingUp size={24} color="#16A34A" />, bg: "#F0FDF4" },
                  ].map((s, idx) => (
                    <div key={idx} style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "0 0 6px" }}>{s.label}</p>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-dark)", margin: "0 0 4px" }}>{s.value}</h3>
                        <span style={{ fontSize: "0.75rem", color: s.percentage.includes("+") ? "#16A34A" : "#EF4444", fontWeight: 700 }}>{s.percentage}</span>
                      </div>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                    </div>
                  ))}
                </div>

                {/* Mock Chart Area */}
                <div style={{ background: "#fff", padding: "28px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-dark)", marginBottom: "20px" }}>Revenue Growth Chart</h3>
                  
                  {/* Styled CSS mockup chart bar display */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "200px", padding: "10px 0 0", borderBottom: "2px solid var(--color-border)" }}>
                    {[12, 18, 15, 25, 30, 24, 42, 38, 48, 55, 62, 75].map((val, idx) => (
                      <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          height: `${val}%`, width: "24px", background: "var(--color-primary)",
                          borderRadius: "4px 4px 0 0", opacity: idx === 11 ? 1 : 0.8,
                          transition: "height 0.5s ease-out"
                        }} />
                        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 2. VERIFICATIONS TAB */}
            {tab === "verification" && (
              <div>
                {/* Sub tabs */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  <button
                    onClick={() => setVerifyTab("restaurant")}
                    className={`btn ${verifyTab === "restaurant" ? "btn-primary" : "btn-secondary"} btn-sm`}
                  >
                    🏪 Restaurants ({restaurants.length})
                  </button>
                  <button
                    onClick={() => setVerifyTab("rider")}
                    className={`btn ${verifyTab === "rider" ? "btn-primary" : "btn-secondary"} btn-sm`}
                  >
                    🏍️ Riders ({riders.length})
                  </button>
                </div>

                {verifyTab === "restaurant" ? (
                  restaurants.length === 0 ? (
                    <EmptyState icon="🏪" title="No Pending Restaurants" description="All merchant registration requests have been reviewed." />
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                      {restaurants.map((r) => (
                        <AdminRestaurantCard key={r._id} restaurant={r} onVerify={fetchData} />
                      ))}
                    </div>
                  )
                ) : (
                  riders.length === 0 ? (
                    <EmptyState icon="🏍️" title="No Pending Riders" description="All delivery partner registration requests have been reviewed." />
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                      {riders.map((r) => (
                        <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {/* 3. USERS REGISTRY TAB */}
            {tab === "users" && (
              <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)" }}>
                
                {/* Filters Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                      <BiSearch size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search users name or email..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="input-field"
                      style={{ paddingLeft: "38px", paddingTop: "8px", paddingBottom: "8px" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BiFilterAlt size={16} color="var(--color-text-muted)" />
                    <select
                      value={roleFilter}
                      onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                      className="input-field"
                      style={{ width: "auto", padding: "6px 12px", height: "auto" }}
                    >
                      <option value="all">All Roles</option>
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="rider">Rider</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--color-border-light)", color: "var(--color-text-muted)", fontSize: "0.8125rem", fontWeight: 700 }}>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>USER NAME</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>EMAIL</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>ROLE</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>STATUS</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>REGISTRATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((u, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border-light)", fontSize: "0.875rem" }}>
                          <td style={{ padding: "16px", fontWeight: 700, color: "var(--color-dark)" }}>{u.name}</td>
                          <td style={{ padding: "16px" }}>{u.email}</td>
                          <td style={{ padding: "16px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700,
                              background: u.role === "seller" ? "#F5F3FF" : (u.role === "rider" ? "#ECFEFF" : "#EFF6FF"),
                              color: u.role === "seller" ? "#7C3AED" : (u.role === "rider" ? "#0891B2" : "#2563EB"),
                            }}>{u.role.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700,
                              background: u.status === "active" || u.status === "verified" ? "var(--color-success-bg)" : "var(--color-error-bg)",
                              color: u.status === "active" || u.status === "verified" ? "#16A34A" : "var(--color-error)",
                            }}>{u.status.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: "16px", color: "var(--color-text-muted)" }}>{u.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalUserPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-light)" }}>Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="btn btn-secondary btn-sm">Prev</button>
                      <button disabled={currentPage === totalUserPages} onClick={() => setCurrentPage(c => c + 1)} className="btn btn-secondary btn-sm">Next</button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 4. GLOBAL ORDERS TAB */}
            {tab === "orders" && (
              <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-card)" }}>
                
                {/* Filters Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", display: "flex" }}>
                      <BiSearch size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search restaurant or customer..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="input-field"
                      style={{ paddingLeft: "38px", paddingTop: "8px", paddingBottom: "8px" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BiFilterAlt size={16} color="var(--color-text-muted)" />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => { setOrderStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="input-field"
                      style={{ width: "auto", padding: "6px 12px", height: "auto" }}
                    >
                      <option value="all">All Orders</option>
                      <option value="placed">Placed</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--color-border-light)", color: "var(--color-text-muted)", fontSize: "0.8125rem", fontWeight: 700 }}>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>ORDER ID</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>CUSTOMER</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>RESTAURANT</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>ITEMS</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>AMOUNT</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>STATUS</th>
                        <th style={{ padding: "12px 16px", textAlign: "left" }}>TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((o, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border-light)", fontSize: "0.875rem" }}>
                          <td style={{ padding: "16px", fontWeight: 700, fontFamily: "monospace" }}>#{o._id.toUpperCase()}</td>
                          <td style={{ padding: "16px", fontWeight: 600 }}>{o.customerName}</td>
                          <td style={{ padding: "16px" }}>{o.restaurantName}</td>
                          <td style={{ padding: "16px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</td>
                          <td style={{ padding: "16px", fontWeight: 700, color: "var(--color-primary)" }}>₹{o.amount}</td>
                          <td style={{ padding: "16px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700,
                              background: o.status === "delivered" ? "#E0F2FE" : (o.status === "cancelled" ? "#FEE2E2" : "#FFF7ED"),
                              color: o.status === "delivered" ? "#0369A1" : (o.status === "cancelled" ? "#991B1B" : "#C2410C"),
                            }}>{o.status.toUpperCase()}</span>
                          </td>
                          <td style={{ padding: "16px", color: "var(--color-text-muted)" }}>{o.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalOrderPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-light)" }}>Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)} className="btn btn-secondary btn-sm">Prev</button>
                      <button disabled={currentPage === totalOrderPages} onClick={() => setCurrentPage(c => c + 1)} className="btn btn-secondary btn-sm">Next</button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
      <style>{`
        @media (max-width: 768px) {
          .admin-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Admin;
