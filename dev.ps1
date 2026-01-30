Write-Host "===================================="
Write-Host " Activating virtual environment"
Write-Host "===================================="

# Activate venv (CHANGE venv -> .venv if needed)
& .\venv\Scripts\Activate.ps1

Write-Host "Venv activated: $env:VIRTUAL_ENV"

Write-Host "===================================="
Write-Host " Starting FastAPI backend"
Write-Host "===================================="

Start-Process powershell `
  -ArgumentList "-NoExit", "-Command", "& .\venv\Scripts\Activate.ps1; python -m src.api.main_api"

Start-Sleep -Seconds 2

Write-Host "===================================="
Write-Host " Starting Stripe webhook listener"
Write-Host "===================================="

Start-Process powershell `
  -ArgumentList "-NoExit", "-Command", "& .\venv\Scripts\Activate.ps1; stripe listen --forward-to localhost:8000/api/stripe/webhook"