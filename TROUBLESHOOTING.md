# Troubleshooting Guide

## "Failed to fetch" Error When Saving Consultation Notes

### Problem
When clicking "Save Note" in the Patient Details page, you see an error: "Cannot connect to ML service at http://localhost:8000"

### Root Cause
The ML service (running on port 8000) is not running or not accessible.

### Solution

#### 1. Check if ML Service is Running
The ML service should be running on port 8000. You can verify this by:
- Opening your browser and navigating to: `http://localhost:8000/health`
- If you see a JSON response with service status, the service is running
- If you get "Cannot connect" or timeout, the service is not running

#### 2. Start the ML Service
If the service is not running, start it using one of these methods:

**Option A: Use the startup script (Recommended)**
```powershell
.\start-services.ps1
```

**Option B: Start ML service manually**
```powershell
cd apps/ml-service
uvicorn server:app --reload --port 8000
```

#### 3. Verify Service is Running
After starting the service:
1. Go to Patient Details page
2. Try to save a consultation note
3. If you see the error, click "Check Service Status" button
4. The status should show: ✅ ML Service is running

### Common Issues

#### Port Already in Use
If you see "Address already in use" error:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Missing Dependencies
If the service fails to start due to missing packages:
```powershell
cd apps/ml-service
pip install -r requirements.txt
```

#### Database Connection Issues
If you see MongoDB connection errors:
- Check that MONGO_URI in `.env` file is correct
- Verify you have internet connection (if using MongoDB Atlas)
- Check MongoDB Atlas IP whitelist settings

#### LLM API Issues
If notes save but without AI processing:
- Check that OPENROUTER_API_KEY in `.env` file is valid
- Verify the API key has credits/quota available
- Check console logs for specific LLM errors

### Service Architecture

The application uses multiple services:
- **Port 5000**: API Gateway (Node.js)
- **Port 8000**: ML Service (FastAPI) - Handles consultation notes
- **Port 9000**: DDI Service (FastAPI) - Handles drug interactions
- **Port 5173**: Web App (React/Vite)

All services must be running for full functionality.

### Getting Help

If the issue persists:
1. Check browser console (F12) for detailed error messages
2. Check ML service terminal for error logs
3. Verify all environment variables in `.env` file are set correctly
4. Try restarting all services using `start-services.ps1`
