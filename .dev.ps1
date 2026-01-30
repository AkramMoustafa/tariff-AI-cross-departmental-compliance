Write-Host "Starting FastAPI..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m src.api.main_api"

Write-Host "Starting Stripe webhook listener..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "stripe listen --forward-to localhost:8000/api/stripe/webhook"