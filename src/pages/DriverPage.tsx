import React, { useState } from "react";
import DriverTracker from "../components/DriverTracker";

const DriverPage: React.FC = () => {
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleGenerateLiveTrackLink = (link: string) => {
    setShareLink(link);
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert("✅ Link copied to clipboard!");
    }
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
      <DriverTracker onGenerateLiveTrackLink={handleGenerateLiveTrackLink} />

      {shareLink && (
        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            value={shareLink}
            readOnly
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              width: "400px",
              marginRight: "10px",
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            📋 Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default DriverPage;
