import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";

export const authService = "https://zomato-auth-qv6k.onrender.com";
export const restaurantService = "https://zomato-restaurant-vd47.onrender.com";
export const utilsService = "https://zomato-microservices.onrender.com";
export const realtimeService = "https://zomato-microservices-realtime.onrender.com";
export const riderService = "https://zomato-microservices-rider.onrender.com";
export const adminService = "https://zomato-microservices-admin.onrender.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="635371645377-dlgorq5rng0mjekmhk86npv8olr068j7.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
