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