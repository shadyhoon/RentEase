// components/Footer.jsx
import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (route) => {
    window.location.hash = route;
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-section brand">
            <h2 className="footer-logo" onClick={() => handleNavigation('home')}>
              RentEase
            </h2>
            <h3 className="footer-subtitle">Smart Rental Management System</h3>
            <p className="footer-description">
              Streamlining property management for landlords and tenants since 2024. 
              Making rent tracking, maintenance requests, and lease agreements simple.
            </p>
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">PROPERTIES</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">TENANTS</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">LANDLORDS</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><button onClick={() => handleNavigation('home')}>Home</button></li>
              <li><button onClick={() => handleNavigation('dashboard')}>Dashboard</button></li>
              <li><button onClick={() => handleNavigation('tickets')}>Maintenance Tickets</button></li>
              <li><button onClick={() => handleNavigation('agreement')}>Lease Agreements</button></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><button>Help Center</button></li>
              <li><button>FAQs</button></li>
              <li><button>Contact Us</button></li>
              <li><button>Report an Issue</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li>📧 hello@rentease.com</li>
              <li>📞 (555) 123-4567</li>
              <li>📍 123 Property St, Suite 100</li>
              <li>🕒 Mon-Fri: 9AM - 6PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Full Width */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              © {currentYear} RentEase - Smart Rental Management System
            </div>
            <div className="footer-meta">
              Making rent tracking and property management simple for everyone
            </div>
            <div className="footer-legal">
              <button onClick={() => handleNavigation('privacy')}>Privacy Policy</button>
              <span className="separator">|</span>
              <button onClick={() => handleNavigation('terms')}>Terms of Service</button>
              <span className="separator">|</span>
              <button onClick={() => handleNavigation('cookies')}>Cookie Policy</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}