# Chatbot Troubleshooting Guide 🤖

## Error: "Sorry, I encountered an error connecting to the AI assistant"

This error means the frontend cannot connect to the backend API. Here's how to fix it:

### Step 1: Check if Backend is Running

Open your terminal and check if the backend server is running:

```bash
# Navigate to api-gateway
cd apps/api-gateway

# Check if server is running (you should see "Server running on port 5000")
# If not, start it:
npm run dev
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

### Step 2: Verify Backend Health

Open your browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "...",
  "mongodb": "connected"
}
```

### Step 3: Test Chat Endpoint

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientId: 'test-user',
    content: 'Hello'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### Step 4: Check OpenRouter API Key

The chatbot uses OpenRouter for AI responses. Verify your API key in `.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions
LLM_MODEL=deepseek/deepseek-chat-v3.1:free
```

**Note**: Even if OpenRouter fails, the chatbot will now provide fallback responses!

### Step 5: Check Browser Console

Open browser console (F12) and look for error messages:

**Common Errors:**

1. **"Failed to fetch"** or **"NetworkError"**
   - Backend is not running
   - Wrong port (should be 5000)
   - CORS issue

2. **"404 Not Found"**
   - Chat router not registered
   - Check `apps/api-gateway/src/server.ts` has:
     ```typescript
     import chatRouter from './routes/chatRouter';
     app.use('/api/chat', chatRouter);
     ```

3. **"500 Internal Server Error"**
   - Check backend terminal for error logs
   - MongoDB connection issue
   - OpenRouter API issue (now has fallback)

### Step 6: Restart Everything

If all else fails, restart both servers:

```bash
# Terminal 1 - Backend
cd apps/api-gateway
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

Then refresh your browser with **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac) to clear cache.

## Improved Error Messages

The chatbot now shows specific error messages:

- **"Cannot connect to the server"** → Backend not running
- **"Issue with the AI service"** → OpenRouter API problem (but fallback works!)
- **Other errors** → Shows the actual error message

## Fallback System

Even if OpenRouter API fails, the chatbot will still work with pre-programmed responses:

- **Adding medications**: "I've added the medications to your schedule..."
- **Scheduling appointments**: "I've scheduled your appointment..."
- **General queries**: "I'm here to help! I can assist you with..."

## Testing the Chatbot

Try these test messages:

1. **"Hello"** - Should get a friendly greeting
2. **"Doctor prescribed Aspirin 81mg daily"** - Should add medication
3. **"Schedule appointment with Dr. Smith tomorrow at 3pm"** - Should create appointment
4. **"What medications do I have today?"** - Should list medications

## Still Having Issues?

Check the backend terminal for detailed error logs. The improved logging will show:
- Request received
- OpenRouter API calls
- Any errors with full details

Look for lines like:
```
Chat error: [detailed error message]
OpenRouter API error: [API response]
```

## Quick Fix Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] `.env` file has OPENROUTER_API_KEY
- [ ] Browser console shows no CORS errors
- [ ] Hard refresh browser (Ctrl+Shift+R)

If all checked and still not working, check the backend terminal logs for specific errors!
