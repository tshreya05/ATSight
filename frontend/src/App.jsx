import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingSelection from "./components/LandingSelection";
import ShortlistDashboard from "./components/ShortlistDashboard";
import CandidateDashboard from "./components/CandidateDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingSelection />} />
        <Route path="/recruiter" element={<ShortlistDashboard />} />
        <Route path="/candidate" element={<CandidateDashboard />} />
      </Routes>
    </Router>
  );
}