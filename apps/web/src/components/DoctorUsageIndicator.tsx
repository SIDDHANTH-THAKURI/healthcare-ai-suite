import React from 'react';
import './DoctorUsageIndicator.css';

interface DoctorUsageIndicatorProps {
  hasOwnKey: boolean;
  remaining?: number;
  limit?: number;
  usage?: number;
  onSettingsClick: () => void;
}

const DoctorUsageIndicator: React.FC<DoctorUsageIndicatorProps> = ({
  hasOwnKey,
  remaining = 0,
  limit = 50,
  usage = 0,
  onSettingsClick
}) => {
  const percentage = hasOwnKey ? 0 : ((limit - remaining) / limit) * 100;
  const isLow = !hasOwnKey && remaining <= 10;

  return (
    <div className={`doctor-usage-indicator ${isLow ? 'low' : ''}`}>
      <div className="usage-header" onClick={onSettingsClick}>
        <div className="usage-icon">
          {hasOwnKey ? '🔑' : '📊'}
        </div>
        <div className="usage-info">
          {hasOwnKey ? (
            <>
              <div className="usage-label">Your API Key</div>
              <div className="usage-value">{usage} requests used</div>
            </>
          ) : (
            <>
              <div className="usage-label">Free Tier</div>
              <div className="usage-value">{remaining}/{limit} remaining</div>
            </>
          )}
        </div>
        <button className="settings-icon-btn" title="Settings">
          <i className="fas fa-cog"></i>
        </button>
      </div>
      
      {!hasOwnKey && (
        <div className="usage-bar">
          <div 
            className="usage-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
      
      {isLow && (
        <div className="usage-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Running low!</span>
        </div>
      )}
    </div>
  );
};

export default DoctorUsageIndicator;
