# Healthcare AI Suite Development Script (Windows)
Write-Host "🚀 Starting Healthcare AI Suite..." -ForegroundColor Green

# Function to start services in background
function Start-Service {
    param($Name, $Path, $Command)
    Write-Host "Starting $Name..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; $Command" -WindowStyle Minimized
}

# Start all services
Start-Service "Web App (React)" "apps/web" "npm run dev"
Start-Service "API Gateway (Node.js)" "apps/api-gateway" "npm run dev"
Start-Service "ML Service (Python)" "apps/ml-service" "uvicorn server:app --reload --port 8000"
Start-Service "DDI Service (Python)" "apps/ddi-service" "uvicorn server2:app --reload --port 9000"

Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "🌐 Web: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔗 API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🧠 ML: http://localhost:8000" -ForegroundColor Cyan
Write-Host "💊 DDI: http://localhost:9000" -ForegroundColor Cyan