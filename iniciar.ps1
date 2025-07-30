Write-Host "Iniciando RSM..." -ForegroundColor Green

# Backend
Write-Host "Iniciando Backend..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "app.py" -WorkingDirectory "backend" -WindowStyle Normal

Start-Sleep -Seconds 5

# Frontend
Write-Host "Iniciando Frontend..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "frontend" -WindowStyle Normal

Start-Sleep -Seconds 10

# Abrir navegador
Start-Process "http://localhost:3000"

Write-Host "Sistema iniciado!" -ForegroundColor Green 