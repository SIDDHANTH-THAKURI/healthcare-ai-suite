Write-Host "Starting MedMatch Services..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting API Gateway (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/api-gateway; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Starting ML Service (Port 8000)..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/ml-service; uvicorn server:app --reload --port 8000"

Start-Sleep -Seconds 3

Write-Host "Starting DDI Service (Port 9000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/ddi-service; uvicorn server2:app --reload --port 9000"

Start-Sleep -Seconds 3

Write-Host "Starting Web App (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/web; npm run dev"

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Check the opened PowerShell windows for status." -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "- API Gateway: http://localhost:5000" -ForegroundColor Gray
Write-Host "- ML Service: http://localhost:8000" -ForegroundColor Gray  
Write-Host "- DDI Service: http://localhost:9000" -ForegroundColor Gray
Write-Host "- Web App: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")