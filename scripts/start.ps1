# CHIKITSAK Local Development Start Script (Windows PowerShell)
$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RootDir "frontend"
$BackendDir = Join-Path $RootDir "backend"
$BackendPython = Join-Path $BackendDir ".venv\Scripts\python.exe"

if (-not (Test-Path $BackendPython)) {
    Write-Error "Backend virtual environment not found at $BackendPython. Run .\scripts\setup.ps1 first."
    exit 1
}

if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not in PATH."
    exit 1
}

Write-Host "Starting CHIKITSAK FastAPI Backend (port 8000)..." -ForegroundColor Green
$BackendJob = Start-Process -FilePath $BackendPython `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" `
    -WorkingDirectory $BackendDir `
    -PassThru

Write-Host "Starting CHIKITSAK Vite Frontend (port 3000)..." -ForegroundColor Green
try {
    Push-Location $FrontendDir
    npm run dev
} finally {
    Pop-Location
    if ($BackendJob -and -not $BackendJob.HasExited) {
        Write-Host "Stopping FastAPI Backend..." -ForegroundColor Yellow
        Stop-Process -Id $BackendJob.Id -Force
    }
}
