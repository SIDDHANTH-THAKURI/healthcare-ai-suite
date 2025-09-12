Write-Host "Checking DrugNexusAI Services..." -ForegroundColor Green
Write-Host ""

$services = @(
    @{Name="API Gateway"; Port=5000; Url="http://localhost:5000/health"},
    @{Name="ML Service"; Port=8000; Url="http://localhost:8000/health"},
    @{Name="DDI Service"; Port=9000; Url="http://localhost:9000/health"},
    @{Name="Web App"; Port=5173; Url="http://localhost:5173"}
)

foreach ($service in $services) {
    Write-Host "Checking $($service.Name) (Port $($service.Port))..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ Running" -ForegroundColor Green
        } else {
            Write-Host " ❌ Error (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    }
    catch {
        Write-Host " ❌ Not responding" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Port Status:" -ForegroundColor Yellow
$ports = @(5000, 8000, 9000, 5173)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "Port ${port}: Running" -ForegroundColor Green
    } else {
        Write-Host "Port ${port}: Not running" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "To start services:" -ForegroundColor Cyan
Write-Host "- All services: .\start-services.ps1" -ForegroundColor Gray
Write-Host "- Individual: npm run dev:api, npm run dev:ml, npm run dev:ddi, npm run dev:web" -ForegroundColor Gray