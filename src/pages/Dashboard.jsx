import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHistory } from "../services/api";
import History from "../components/History";
import Navbar from "../components/Navbar";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
];

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleStart = () => {
    if (!selectedRole) {
      alert("Please select a role first");
      return;
    }
    navigate("/interview", { state: { role: selectedRole } });
  };

  const handleStartLive = () => {
    if (!selectedRole) {
      alert("Please select a role first");
      return;
    }
    navigate("/live-interview", { state: { role: selectedRole } });
  };

  const totalInterviews = history.length;
  const avgScore =
    totalInterviews > 0
      ? (history.reduce((sum, h) => sum + h.score, 0) / totalInterviews).toFixed(1)
      : "—";
  const bestScore =
    totalInterviews > 0
      ? Math.max(...history.map((h) => h.score)).toFixed(1)
      : "—";

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-container">
        <div className="dashboard-header">
          <h1>Hey, {user?.name || "there"}</h1>
          <p>Ready to sharpen your interview skills?</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Interviews</div>
            <div className="stat-card-value">{totalInterviews}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Average Score</div>
            <div className="stat-card-value">{avgScore}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Best Score</div>
            <div className="stat-card-value">{bestScore}</div>
          </div>
        </div>

        {/* Start Interview */}
        <div className="dashboard-section">
          <h2>Start a new interview</h2>
          <div className="role-grid">
            {ROLES.map((role) => (
              <div
                key={role}
                className={`role-card ${selectedRole === role ? "selected" : ""}`}
                onClick={() => setSelectedRole(role)}
              >
                {role}
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleStart}
            disabled={!selectedRole}
          >
            Start Interview →
          </button>
          <button
            className="btn btn-live btn-lg"
            onClick={handleStartLive}
            disabled={!selectedRole}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            Start Live Interview
          </button>
        </div>

        {/* History */}
        <div className="dashboard-section">
          <h2>Recent interviews</h2>
          {loading ? (
            <div className="loading-container">
              <div className="spinner spinner-dark spinner-lg"></div>
            </div>
          ) : (
            <History history={history} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;