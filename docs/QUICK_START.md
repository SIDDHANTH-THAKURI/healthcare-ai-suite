# 🚀 Quick Start Guide - Healthcare AI Suite

## ⚡ Fast Setup (Recommended)

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm run install:all

# Install Python dependencies (if needed)
pip install fastapi uvicorn pymongo python-dotenv transformers torch
```

### 2. Configure Environment
- Copy `.env.example` to `.env` and update with your values
- Ensure MongoDB is running on `mongodb://localhost:27017`

### 3. Start Development

**Option A: Core Services Only (Recommended)**
```bash
npm run dev
```
This starts:
- ✅ Frontend (React) - http://localhost:5173
- ✅ API Gateway (Node.js) - http://localhost:3000

**Option B: All Services (If Python deps are installed)**
```bash
npm run dev:all
```

**Option C: Windows PowerShell Script**
```powershell
npm run start
# or
./scripts/start-dev.ps1
```

### 4. Manual Python Services (If Needed)

If you need the ML/AI features:

```bash
# Terminal 1: ML Service
cd apps/ml-service
uvicorn server:app --reload --port 8000

# Terminal 2: DDI Service  
cd apps/ddi-service
uvicorn server2:app --reload --port 9000
```

## 🔧 Troubleshooting

### Frontend Issues
- **Error**: `Failed to load url /src/main.tsx`
- **Fix**: Files are now in `apps/web/src/` - this should be resolved

### API Gateway Issues
- **Error**: `Missing required env var: MONGO_URI`
- **Fix**: Check `.env` file exists and has correct MongoDB URI

### Python Service Issues
- **Error**: `ModuleNotFoundError: No module named 'transformers'`
- **Fix**: Install Python dependencies:
  ```bash
  pip install transformers torch fastapi uvicorn pymongo python-dotenv
  ```

### MongoDB Issues
- **Error**: Connection refused
- **Fix**: Start MongoDB:
  ```bash
  # Windows
  mongod --dbpath C:\data\db
  
  # macOS/Linux
  brew services start mongodb-community
  # or
  sudo systemctl start mongod
  ```

## 📁 New Project Structure

```
healthcare-ai-suite/
├── apps/
│   ├── web/                # React frontend (Port 5173)
│   ├── api-gateway/        # Node.js API (Port 3000)
│   ├── ml-service/         # Python ML service (Port 8000)
│   └── ddi-service/        # Python DDI service (Port 9000)
├── docs/                   # Documentation
├── scripts/                # Development scripts
└── .env                    # Environment variables
```

## ✅ Success Indicators

When everything is working:
- ✅ Frontend loads at http://localhost:5173
- ✅ API responds at http://localhost:3000
- ✅ No console errors in browser
- ✅ Authentication works
- ✅ Database connections successful

## 🆘 Need Help?

1. Check the logs in each terminal window
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check `.env` file configuration
5. Try restarting services one by one

The restructure preserves all original functionality - everything should work exactly as before, just with better organization!