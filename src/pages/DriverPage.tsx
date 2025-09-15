import React from "react";
import { useNavigate } from "react-router-dom";
import DriverTracker from "../components/DriverTracker";

const DriverPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToLiveTrack = (busId: string) => {
    if (!busId) {
      alert("⚠️ Please enter a Bus ID first!");
      return;
    }
    navigate("/live-track", { state: { busId } });
  };

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
      <h1>🧍 Driver Page</h1>
      <DriverTracker onNavigateToLiveTrack={handleNavigateToLiveTrack} />
    </div>
  );
};

export default DriverPage;
