import React, { useState, useEffect } from 'react';
import './APIKeySettings.css';
import { BASE_URL_1 } from '../base';

interface APIKeySettingsProps {
  userId: string;
  onStatusChange?: () => void;
}

const APIKeySettings: React.FC<APIKeySettingsProps> = ({ userId, onStatusChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL_1}/api/api-key/status/${userId}`);
      const data = await response.json();
      setStatus(data);
      setHasKey(data.hasApiKey);
    } catch (error) {
      console.error('Error fetching API key status:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    if (!apiKey.startsWith('sk-or-v1-')) {
      setMessage({ type: 'error', text: 'Invalid API key format. OpenRouter keys start with sk-or-v1-' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${BASE_URL_1}/api/api-key/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, apiKey })
      });

      if (response.ok) {
        setHasKey(true);
        setApiKey('');
        setMessage({ type: 'success', text: '✅ API key saved! You now have unlimited messages.' });
        await fetchStatus();
        onStatusChange?.(); // Notify parent to refresh
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to save API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const removeApiKey = async () => {
    if (!confirm('Remove your API key and switch back to free tier?\n\nYou will:\n• Use the default system API key\n• Be limited to 25 messages per day\n• Keep all your data and chat history')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${BASE_URL_1}/api/api-key/remove/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setHasKey(false);
        setApiKey('');
        setMessage({ type: 'success', text: '✅ Switched back to free tier! You now have 25 messages/day using our default API key.' });
        await fetchStatus();
        onStatusChange?.(); // Notify parent to refresh
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove API key' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-key-settings">
      <div className="settings-header">
        <i className="fas fa-key"></i>
        <h2>AI Chat API Settings</h2>
      </div>

      {/* Current Status */}
      {status && (
        <div className={`status-card ${hasKey ? 'unlimited' : 'free'}`}>
          <div className="status-icon">
            {hasKey ? '✨' : '🎁'}
          </div>
          <div className="status-info">
            <h3>{hasKey ? 'Unlimited Plan' : 'Free Tier'}</h3>
            {hasKey ? (
              <p>You have unlimited AI chat messages</p>
            ) : (
              <p>
                <strong>{status.remaining}/{status.dailyLimit}</strong> free messages remaining today
              </p>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Add API Key Section */}
      {!hasKey ? (
        <div className="add-key-section">
          <h3>🚀 Upgrade to Unlimited Messages</h3>
          <p className="description">
            Add your own OpenRouter API key to get unlimited AI chat messages. It's free to start!
          </p>

          <div className="benefits">
            <div className="benefit">
              <i className="fas fa-infinity"></i>
              <span>Unlimited messages</span>
            </div>
            <div className="benefit">
              <i className="fas fa-gift"></i>
              <span>$5 free credits</span>
            </div>
            <div className="benefit">
              <i className="fas fa-clock"></i>
              <span>2 min setup</span>
            </div>
          </div>

          <div className="instructions">
            <h4>How to get your API key:</h4>
            <ol>
              <li>
                Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">
                  openrouter.ai <i className="fas fa-external-link-alt"></i>
                </a>
              </li>
              <li>Sign up for a free account</li>
              <li>Get $5 free credits (~5000 messages)</li>
              <li>Go to <strong>Keys</strong> section</li>
              <li>Create a new API key</li>
              <li>Copy and paste it below</li>
            </ol>
          </div>

          <div className="input-group">
            <label htmlFor="api-key-input">
              <i className="fas fa-key"></i> OpenRouter API Key
            </label>
            <div className="input-wrapper">
              <input
                id="api-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                disabled={isLoading}
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                <i className={`fas fa-eye${showKey ? '-slash' : ''}`}></i>
              </button>
            </div>
            <small>Your API key is stored securely and only used for your messages</small>
          </div>

          <button
            className="save-button"
            onClick={saveApiKey}
            disabled={isLoading || !apiKey.trim()}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save API Key
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="has-key-section">
          <div className="success-card">
            <i className="fas fa-check-circle"></i>
            <h3>API Key Configured</h3>
            <p>You're all set! Enjoy unlimited AI chat messages.</p>
          </div>

          <div className="key-info">
            <div className="info-item">
              <i className="fas fa-shield-alt"></i>
              <div>
                <strong>Secure</strong>
                <p>Your key is encrypted and stored safely</p>
              </div>
            </div>
            <div className="info-item">
              <i className="fas fa-infinity"></i>
              <div>
                <strong>Unlimited</strong>
                <p>No daily message limits</p>
              </div>
            </div>
            <div className="info-item">
              <i className="fas fa-dollar-sign"></i>
              <div>
                <strong>Your Credits</strong>
                <p>Check balance at openrouter.ai</p>
              </div>
            </div>
          </div>

          <div className="info-box" style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'start'
          }}>
            <i className="fas fa-info-circle" style={{ color: '#0284c7', marginTop: '2px' }}></i>
            <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
              <strong>Want to switch back?</strong>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                You can remove your API key anytime to return to the free tier (25 messages/day using our default key).
              </p>
            </div>
          </div>

          <button
            className="remove-button"
            onClick={removeApiKey}
            disabled={isLoading}
            title="Switch back to free tier (25 messages/day)"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Switching...
              </>
            ) : (
              <>
                <i className="fas fa-undo"></i> Switch to Free Tier
              </>
            )}
          </button>
        </div>
      )}

      {/* FAQ */}
      <div className="faq-section">
        <h4>❓ Frequently Asked Questions</h4>
        <details>
          <summary>Is it really free?</summary>
          <p>Yes! OpenRouter gives you $5 free credits when you sign up, which is enough for about 5,000 messages. After that, it's pay-as-you-go at very low rates (~$0.001 per message).</p>
        </details>
        <details>
          <summary>Is my API key safe?</summary>
          <p>Yes. Your API key is stored securely in our database and only used to make AI requests on your behalf. We never share it with anyone.</p>
        </details>
        <details>
          <summary>Can I remove my key later?</summary>
          <p>Absolutely! You can remove your API key anytime and go back to the free tier (20 messages/day).</p>
        </details>
        <details>
          <summary>What if I run out of credits?</summary>
          <p>You can add more credits to your OpenRouter account at any time. Check your balance at openrouter.ai/credits.</p>
        </details>
      </div>
    </div>
  );
};

export default APIKeySettings;
