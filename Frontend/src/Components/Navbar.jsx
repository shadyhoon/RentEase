// Components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiTool, FiBell, FiUser, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((prev) => !prev);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuButtonRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      if (profileRef.current?.contains(event.target)) return;
      if (isMenuOpen) setIsMenuOpen(false);
      if (profileOpen) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, profileOpen]);

  // When not logged in, Dashboard takes the user to login.
  // When logged in, it routes to the correct dashboard based on role.
  const dashboardPath = user
    ? (user.role === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard')
    : '/login';

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: dashboardPath, icon: FiHome, label: 'Dashboard' },
    { path: '/tickets', icon: FiTool, label: 'Tickets' },
    { path: '/agreements', icon: FiFileText, label: 'Agreements' },
  ];

  const avatarLetter = user
    ? (user.name ? user.name[0] : user.email[0]).toUpperCase()
    : null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => handleNavigation('/')}>
          <h1>RentEase</h1>
        </div>

        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="profile-wrap" ref={profileRef}>
              <button
                type="button"
                className="profile-avatar-btn"
                onClick={toggleProfile}
                aria-label="Profile menu"
              >
                <span className="profile-avatar">{avatarLetter}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <span className="profile-dropdown-avatar">{avatarLetter}</span>
                    <div className="profile-dropdown-info">
                      <span className="profile-dropdown-email">{user.email}</span>
                      <span className="profile-dropdown-role">{user.role}</span>
                    </div>
                  </div>
                  <button type="button" className="profile-dropdown-logout" onClick={handleLogout}>
                    <FiLogOut /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="get-started-btn" onClick={() => handleNavigation('/login')}>
              Get Started
            </button>
          )}

          {user && (
            <button className="notification-btn">
              <FiBell />
            </button>
          )}

          {!user && (
            <div className="user-avatar">
              <FiUser />
            </div>
          )}

          <button
            ref={menuButtonRef}
            className="mobile-menu-btn"
            onClick={toggleMenu}
            type="button"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div ref={menuRef} className="mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon className="mobile-nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
          {user && (
            <button type="button" className="mobile-nav-link" onClick={handleLogout}>
              <FiLogOut className="mobile-nav-icon" />
              <span>Log out</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
