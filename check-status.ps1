# FoiyFoshi Application Status Checker
Write-Host "FoiyFoshi Application Status Check" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check Backend
Write-Host "Backend Server (Port 5000):" -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5
    Write-Host "   RUNNING - Status: $($backend.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($backend.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Check Frontend
Write-Host "Frontend Server (Port 3000):" -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "   RUNNING - Status: $($frontend.StatusCode)" -ForegroundColor Green
    Write-Host "   Content Length: $($frontend.RawContentLength) bytes" -ForegroundColor Gray
} catch {
    Write-Host "   NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# Check Node.js processes
Write-Host "Node.js Processes:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "   PID: $($_.Id) | CPU: $($_.CPU)" -ForegroundColor Gray
    }
} else {
    Write-Host "   No Node.js processes found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Magenta
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Admin:    http://localhost:3000/admin" -ForegroundColor Cyan 