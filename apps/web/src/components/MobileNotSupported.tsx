import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileNotSupported.css';

const MobileNotSupported: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intendedPath = location.state?.from || '/';

  const handleContinueAnyway = () => {
    // Store that user wants to continue on mobile
    sessionStorage.setItem('allowMobileAccess', 'true');
    navigate(intendedPath);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="mobile-not-supported">
      <div className="mobile-warning-container">
        <div className="warning-animation">
          <div className="device-icon">📱</div>
          <div className="arrow-icon">→</div>
          <div className="desktop-icon">💻</div>
        </div>

        <h1>Desktop Experience Required</h1>
        
        <div className="warning-message">
          <div className="warning-icon">⚠️</div>
          <p className="main-message">
            This page is optimized for desktop browsers and may not display correctly on mobile devices.
          </p>
        </div>

        <div className="reasons-box">
          <h3>Why Desktop?</h3>
          <ul>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Complex data tables and charts require larger screens</span>
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Enhanced security features work best on desktop</span>
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Full keyboard support for efficient data entry</span>
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Better performance for medical data processing</span>
            </li>
          </ul>
        </div>

        <div className="recommendation-box">
          <i className="fas fa-lightbulb"></i>
          <p>
            For the best experience, please access DrugNexusAI from a desktop or laptop computer.
          </p>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={handleGoBack}>
            <i className="fas fa-home"></i>
            Go to Homepage
          </button>
          <button className="btn-secondary" onClick={handleContinueAnyway}>
            <i className="fas fa-exclamation-triangle"></i>
            Continue Anyway
          </button>
        </div>

        <p className="disclaimer">
          By continuing, you acknowledge that some features may not work properly on mobile devices.
        </p>
      </div>
    </div>
  );
};

export default MobileNotSupported;
