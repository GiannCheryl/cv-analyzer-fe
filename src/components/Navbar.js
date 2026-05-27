import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <span className="brand-text">CV Analyzer</span>
        </Link>
      </div>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <div className="user-menu">
            <div 
              className="user-profile-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="user-name">{user?.name || "User"}</span>
              <span className="dropdown-arrow">{showDropdown ? "▲" : "▼"}</span>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/history" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  History Analisis
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Keluar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="btn btn-outline" onClick={onLoginClick}>
              Masuk
            </button>
            <button className="btn btn-primary" onClick={onRegisterClick}>
              Daftar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
