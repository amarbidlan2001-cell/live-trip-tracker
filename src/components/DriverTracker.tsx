import React, { useEffect, useState, useRef } from "react";
import { updateLocation, deleteLocation } from "../services/locationService";

interface DriverTrackerProps {
  onGenerateLiveTrackLink?: (link: string) => void;
}

const DriverTracker: React.FC<DriverTrackerProps> = ({ onGenerateLiveTrackLink }) => {
  const [busId, setBusId] = useState<string>("");
  const [tracking, setTracking] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareBox, setShowShareBox] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startSendingLocation = (loc: { lat: number; lng: number }) => {
    setLocation(loc);
    updateLocation(busId, loc).catch(() =>
      setError("❌ Failed to send update to server")
    );
    setLastSent(new Date().toLocaleTimeString());
  };

  const handleStartTrip = () => {
    if (!busId) {
      setError("⚠️ Please enter a Bus ID before starting the trip");
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setError(null);
          setTracking(true);

          // 🔥 First immediate call
          startSendingLocation(loc);

          // 🔥 Start interval every 5s
          intervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                startSendingLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              },
              () => setError("⚠️ Failed to fetch location"),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }, 5000);
        },
        () => {
          setError("❌ Permission denied. Cannot start trip without location access.");
        }
      );
    } else {
      setError("❌ Geolocation not supported in this browser.");
    }
  };

  const handleEndTrip = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      await deleteLocation(busId);
    } catch (err) {
      console.error("❌ Failed to delete location:", err);
    }

    setTracking(false);
    setShowShareBox(false);
    setError(null);
    setLastSent(null);
    setLocation(null);
  };

  const handleShareClick = () => {
    const link = `${window.location.origin}/live-track?busId=${busId}`;
    onGenerateLiveTrackLink?.(link);
    setShowShareBox(true);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      {!tracking ? (
        <div>
          <h2>🚌 Enter Bus ID to Start Trip</h2>
          <input
            type="text"
            placeholder="Enter Bus Number"
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "20px",
              width: "250px",
              textAlign: "center",
            }}
          />
          <br />
          <button
            onClick={handleStartTrip}
            style={{
              padding: "12px 24px",
              fontSize: "18px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            🚍 Start Trip
          </button>
          {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
        </div>
      ) : (
        <div>
          <h2>📡 Driver Tracker</h2>
          <p>
            Sharing location every 5 seconds for Bus ID: <strong>{busId}</strong>
          </p>
          {location && (
            <p>
              🌍 Current Location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          )}
          {lastSent && <p>✅ Last update: {lastSent}</p>}
          {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

          <div style={{ marginTop: "20px", display: "flex", gap: "15px", justifyContent: "center" }}>
            {!showShareBox && (
              <button
                onClick={handleShareClick}
                style={{
                  padding: "12px 24px",
                  fontSize: "18px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                📍 Share Live Location
              </button>
            )}

            {/* 🔥 End Trip Button */}
            <button
              onClick={handleEndTrip}
              style={{
                padding: "12px 24px",
                fontSize: "18px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              🛑 End Trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTracker;
