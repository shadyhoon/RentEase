// Components/navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiHome, FiFileText, FiTool, FiBell, FiUser, FiMenu, FiX } from 'react-icons/fi';

function Navbar({ active }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  const handleNavigation = (route) => {
    window.location.hash = route;
    setIsMenuOpen(false);
  };

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking on the menu button, don't close
      if (menuButtonRef.current && menuButtonRef.current.contains(event.target)) {
        return;
      }
      
      // If clicking inside the menu, don't close
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return;
      }

      // Otherwise, close the menu
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  const navItems = [
    { route: 'home', icon: FiHome, label: 'Home' },
    { route: 'dashboard', icon: FiHome, label: 'Dashboard' },
    { route: 'tickets', icon: FiTool, label: 'Tickets' },
    { route: 'agreement', icon: FiFileText, label: 'Agreements' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand" onClick={() => handleNavigation('home')}>
          <h1>RentEase</h1>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNavigation(item.route)}
              className={`nav-link ${active === item.route ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          <button className="get-started-btn" onClick={() => handleNavigation('dashboard')}>
            Get Started
          </button>
          
          <button className="notification-btn">
            <FiBell />
          </button>
          
          <div className="user-avatar">
            <FiUser />
          </div>

          {/* Mobile Menu Button - Fixed click handler */}
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

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNavigation(item.route)}
              className={`mobile-nav-link ${active === item.route ? 'active' : ''}`}
            >
              <item.icon className="mobile-nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;