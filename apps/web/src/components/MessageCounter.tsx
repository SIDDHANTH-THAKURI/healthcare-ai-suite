import React from 'react';

interface MessageCounterProps {
  remaining: number;
  limit: number;
  hasOwnKey: boolean;
  onSettingsClick: () => void;
}

const MessageCounter: React.FC<MessageCounterProps> = ({ remaining, limit, hasOwnKey, onSettingsClick }) => {
  return (
    <div className="chat-header-actions">
      {!hasOwnKey && (
        <div className={`message-counter ${remaining <= 5 ? 'warning' : ''}`}>
          <i className="fas fa-comment-dots"></i>
          <span>{remaining}/{limit} free messages</span>
        </div>
      )}
      {hasOwnKey && (
        <div className="unlimited-badge">
          <i className="fas fa-infinity"></i>
          <span>Unlimited</span>
        </div>
      )}
      <button className="settings-btn" onClick={onSettingsClick} title="API Settings">
        <i className="fas fa-cog"></i>
      </button>
    </div>
  );
};

export default MessageCounter;
