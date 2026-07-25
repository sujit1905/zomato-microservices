import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/protectedRote";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px", background: "var(--color-bg)" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          border: "4px solid var(--color-primary-light)",
          borderTopColor: "var(--color-primary)",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--color-text)", fontWeight: 600, fontSize: "1.125rem", margin: 0, letterSpacing: "0.5px" }}>Loading Zomato...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Dashboard redirects for specific roles
  if (user && user.role === "seller") {
    return <Restaurant />;
  }
  if (user && user.role === "rider") {
    return <RiderDashboard />;
  }
  if (user && user.role === "admin") {
    return <Admin />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderPage />} />
              <Route path="/ordersuccess" element={<OrderSuccess />} />
              <Route path="/address" element={<AddAddressPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/select-role" element={<SelectRole />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
