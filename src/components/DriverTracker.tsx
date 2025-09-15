import React, { useEffect, useState } from "react";
import { updateLocation } from "../services/locationService";

interface DriverTrackerProps {
  onNavigateToLiveTrack?: (busId: string) => void;
}

const DriverTracker: React.FC<DriverTrackerProps> = ({ onNavigateToLiveTrack }) => {
  const [busId, setBusId] = useState<string>("");
  const [tracking, setTracking] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let watchId: number | null = null;

    if (tracking && busId) {
      if ("geolocation" in navigator) {
        // ✅ Track real GPS
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(loc);
            setLastSent(new Date().toLocaleTimeString());
            setError(null);

            // 🔥 Send update via axios service
            updateLocation(busId, loc).catch(() =>
              setError("❌ Failed to send update to server")
            );
          },
          () => {
            setError("Permission denied → running in dummy mode");
            // ✅ Fallback dummy updates
            let lat = 28.6139,
              lng = 77.2090;
            interval = setInterval(() => {
              lat += 0.0005;
              lng += 0.0005;
              const loc = { lat, lng };
              setLocation(loc);
              setLastSent(new Date().toLocaleTimeString());

              updateLocation(busId, loc).catch(() =>
                setError("❌ Failed to send update to server")
              );
            }, 5000);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      } else {
        setError("Geolocation not supported → running in dummy mode");
        let lat = 28.6139,
          lng = 77.2090;
        interval = setInterval(() => {
          lat += 0.0005;
          lng += 0.0005;
          const loc = { lat, lng };
          setLocation(loc);
          setLastSent(new Date().toLocaleTimeString());

          updateLocation(busId, loc).catch(() =>
            setError("❌ Failed to send update to server")
          );
        }, 5000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking, busId]);

  const handleStartTrip = () => {
    if (!busId) {
      setError("⚠️ Please enter a Bus ID before starting the trip");
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setTracking(true),
        () => {
          setError("Permission denied. Switching to dummy mode.");
          setTracking(true);
        }
      );
    } else {
      setError("Geolocation not supported. Switching to dummy mode.");
      setTracking(true);
    }
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

          {/* Navigate to LiveTrack */}
          <button
            onClick={() => onNavigateToLiveTrack?.(busId)}
            style={{
              marginTop: "20px",
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
        </div>
      ) : (
        <div>
          <h2>📡 Driver Tracker</h2>
          <p>
            Sharing location every 5 seconds for Bus ID:{" "}
            <strong>{busId}</strong>
          </p>
          {location && (
            <p>
              🌍 Current Location: {location.lat.toFixed(5)},{" "}
              {location.lng.toFixed(5)}
            </p>
          )}
          {lastSent && <p>✅ Last update: {lastSent}</p>}
          {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
        </div>
      )}
    </div>
  );
};

export default DriverTracker;
