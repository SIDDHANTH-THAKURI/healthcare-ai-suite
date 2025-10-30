import React from 'react';
import './MaintenancePage.css';

const MaintenancePage: React.FC = () => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-icon-wrapper">
          <div className="gear-container">
            <i className="fas fa-cog gear-1"></i>
            <i className="fas fa-cog gear-2"></i>
            <i className="fas fa-cog gear-3"></i>
          </div>
        </div>

        <h1 className="maintenance-title">Site Under Maintenance</h1>
        
        <div className="maintenance-message">
          <p className="main-text">
            We're currently performing some updates to improve your experience.
          </p>
          
          <div className="info-box">
            <div className="info-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="info-content">
              <h3>Important Notice</h3>
              <p>
                This is a <strong>demonstration project</strong> showcasing AI-powered healthcare technology.
              </p>
              <ul className="notice-list">
                <li>🔄 Occasional data resets may occur during development</li>
                <li>🧪 This is a proof-of-concept, not a production system</li>
                <li>📚 Built to demonstrate AI integration in healthcare workflows</li>
                <li>⚠️ Do not use for actual medical decisions</li>
              </ul>
            </div>
          </div>

          <div className="features-preview">
            <h3>What We're Building</h3>
            <div className="feature-grid">
              <div className="feature-item">
                <i className="fas fa-brain"></i>
                <span>AI Drug Interaction Detection</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-robot"></i>
                <span>Medical Chatbot Assistant</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-user-md"></i>
                <span>Doctor & Patient Portals</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Contraindication Checking</span>
              </div>
            </div>
          </div>

          <p className="disclaimer">
            This platform is designed to demonstrate how AI and machine learning 
            can enhance healthcare decision-making. It's a learning project and 
            should not be relied upon for real medical advice.
          </p>
        </div>

        <div className="maintenance-footer">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>System Status: Maintenance Mode</span>
          </div>
          <p className="footer-text">
            We'll be back soon! Thank you for your patience.
          </p>
        </div>
      </div>

      <div className="background-animation">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
};

export default MaintenancePage;
