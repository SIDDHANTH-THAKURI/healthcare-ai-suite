import React from 'react';
import './ExhaustedModal.css';

interface ExhaustedModalProps {
  onClose: () => void;
  onAddKey: () => void;
  isFreeTier?: boolean;
}

const ExhaustedModal: React.FC<ExhaustedModalProps> = ({
  onClose,
  onAddKey,
  isFreeTier = false
}) => {
  return (
    <div className="exhausted-modal-overlay" onClick={onClose}>
      <div className="exhausted-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exhausted-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="exhausted-icon">
          {isFreeTier ? '⚠️' : '🚫'}
        </div>

        <h2 className="exhausted-title">
          {isFreeTier ? 'API Credits Exhausted' : 'Daily Limit Reached'}
        </h2>

        <p className="exhausted-message">
          {isFreeTier ? (
            <>
              Your OpenRouter free tier credits have been exhausted. 
              To continue using AI features, please upgrade to a paid plan on OpenRouter.
            </>
          ) : (
            <>
              You've used all your free AI requests for today. 
              Add your own API key to continue with unlimited access.
            </>
          )}
        </p>

        <div className="exhausted-options">
          {isFreeTier ? (
            <>
              <div className="exhausted-option">
                <div className="option-icon">💳</div>
                <div className="option-content">
                  <h4>Upgrade on OpenRouter</h4>
                  <p>Add credits to your OpenRouter account</p>
                  <a 
                    href="https://openrouter.ai/credits" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="option-link"
                  >
                    Go to OpenRouter <i className="fas fa-external-link-alt"></i>
                  </a>
                </div>
              </div>

              <div className="exhausted-option">
                <div className="option-icon">🔄</div>
                <div className="option-content">
                  <h4>Use Different API Key</h4>
                  <p>Switch to another OpenRouter key with credits</p>
                  <button className="option-button" onClick={onAddKey}>
                    Change API Key
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="exhausted-option">
                <div className="option-icon">⏰</div>
                <div className="option-content">
                  <h4>Wait Until Tomorrow</h4>
                  <p>Your free requests will reset at midnight</p>
                </div>
              </div>

              <div className="exhausted-option highlighted">
                <div className="option-icon">🔑</div>
                <div className="option-content">
                  <h4>Add Your API Key</h4>
                  <p>Get unlimited requests with your own OpenRouter key</p>
                  <button className="option-button primary" onClick={onAddKey}>
                    Add API Key Now
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="exhausted-info">
          <i className="fas fa-info-circle"></i>
          <span>
            {isFreeTier 
              ? 'OpenRouter offers affordable pay-as-you-go pricing starting at $0.001 per request'
              : 'With your own API key, you only pay for what you use - typically $0.001 per request'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExhaustedModal;
