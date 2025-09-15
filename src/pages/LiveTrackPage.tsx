import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCurrentLocation } from "../services/locationService";

// Default (blue) bus marker
const busIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Red marker for user's live location
const userIcon = new L.DivIcon({
  className: "custom-user-marker",
  html: `
    <div style="text-align:center;">
      <div style="color:red; font-weight:bold; font-size:14px; margin-bottom:2px;">You</div>
      <div style="width:20px; height:20px; background:red; border-radius:50%; border:2px solid white;"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

// Helper to calculate distance between two coords in meters
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const LiveTrackPage: React.FC = () => {
  const locationState = useLocation();
  const busIdFromNav = (locationState.state as { busId?: string })?.busId || "";

  const [busId, setBusId] = useState(busIdFromNav);
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const previousUserLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // ✅ Poll bus location from backend
  useEffect(() => {
    if (!busId) return;

    const interval = setInterval(async () => {
      try {
        const res = await getCurrentLocation(busId);
        if (res.data) {
          setBusLocation(res.data);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error("❌ Failed to fetch bus location", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [busId]);

  // ✅ Track user GPS
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng, accuracy } = pos.coords;

            if (accuracy > 30) return; // skip noisy fixes

            const prev = previousUserLocationRef.current;
            if (!prev || haversine(prev.lat, prev.lng, lat, lng) > 5) {
              previousUserLocationRef.current = { lat, lng };
              setUserLocation({ lat, lng });
            }
          },
          (err) => console.error("⚠️ getCurrentPosition error:", err.message),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>🗺️ Live Track Page</h1>

      {/* Input box if no busId passed from DriverPage */}
      {!busId && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter Bus ID"
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              width: "250px",
              textAlign: "center",
            }}
          />
        </div>
      )}

      {busLocation ? (
        <>
          <p>
            🚍 Bus Current Location →{" "}
            <strong>{busLocation.lat.toFixed(5)}, {busLocation.lng.toFixed(5)}</strong>
          </p>
          <p>✅ Last Updated: {lastUpdated}</p>

          <div style={{ height: "600px", width: "100%", maxWidth: "800px" }}>
            <MapContainer
              center={[busLocation.lat, busLocation.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              {/* Bus Marker (blue) */}
              <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
                <Popup>
                  🚍 Bus Location <br />
                  {busLocation.lat.toFixed(5)}, {busLocation.lng.toFixed(5)}
                </Popup>
              </Marker>

              {/* User Marker (red) */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    📱 Your Location <br />
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </>
      ) : busId ? (
        <p>⏳ Waiting for location updates...</p>
      ) : (
        <p>ℹ️ Please enter a Bus ID to start tracking</p>
      )}
    </div>
  );
};

export default LiveTrackPage;
