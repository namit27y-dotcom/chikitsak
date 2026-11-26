# CHIKITSAK Local Development Setup Script (Windows PowerShell)
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RootDir "frontend"
$BackendDir = Join-Path $RootDir "backend"

Write-Host "=== CHIKITSAK Local Setup ===" -ForegroundColor Green

# 1. Verify required tools
foreach ($cmd in @("node", "npm", "python")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "Required tool '$cmd' was not found in PATH. Please install it before continuing."
        exit 1
    }
}

# 2. Setup Frontend
Write-Host "`n[1/4] Setting up Frontend dependencies..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $FrontendDir ".env"))) {
    Copy-Item (Join-Path $FrontendDir ".env.example") (Join-Path $FrontendDir ".env")
    Write-Host "Created frontend/.env from frontend/.env.example"
} else {
    Write-Host "Keeping existing frontend/.env (not overwritten)."
}

Push-Location $FrontendDir
npm install
Pop-Location

# 3. Setup Backend Virtual Environment & Dependencies
Write-Host "`n[2/4] Setting up Backend Python virtual environment..." -ForegroundColor Cyan
$VenvPath = Join-Path $BackendDir ".venv"
if (-not (Test-Path $VenvPath)) {
    python -m venv $VenvPath
}

$ActivateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
if (-not (Test-Path $ActivateScript)) {
    Write-Error "Virtual environment activation script not found at $ActivateScript"
    exit 1
}

& $ActivateScript
python -m pip install --upgrade pip
pip install -r (Join-Path $BackendDir "requirements.txt")

# 4. Backend Environment File
Write-Host "`n[3/4] Checking Backend environment file..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $BackendDir ".env"))) {
    Copy-Item (Join-Path $BackendDir ".env.example") (Join-Path $BackendDir ".env")
    Write-Host "Created backend/.env from backend/.env.example — please update DATABASE_URL, JWT_SECRET_KEY, and GEMINI_API_KEY." -ForegroundColor Yellow
} else {
    Write-Host "Keeping existing backend/.env (not overwritten)."
}

Write-Host "`n[4/4] Setup complete! Next steps:" -ForegroundColor Green
Write-Host "  1. Ensure MySQL 8 is running and database 'chikitsak' exists."
Write-Host "  2. Update credentials in backend\.env."
Write-Host "  3. Run migrations: cd backend; .\.venv\Scripts\Activate.ps1; alembic upgrade head"
Write-Host "  4. Start servers: .\scripts\start.ps1"
