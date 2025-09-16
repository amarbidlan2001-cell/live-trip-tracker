import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCurrentLocation } from "../services/locationService";

// 🚌 Custom bus marker
const busIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 📱 Custom user marker
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

// 📏 Haversine helper
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 🗺️ Fit map to show both markers
const FitBounds: React.FC<{
  busLocation: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
}> = ({ busLocation, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (busLocation && userLocation) {
      const bounds = L.latLngBounds([
        [busLocation.lat, busLocation.lng],
        [userLocation.lat, userLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (busLocation) {
      map.setView([busLocation.lat, busLocation.lng], 15);
    }
  }, [busLocation, userLocation, map]);

  return null;
};

const LiveTrackPage: React.FC = () => {
  const location = useLocation();
  const busIdFromNav = (location.state as { busId?: string })?.busId || "";
  const queryParams = new URLSearchParams(location.search);
  const busIdFromQuery = queryParams.get("busId") || "";

  const [busId, setBusId] = useState(busIdFromNav || busIdFromQuery || "");
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const previousUserLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // ✅ Fetch bus location every 5s
  useEffect(() => {
    if (!busId) return;

    const fetchLocation = async () => {
      try {
        const res = await getCurrentLocation(busId);
        const data = res.data;

        if (data && typeof data.lat === "number" && typeof data.lng === "number") {
          setBusLocation(data);
          setLastUpdated(new Date().toLocaleTimeString());
          setFetchError(null);
        } else {
          console.warn("⚠️ Invalid response:", data);
          setBusLocation(null);
          setFetchError("⚠️ Invalid location data");
        }
      } catch (err) {
        console.error("❌ API error:", err);
        setBusLocation(null);
        setFetchError("❌ Failed to fetch location");
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [busId]);

  // ✅ Get user GPS every 5s
  useEffect(() => {
    const poll = setInterval(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng, accuracy } = pos.coords;
            if (accuracy > 30) return;

            const prev = previousUserLocationRef.current;
            if (!prev || haversine(prev.lat, prev.lng, lat, lng) > 5) {
              previousUserLocationRef.current = { lat, lng };
              setUserLocation({ lat, lng });
            }
          },
          (err) => console.error("⚠️ geolocation error", err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  const defaultCenter: [number, number] = [20, 0];

  return (
    <div style={{ textAlign: "center", padding: 20, height: "100vh" }}>
      <h1 style={{ fontSize: "28px" }}>🗺️ Live Track Page</h1>

      {/* Bus ID input if not passed in URL */}
      {!busIdFromQuery && (
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

      {/* Map section */}
      <div style={{ height: "600px", width: "100%", maxWidth: "800px", margin: "auto" }}>
        <MapContainer
          center={defaultCenter}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />

          <FitBounds busLocation={busLocation} userLocation={userLocation} />

          {busLocation && (
            <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
              <Popup>
                🚌 Bus Location <br />
                {busLocation.lat.toFixed(5)}, {busLocation.lng.toFixed(5)}
              </Popup>
            </Marker>
          )}

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

      {/* Info display */}
      <div style={{ marginTop: "20px" }}>
        {fetchError ? (
          <p style={{ color: "red" }}>{fetchError}</p>
        ) : busLocation ? (
          <>
            <p>
              🚍 Bus Location:{" "}
              <strong>
                {busLocation.lat.toFixed(5)}, {busLocation.lng.toFixed(5)}
              </strong>
            </p>
            <p>✅ Last Updated: {lastUpdated}</p>
          </>
        ) : (
          <p>⏳ Waiting for location update...</p>
        )}
      </div>
    </div>
  );
};

export default LiveTrackPage;


