# Healthcare AI Suite - Development Startup Script
Write-Host "🚀 Starting Healthcare AI Suite Development Environment..." -ForegroundColor Green

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if (-not $mongoProcess) {
    Write-Host "⚠️  MongoDB not detected. Please start MongoDB first." -ForegroundColor Red
    Write-Host "   You can start it with: mongod --dbpath C:\data\db" -ForegroundColor Yellow
}

# Start Frontend (React)
Write-Host "🌐 Starting Frontend (React)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps/web'; npm run dev" -WindowStyle Normal

# Start API Gateway (Node.js)
Write-Host "🔗 Starting API Gateway (Node.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps/api-gateway'; npm run dev" -WindowStyle Normal

# Note about Python services
Write-Host ""
Write-Host "🐍 Python Services:" -ForegroundColor Yellow
Write-Host "   To start ML Service: cd apps/ml-service && uvicorn server:app --reload --port 8000" -ForegroundColor White
Write-Host "   To start DDI Service: cd apps/ddi-service && uvicorn server2:app --reload --port 9000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Note: Python services may need dependency installation first:" -ForegroundColor Yellow
Write-Host "   pip install transformers torch fastapi uvicorn pymongo python-dotenv" -ForegroundColor White

Write-Host ""
Write-Host "✅ Core services started!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔗 API Gateway: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🧠 ML Service: http://localhost:8000 (manual start)" -ForegroundColor Yellow
Write-Host "💊 DDI Service: http://localhost:9000 (manual start)" -ForegroundColor Yellow