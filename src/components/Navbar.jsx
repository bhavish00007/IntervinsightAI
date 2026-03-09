import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          Interv<span>Insight</span> AI
        </div>

        <div className="navbar-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
        </div>

        <div className="navbar-user">
          <span className="navbar-user-name">{user?.name}</span>
          <button className="navbar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      <div className={`navbar-mobile ${mobileOpen ? "open" : ""}`}>
        <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
          Dashboard
        </NavLink>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
}

export default Navbar;
