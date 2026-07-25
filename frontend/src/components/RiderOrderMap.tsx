import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";
import { realtimeService } from "../main";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}

// Custom Leaflet DivIcons using emoji markers
const riderIcon = new L.DivIcon({
  html: `<div style="font-size: 24px; filter: drop-shadow(0px 2px 6px rgba(0,0,0,0.3)); transform: scale(1.1); transition: transform 0.3s;">🛵</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: "leaflet-rider-icon",
});

const deliveryIcon = new L.DivIcon({
  html: `<div style="font-size: 24px; filter: drop-shadow(0px 2px 6px rgba(0,0,0,0.3)); transform: scale(1.1);">📦</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: "leaflet-delivery-icon",
});

interface Props {
  order: IOrder;
}

const Routing = ({ from, to }: { from: [number, number]; to: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(from), L.latLng(to)],
      lineOptions: {
        styles: [{ color: "var(--color-primary)", weight: 6, opacity: 0.85 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    // Zoom map to bounds
    const bounds = L.latLngBounds([L.latLng(from), L.latLng(to)]);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      map.removeControl(control);
    };
  }, [from, to, map]);

  return null;
};

const RiderOrderMap = ({ order }: Props) => {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  if (order.deliveryAddress.latitude == null || order.deliveryAddress.longitude == null) {
    return null;
  }

  const deliveryLocation: [number, number] = [
    order.deliveryAddress.latitude,
    order.deliveryAddress.longitude,
  ];

  useEffect(() => {
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;
          setRiderLocation([latitude, longitude]);

          axios.post(
            `${realtimeService}/api/v1/internal/emit`,
            {
              event: "rider:location",
              room: `user:${order.userId}`,
              payload: { latitude, longitude },
            },
            {
              headers: {
                "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY,
              },
            }
          );
        },
        (err) => console.log("Location Error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);
    return () => clearInterval(interval);
  }, [order.userId]);

  if (!riderLocation) {
    return (
      <div style={{ height: "240px", borderRadius: "var(--radius-lg)", background: "var(--color-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>Locking GPS location...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)", overflow: "hidden", border: "1px solid var(--color-border-light)" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border-light)" }}>
        <p style={{ fontWeight: 700, color: "var(--color-dark)", fontSize: "0.875rem", margin: 0 }}>📍 Route Map</p>
      </div>
      <div style={{ height: "280px", width: "100%", position: "relative" }}>
        <MapContainer
          center={riderLocation}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={riderLocation} icon={riderIcon}>
            <Popup>You (Rider)</Popup>
          </Marker>
          <Marker position={deliveryLocation} icon={deliveryIcon}>
            <Popup>Customer Delivery Location</Popup>
          </Marker>
          <Routing from={riderLocation} to={deliveryLocation} />
        </MapContainer>
      </div>
    </div>
  );
};

export default RiderOrderMap;
