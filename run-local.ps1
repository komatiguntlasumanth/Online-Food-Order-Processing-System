# Automated local deployment runner for Online Food Order Processing System
# Set execution policy: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Online Food Order Processing System Deployer" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check for docker
Get-Command docker -ErrorAction SilentlyContinue > $null
if (-not $?) {
    Write-Host "Error: Docker is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Test if docker is running
& docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker Desktop is not running." -ForegroundColor Red
    Write-Host "Please start 'Docker Desktop' on your computer and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "[✔] Docker is running." -ForegroundColor Green
Write-Host "Starting build and container initialization..." -ForegroundColor Cyan
Write-Host ""

& docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " SUCCESS: All services have been successfully deployed!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Access the components using the links below:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  👉 React UI (Frontend):     http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  👉 ActiveMQ Web Console:    http://localhost:8161" -ForegroundColor Cyan
    Write-Host "  👉 Order Service API:       http://localhost:8080" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands to manage your deployment:" -ForegroundColor Gray
    Write-Host "  View logs:          docker compose logs -f" -ForegroundColor DarkYellow
    Write-Host "  Stop application:   docker compose down" -ForegroundColor DarkYellow
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Error: Failed to start the application." -ForegroundColor Red
}
