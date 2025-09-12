import React, { useEffect, useState } from 'react';
import { updateLocation } from '../services/api';

const DriverTracker: React.FC = () => {
  const busId = 'BUS123'; // You can later make this dynamic
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocation(busId, { lat: latitude, lng: longitude })
            .then(() => {
              setLastSent(new Date().toLocaleTimeString());
              setError(null);
            })
            .catch((err) => {
              console.error('Failed to update location:', err);
              setError('Failed to update location');
            });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Geolocation not available');
        },
        { enableHighAccuracy: true }
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📡 Driver Tracker</h2>
      <p>Sharing location every 5 seconds for Bus ID: <strong>{busId}</strong></p>
      {lastSent && <p>✅ Last update: {lastSent}</p>}
      {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}
    </div>
  );
};

export default DriverTracker;
