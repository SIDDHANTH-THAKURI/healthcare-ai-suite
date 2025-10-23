import React from 'react';
import './UpgradeModal.css';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  remaining: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade, remaining }) => {
  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-header">
          <div className="icon-wrapper">
            <i className="fas fa-comment-slash"></i>
          </div>
          <h2>Daily Limit Reached</h2>
          <p>You've used all {20 - remaining} free messages today</p>
        </div>

        <div className="modal-body">
          <div className="options-grid">
            {/* Option 1: Wait */}
            <div className="option-card wait">
              <div className="option-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Wait Until Tomorrow</h3>
              <p>Your free messages reset at midnight</p>
              <div className="option-details">
                <span className="detail-item">
                  <i className="fas fa-redo"></i> Resets daily
                </span>
                <span className="detail-item">
                  <i className="fas fa-gift"></i> Always free
                </span>
              </div>
            </div>

            {/* Option 2: Upgrade */}
            <div className="option-card upgrade recommended">
              <div className="recommended-badge">
                <i className="fas fa-star"></i> Recommended
              </div>
              <div className="option-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>Add Your API Key</h3>
              <p>Get unlimited messages forever!</p>
              <div className="option-details">
                <span className="detail-item">
                  <i className="fas fa-infinity"></i> Unlimited messages
                </span>
                <span className="detail-item">
                  <i className="fas fa-gift"></i> $5 free credits
                </span>
                <span className="detail-item">
                  <i className="fas fa-clock"></i> 2 min setup
                </span>
                <span className="detail-item">
                  <i className="fas fa-dollar-sign"></i> ~5000 free messages
                </span>
              </div>
              <button className="upgrade-button" onClick={onUpgrade}>
                <i className="fas fa-key"></i> Add API Key Now
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="how-it-works">
            <h4>
              <i className="fas fa-question-circle"></i> How does it work?
            </h4>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <strong>Sign up at OpenRouter</strong>
                  <p>Free account with $5 credits included</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <strong>Get your API key</strong>
                  <p>Copy it from your dashboard</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <strong>Paste it in Settings</strong>
                  <p>Enjoy unlimited messages!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <i className="fas fa-shield-alt"></i>
              <span>Secure & Encrypted</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-user-lock"></i>
              <span>Your Key, Your Control</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-undo"></i>
              <span>Remove Anytime</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Maybe Later
          </button>
          <button className="primary-button" onClick={onUpgrade}>
            <i className="fas fa-arrow-right"></i> Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
