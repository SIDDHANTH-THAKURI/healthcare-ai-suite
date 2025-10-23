# 🔑 BYOK (Bring Your Own Key) Implementation Guide

## Overview

DrugNexusAI now supports a **Bring Your Own Key (BYOK)** model for the AI chatbot:
- **Free Tier**: 20 messages per day using our API key
- **Unlimited**: Add your own OpenRouter API key for unlimited messages

---

## 🎯 How It Works

### For Users

1. **Sign up** → Get 20 free AI chat messages per day
2. **Use chatbot** → Counter shows remaining messages (e.g., "19/20 remaining")
3. **Hit limit** → Prompt to add own API key
4. **Add API key** → Unlimited messages forever

### For Developers

**Backend Changes:**
- Added `openrouterApiKey`, `dailyMessageCount`, `lastMessageDate` to Account model
- Created `/api/api-key` routes for managing keys
- Updated `/api/chat/message` to check limits and use appropriate API key
- Automatic daily reset of message counter

**Frontend Changes Needed:**
- Settings page to add/remove API key
- Message counter display in chat
- Upgrade prompt when limit reached
- Instructions on getting OpenRouter API key

---

## 📡 API Endpoints

### 1. Get API Key Status
```http
GET /api/api-key/status/:userId
```

**Response:**
```json
{
  "hasApiKey": false,
  "dailyMessageCount": 15,
  "dailyLimit": 20,
  "remaining": 5,
  "isUnlimited": false
}
```

### 2. Save API Key
```http
POST /api/api-key/save
Content-Type: application/json

{
  "userId": "user_id_here",
  "apiKey": "sk-or-v1-..."
}
```

**Response:**
```json
{
  "message": "API key saved successfully",
  "hasApiKey": true,
  "isUnlimited": true
}
```

### 3. Remove API Key
```http
DELETE /api/api-key/remove/:userId
```

**Response:**
```json
{
  "message": "API key removed successfully",
  "hasApiKey": false,
  "isUnlimited": false
}
```

### 4. Send Chat Message (Updated)
```http
POST /api/chat/message
Content-Type: application/json

{
  "patientId": "patient_id",
  "content": "Hello",
  "userId": "user_id_here"  // NEW: Required for limit checking
}
```

**Success Response:**
```json
{
  "userMessage": {...},
  "assistantMessage": {...},
  "remaining": 19,
  "limit": 20,
  "hasOwnKey": false
}
```

**Limit Exceeded Response (429):**
```json
{
  "message": "Daily message limit reached",
  "error": "FREE_LIMIT_EXCEEDED",
  "remaining": 0,
  "limit": 20,
  "needsApiKey": true,
  "upgradeMessage": "You have used all 20 free messages today. Add your own OpenRouter API key in Settings for unlimited messages!"
}
```

---

## 🎨 Frontend Implementation Guide

### 1. Update Chat Component

```typescript
// PatientPortal.tsx or Chat component
const [messageLimit, setMessageLimit] = useState({ remaining: 20, limit: 20, hasOwnKey: false });

// Fetch limit status on mount
useEffect(() => {
  fetch(`/api/api-key/status/${userId}`)
    .then(res => res.json())
    .then(data => {
      setMessageLimit({
        remaining: data.remaining,
        limit: data.dailyLimit,
        hasOwnKey: data.hasApiKey
      });
    });
}, [userId]);

// Update after each message
const sendMessage = async (content: string) => {
  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      content,
      userId  // Add this!
    })
  });

  if (response.status === 429) {
    // Show upgrade prompt
    showUpgradeModal();
    return;
  }

  const data = await response.json();
  setMessageLimit({
    remaining: data.remaining,
    limit: data.limit,
    hasOwnKey: data.hasOwnKey
  });
};
```

### 2. Display Message Counter

```tsx
{!messageLimit.hasOwnKey && (
  <div className="message-counter">
    {messageLimit.remaining > 5 ? (
      <span>💬 {messageLimit.remaining}/{messageLimit.limit} free messages remaining today</span>
    ) : messageLimit.remaining > 0 ? (
      <span className="warning">⚠️ Only {messageLimit.remaining} messages left today!</span>
    ) : (
      <span className="error">❌ Daily limit reached. Add API key for unlimited messages.</span>
    )}
  </div>
)}

{messageLimit.hasOwnKey && (
  <div className="unlimited-badge">
    ✨ Unlimited messages
  </div>
)}
```

### 3. Create Settings Page for API Key

```tsx
// Settings.tsx
const [apiKey, setApiKey] = useState('');
const [hasKey, setHasKey] = useState(false);

const saveApiKey = async () => {
  const response = await fetch('/api/api-key/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, apiKey })
  });

  if (response.ok) {
    setHasKey(true);
    alert('API key saved! You now have unlimited messages.');
  }
};

const removeApiKey = async () => {
  await fetch(`/api/api-key/remove/${userId}`, { method: 'DELETE' });
  setHasKey(false);
  setApiKey('');
};

return (
  <div className="settings-page">
    <h2>AI Chat Settings</h2>
    
    {!hasKey ? (
      <>
        <p>Add your OpenRouter API key for unlimited AI chat messages.</p>
        <ol>
          <li>Go to <a href="https://openrouter.ai" target="_blank">openrouter.ai</a></li>
          <li>Sign up (free)</li>
          <li>Get $5 free credits (~5000 messages)</li>
          <li>Copy your API key</li>
          <li>Paste it below</li>
        </ol>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-or-v1-..."
        />
        <button onClick={saveApiKey}>Save API Key</button>
      </>
    ) : (
      <>
        <p>✅ API key configured. You have unlimited messages!</p>
        <button onClick={removeApiKey}>Remove API Key</button>
      </>
    )}
  </div>
);
```

### 4. Upgrade Modal

```tsx
const UpgradeModal = ({ onClose }: { onClose: () => void }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Daily Limit Reached</h2>
      <p>You've used all 20 free messages today.</p>
      
      <div className="options">
        <div className="option">
          <h3>Option 1: Wait</h3>
          <p>Your free messages reset tomorrow</p>
        </div>
        
        <div className="option recommended">
          <h3>Option 2: Add Your API Key (Recommended)</h3>
          <p>Get unlimited messages forever!</p>
          <ul>
            <li>Free $5 credits from OpenRouter</li>
            <li>~5000 messages included</li>
            <li>Takes 2 minutes to setup</li>
          </ul>
          <button onClick={() => navigate('/settings')}>
            Add API Key
          </button>
        </div>
      </div>
      
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);
```

---

## 🔒 Security Notes

1. **API keys are stored in MongoDB** - Consider encrypting them
2. **Validate API key format** - Must start with `sk-or-v1-`
3. **Never expose keys in frontend** - Only send to backend
4. **Rate limiting** - Even with own key, consider max 200 msgs/day per user

---

## 📊 Cost Analysis

**Your Costs (Free Tier):**
- 100 users × 20 messages/day = 2000 messages/day
- Cost: ~$10/month

**User Costs (With Own Key):**
- $5 free credits = ~5000 messages
- After that: ~$0.001 per message
- $10 = ~10,000 messages

---

## 🎯 Next Steps

1. **Frontend**: Implement Settings page for API key management
2. **Frontend**: Add message counter to chat interface
3. **Frontend**: Create upgrade modal
4. **Testing**: Test limit enforcement
5. **Documentation**: Add user guide to README
6. **Optional**: Add API key encryption

---

## 📝 User Instructions (Add to README)

### How to Get Unlimited AI Chat

1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up (free account)
3. Get $5 free credits (enough for ~5000 messages)
4. Copy your API key (starts with `sk-or-v1-`)
5. Go to Settings in DrugNexusAI
6. Paste your API key
7. Enjoy unlimited AI chat!

**Note**: Your API key is stored securely and only used for your messages.

---

## 🐛 Troubleshooting

**"Invalid API key format"**
- Make sure key starts with `sk-or-v1-`
- Copy the entire key from OpenRouter

**"Daily limit reached" but I added my key**
- Refresh the page
- Check Settings to confirm key is saved

**Messages still counting down after adding key**
- Refresh the page
- Check API key status endpoint

---

## ✅ Implementation Checklist

Backend:
- [x] Update Account model with API key fields
- [x] Create API key management routes
- [x] Update chat router with limit checking
- [x] Add daily counter reset logic
- [x] Register new router in server.ts

Frontend (TODO):
- [ ] Create Settings page for API key
- [ ] Add message counter to chat
- [ ] Create upgrade modal
- [ ] Update chat component to pass userId
- [ ] Add instructions/help text
- [ ] Test limit enforcement
- [ ] Test API key save/remove

