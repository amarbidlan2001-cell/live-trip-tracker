import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DriverPage from "./pages/DriverPage";
import LiveTrackPage from "./pages/LiveTrackPage"; // ✅ corrected import

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to /driver */}
        <Route path="/" element={<Navigate to="/driver" replace />} />
        
        {/* Driver page */}
        <Route path="/driver" element={<DriverPage />} />
        
        {/* Live Track page */}
        <Route path="/live-track" element={<LiveTrackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
