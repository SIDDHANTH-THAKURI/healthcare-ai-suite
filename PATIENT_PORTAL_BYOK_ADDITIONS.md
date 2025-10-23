# Patient Portal BYOK Integration - Code to Add

## 1. Add these JSX components before the closing `</div>` and `</div>` tags (before `export default PatientPortal;`)

```tsx
      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-container settings-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSettings(false)}>
              <i className="fas fa-times"></i>
            </button>
            <APIKeySettings userId={(() => {
              const user = localStorage.getItem('user');
              const userData = user ? JSON.parse(user) : null;
              return userData?._id || userData?.id || 'demo-patient-001';
            })()} />
          </div>
        </div>
      )}
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false);
            setShowSettings(true);
          }}
          remaining={messageLimit.remaining}
        />
      )}
```

## 2. Add Message Counter in Chat Header

Find the chat header section (where the chat title is) and add this counter:

```tsx
{/* Add this in the chat header, after the title */}
<div className="chat-header-actions">
  {!messageLimit.hasOwnKey && (
    <div className={`message-counter ${messageLimit.remaining <= 5 ? 'warning' : ''}`}>
      <i className="fas fa-comment-dots"></i>
      <span>{messageLimit.remaining}/{messageLimit.limit} free messages</span>
    </div>
  )}
  {messageLimit.hasOwnKey && (
    <div className="unlimited-badge">
      <i className="fas fa-infinity"></i>
      <span>Unlimited</span>
    </div>
  )}
  <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
    <i className="fas fa-cog"></i>
  </button>
</div>
```

## 3. Add CSS for the new components in PatientPortal.css

```css
/* Settings Modal */
.settings-modal {
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  padding: 0;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f0f0f0;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close-btn:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

/* Chat Header Actions */
.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.message-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #e8f0f7 0%, #d4e6f5 100%);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2A9D8F;
  border: 2px solid #2A9D8F;
}

.message-counter.warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-color: #ffc107;
  color: #856404;
  animation: pulse 2s ease-in-out infinite;
}

.message-counter i {
  font-size: 1rem;
}

.unlimited-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #28a745;
  border: 2px solid #28a745;
}

.unlimited-badge i {
  font-size: 1rem;
}

.settings-btn {
  background: #f0f0f0;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666;
}

.settings-btn:hover {
  background: #2A9D8F;
  color: white;
  transform: scale(1.1);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header-actions {
    flex-wrap: wrap;
  }
  
  .message-counter,
  .unlimited-badge {
    font-size: 0.75rem;
    padding: 0.4rem 0.75rem;
  }
}
```

## 4. Alternative: Add Settings Button to Main Dashboard

If you want a settings button in the main dashboard (not just in chat), find the dashboard section and add:

```tsx
<button className="dashboard-action-btn" onClick={() => setShowSettings(true)}>
  <i className="fas fa-cog"></i>
  <span>Settings</span>
</button>
```

## Summary of Changes Made

✅ Added imports for APIKeySettings and UpgradeModal
✅ Added state variables for showSettings, messageLimit, showUpgradeModal
✅ Added fetchMessageLimitStatus function
✅ Updated sendMessage to include userId and handle 429 errors
✅ Updated sendMessage to update message limit from response

## What You Need to Do

1. Add the Settings Modal and Upgrade Modal JSX (section 1 above)
2. Add the message counter in chat header (section 2 above)
3. Add the CSS styles (section 3 above)
4. Test the integration!

The backend is already complete and ready to use!
