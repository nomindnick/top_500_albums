import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          500 Albums Countdown
        </Link>
        
        {isAuthenticated ? (
          <div className="nav-links">
            <Link to="/countdown" className="nav-link">
              Current Album
            </Link>
            <Link to="/dashboard" className="nav-link">
              My Progress
            </Link>
            <div className="nav-user">
              <span className="username">{user?.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link signup-link">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;