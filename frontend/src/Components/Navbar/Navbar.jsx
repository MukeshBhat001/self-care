import React from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')}>
        <img src="\SAVE_20250222_235435 (1).jpg" alt="" />
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <div className="navbar-profile" onClick={() => navigate('/profile')}>
              <FaUserCircle className="profile-icon" />
              <span className="profile-name">{user.username}</span>
            </div>
            <button onClick={handleLogout} className="navbar-button">Logout</button>
          </>
        ) : (
          <button onClick={() => navigate('/auth')} className="navbar-button">Login / Register</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
