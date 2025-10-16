# LightWorks Windows Installer Creator
# This PowerShell script creates a Windows installer using electron-builder

param(
    [string]$Version = "1.0.0"
)

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "    LightWorks Windows Installer Creator" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Please run this from the LightWorks project directory." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building LightWorks for Windows..." -ForegroundColor Blue

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Build the application
Write-Host "Building application..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}

# Create Windows installer
Write-Host "Creating Windows installer..." -ForegroundColor Blue
npm run dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Installer creation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "    Windows Installer Created!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Installer location: dist-electron/" -ForegroundColor Green
Write-Host ""
Write-Host "To deploy to lab computers:" -ForegroundColor Yellow
Write-Host "1. Copy the .exe installer from dist-electron/" -ForegroundColor Yellow
Write-Host "2. Run the installer on the target Windows computer" -ForegroundColor Yellow
Write-Host "3. LightWorks will be installed and ready to use" -ForegroundColor Yellow
Write-Host ""


