# Run from project root:  .\scripts\start-frontend.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $root "frontend")

if (-not (Test-Path "node_modules")) {
    Write-Host "Running npm install..."
    npm install
}
Write-Host "Starting React at http://localhost:3000 ..."
npm start
