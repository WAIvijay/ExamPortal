# Run from project root:  .\scripts\start-backend.ps1
# Uses system Python (no venv).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root "backend\exam_portal")

Write-Host "Installing dependencies..."
pip install -r requirements.txt -q
Write-Host "Running migrations..."
python manage.py migrate
Write-Host "Starting Django at http://127.0.0.1:8000 ..."
python manage.py runserver
