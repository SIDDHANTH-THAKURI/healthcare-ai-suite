# 🎨 BYOK System Architecture

## Visual System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (PatientPortal.tsx)                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CHAT INTERFACE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chat Header                                              │  │
│  │  ┌────────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐ │  │
│  │  │ 💬 19/20   │  │ ⚙️ Settings│  │ 📎 Upload│  │ ▼ Close │ │  │
│  │  │ free msgs  │  │           │  │         │  │         │ │  │
│  │  └────────────┘  └──────────┘  └────────┘  └─────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Chat Messages                                            │  │
│  │  • User messages                                          │  │
│  │  • AI responses                                           │  │
│  │  • Scrollable history                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Input Area                                               │  │
│  │  [Type your message...] [Send]                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   User Sends Message  │
                    └───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LOGIC                             │
│                                                                 │
│  1. Get userId from localStorage                                │
│  2. Send POST to /api/chat/message                              │
│  3. Include: { patientId, content, userId }                     │
│  4. Wait for response...                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                │
│                   (chatRouter.ts)                               │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Step 1: Check Message Limit                              │ │
│  │  • Query MongoDB for user                                 │ │
│  │  • Check dailyMessageCount                                │ │
│  │  • Check if user has API key                              │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│                                │                                │
│                                ▼                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Step 2: Decide Which API Key to Use                      │ │
│  │                                                            │ │
│  │  Has API Key?                                              │ │
│  │  ├─ YES → Use user's OpenRouter key (unlimited)           │ │
│  │  └─ NO  → Check limit                                      │ │
│  │           ├─ Under 20 → Use your key, increment count     │ │
│  │           └─ At 20    → Return 429 error                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Step 3: Call OpenRouter API                              │ │
│  │  • Send message to AI                                     │ │
│  │  • Get response                                            │ │
│  │  • Save to chat history                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Step 4: Return Response                                   │ │
│  │  {                                                         │ │
│  │    assistantMessage: { content, timestamp },               │ │
│  │    remaining: 19,                                          │ │
│  │    limit: 20,                                              │ │
│  │    hasOwnKey: false                                        │ │
│  │  }                                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND RESPONSE HANDLING                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Success (200)                                             │ │
│  │  • Display AI message                                      │ │
│  │  • Update message counter: 19/20                           │ │
│  │  • Scroll to bottom                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Limit Reached (429)                                       │ │
│  │  • Show Upgrade Modal                                      │ │
│  │  • Set remaining to 0                                      │ │
│  │  • Offer two options:                                      │ │
│  │    1. Wait Until Tomorrow                                  │ │
│  │    2. Add Your API Key                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  User Clicks          │
                    │  "Add Your API Key"   │
                    └───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SETTINGS MODAL                             │
│                   (APIKeySettings.tsx)                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Current Status                                            │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  🆓 Free Plan                                        │  │ │
│  │  │  20 messages per day                                 │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  How to Get Your API Key                                  │ │
│  │  1. Visit https://openrouter.ai                           │ │
│  │  2. Sign up (free $5 credits!)                            │ │
│  │  3. Copy your API key                                     │ │
│  │  4. Paste below                                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  API Key Input                                             │ │
│  │  [sk-or-v1-••••••••••••••••••••] [👁️]                     │ │
│  │  [Save API Key]                                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  FAQ                                                       │ │
│  │  • Is my API key secure?                                  │ │
│  │  • How much does it cost?                                 │ │
│  │  • Can I remove my key?                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  User Saves API Key   │
                    └───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                │
│                   (apiKeyRouter.ts)                             │
│                                                                 │
│  POST /api/api-key/save                                         │
│  {                                                              │
│    userId: "abc123",                                            │
│    apiKey: "sk-or-v1-..."                                       │
│  }                                                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  1. Validate API key format                               │ │
│  │  2. Encrypt API key                                        │ │
│  │  3. Save to MongoDB                                        │ │
│  │  4. Reset dailyMessageCount to 0                           │ │
│  │  5. Return success                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUCCESS!                                     │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ✅ API Key Saved Successfully!                            │ │
│  │                                                            │ │
│  │  Status Updated:                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  ✨ Unlimited Plan                                   │  │ │
│  │  │  Unlimited messages                                  │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │  Chat Header Updated:                                      │ │
│  │  [∞ Unlimited] [⚙️] [📎] [▼]                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  User Sends Messages  │
                    │  (Unlimited!)         │
                    └───────────────────────┘
```

---

## 🔄 Daily Reset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      MIDNIGHT (00:00)                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CRON JOB TRIGGERS                            │
│                   (Backend Scheduler)                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Find all users where:                                     │ │
│  │  • hasApiKey = false                                       │ │
│  │  • dailyMessageCount > 0                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Reset dailyMessageCount to 0                             │ │
│  │  Update lastResetDate to today                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Log: "Reset X users' message counts"                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USERS GET FRESH START                        │
│                                                                 │
│  Free Users:                                                    │
│  • Counter resets to 20/20                                      │
│  • Can send 20 more messages                                    │
│                                                                 │
│  Premium Users (with API key):                                  │
│  • Not affected                                                 │
│  • Still unlimited                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 User Journey Map

### New User (Day 1):
```
Sign Up → 20 Free Messages → Send 15 Messages → Counter: 5/20
                                                      ↓
                                              Still has 5 left
```

### New User (Hits Limit):
```
Send 20 Messages → Counter: 0/20 → Send 21st → Upgrade Modal
                                                      ↓
                                    ┌─────────────────┴─────────────────┐
                                    ▼                                   ▼
                          Wait Until Tomorrow                  Add API Key
                                    │                                   │
                                    ▼                                   ▼
                          Midnight Reset                      Unlimited Messages
                          Back to 20/20                       Forever! 🎉
```

### Premium User:
```
Add API Key → ∞ Unlimited → Send Messages → No Limits Ever! 🚀
```

---

## 💾 Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Collection                         │
│                         "users"                                 │
│                                                                 │
│  {                                                              │
│    _id: ObjectId("..."),                                        │
│    email: "user@example.com",                                   │
│    name: "John Doe",                                            │
│    password: "hashed...",                                       │
│                                                                 │
│    // BYOK Fields:                                              │
│    openRouterApiKey: "encrypted_sk-or-v1-...",  // Encrypted   │
│    hasApiKey: false,                             // Boolean     │
│    dailyMessageCount: 15,                        // 0-20        │
│    lastResetDate: ISODate("2024-01-15"),        // Date         │
│                                                                 │
│    createdAt: ISODate("2024-01-01"),                            │
│    updatedAt: ISODate("2024-01-15")                             │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ENTERS API KEY                          │
│                  "sk-or-v1-abc123..."                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND VALIDATION                          │
│  • Check format (starts with sk-or-v1-)                         │
│  • Check length (> 20 characters)                               │
│  • Show password dots (••••••)                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEND TO BACKEND                              │
│  POST /api/api-key/save                                         │
│  { userId, apiKey }                                             │
│  ⚠️ HTTPS only in production!                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND ENCRYPTION                           │
│  • Validate format again                                        │
│  • Encrypt with crypto library                                  │
│  • Never log the key                                            │
│  • Store encrypted version only                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB STORAGE                              │
│  {                                                              │
│    openRouterApiKey: "encrypted_...",  ← Not readable          │
│    hasApiKey: true                                              │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WHEN NEEDED                                  │
│  • Decrypt in backend only                                      │
│  • Use for OpenRouter API call                                  │
│  • Never send to frontend                                       │
│  • Never log decrypted key                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Cost Comparison

### Scenario: 1000 Users

#### Without BYOK:
```
1000 users × 20 messages/day = 20,000 messages/day
20,000 × $0.001 = $20/day
$20 × 30 days = $600/month
$600 × 12 months = $7,200/year

💸 YOUR COST: $7,200/year
```

#### With BYOK:
```
Free Users (800):
  800 × 20 messages/day = 16,000 messages/day
  16,000 × $0.001 = $16/day
  $16 × 30 days = $480/month

Premium Users (200):
  200 × unlimited = They pay their own costs!
  YOUR COST: $0

💰 YOUR COST: $480/month (67% savings!)
```

#### With More Premium Users:
```
Free Users (500):
  $300/month

Premium Users (500):
  $0 (they pay)

💰 YOUR COST: $300/month (83% savings!)
```

---

## 🎉 Summary

This BYOK system provides:

✅ **Scalability** - Unlimited users
✅ **Cost Savings** - 67-83% reduction
✅ **User Value** - $5 free credits
✅ **Professional UX** - Beautiful interface
✅ **Security** - Encrypted storage
✅ **Flexibility** - Easy to modify

**Ready to use!** 🚀
