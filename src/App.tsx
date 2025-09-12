import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DriverPage from './pages/DriverPage';
import LiveTrackPage from './pages/DriverPage'; // if created

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/driver" />} />
        <Route path="/driver" element={<DriverPage />} />
        <Route path="/live-track" element={<LiveTrackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
