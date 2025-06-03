# FoiyFoshi Application Startup Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting FoiyFoshi Application..." -ForegroundColor Green
Write-Host "📍 Current Directory: $(Get-Location)" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "backend\server.js")) {
    Write-Host "❌ Error: backend\server.js not found!" -ForegroundColor Red
    Write-Host "Please run this script from the FoiyFoshi New directory" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend\package.json")) {
    Write-Host "❌ Error: frontend\package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the FoiyFoshi New directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directory structure verified" -ForegroundColor Green

# Kill any existing Node.js processes
Write-Host "🔄 Stopping any existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd backend
    $env:NODE_ENV = "development"
    $env:JWT_SECRET = "foiyfoshi_secret_key_2024"
    $env:JWT_EXPIRE = "30d"
    $env:PORT = "5000"
    $env:MONGO_URI = "mongodb://localhost:27017/foiyfoshi"
    node server.js
}

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend server is running on http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd frontend
    npm start
}

Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "" -ForegroundColor White
Write-Host "🎉 FoiyFoshi Application Started!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🛠️  Development Tools:" -ForegroundColor Yellow
Write-Host "   • Look for red 'DEV TOOLS' panel in top-right corner" -ForegroundColor White
Write-Host "   • Click 'Create Admin' to set up admin access" -ForegroundColor White
Write-Host "   • Admin credentials: admin@foiyfoshi.mv / admin123" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📊 Job Status:" -ForegroundColor Yellow
Write-Host "   Backend Job ID: $($backendJob.Id)" -ForegroundColor White
Write-Host "   Frontend Job ID: $($frontendJob.Id)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🛑 To stop servers, run: Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Red
Write-Host "🔍 To check status, run: Get-Job" -ForegroundColor Blue

# Keep script running to show logs
Write-Host "📝 Press Ctrl+C to stop monitoring (servers will keep running)" -ForegroundColor Magenta
try {
    while ($true) {
        Start-Sleep -Seconds 5
        $jobs = Get-Job
        $runningJobs = $jobs | Where-Object { $_.State -eq "Running" }
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Running jobs: $($runningJobs.Count)/2" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "Monitoring stopped." -ForegroundColor Yellow
}
