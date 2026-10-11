# PC Builder Assistant - Complete Setup and Run Script
# This script starts both the Python backend and Next.js frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PC Builder Assistant - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js 16 or higher." -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt -q
    Write-Host "✓ Python dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ No requirements.txt found, skipping" -ForegroundColor Yellow
}

# Install Node.js dependencies
Write-Host ""
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    if (!(Test-Path "node_modules")) {
        npm install
    }
    Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found!" -ForegroundColor Red
    exit 1
}

# Start services
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Python Flask backend in background
Write-Host "Starting Python Flask backend on http://localhost:5000..." -ForegroundColor Yellow
Start-Process python -ArgumentList "api.py" -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Host "✓ Python backend started" -ForegroundColor Green

# Start Next.js frontend
Write-Host ""
Write-Host "Starting Next.js frontend on http://localhost:3000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

npm run dev
