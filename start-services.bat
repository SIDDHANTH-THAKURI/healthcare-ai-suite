@echo off
echo Starting MedMatch Services...
echo.

echo Starting API Gateway (Port 5000)...
start "API Gateway" cmd /k "cd apps/api-gateway && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting ML Service (Port 8000)...
start "ML Service" cmd /k "cd apps/ml-service && uvicorn server:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting DDI Service (Port 9000)...
start "DDI Service" cmd /k "cd apps/ddi-service && uvicorn server2:app --reload --port 9000"

timeout /t 3 /nobreak >nul

echo Starting Web App (Port 5173)...
start "Web App" cmd /k "cd apps/web && npm run dev"

echo.
echo All services are starting...
echo Check the opened terminal windows for status.
echo.
echo Services:
echo - API Gateway: http://localhost:5000
echo - ML Service: http://localhost:8000  
echo - DDI Service: http://localhost:9000
echo - Web App: http://localhost:5173
echo.
pause