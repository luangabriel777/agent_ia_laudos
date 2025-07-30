Write-Host "Iniciando Sistema RSM..." -ForegroundColor Green

# Parar processos existentes
Write-Host "Parando processos existentes..." -ForegroundColor Yellow
taskkill /f /im python.exe 2>$null
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 3

# Iniciar Backend
Write-Host "Iniciando Backend..." -ForegroundColor Cyan
cd backend
Start-Process -FilePath "python" -ArgumentList "app.py" -WindowStyle Normal
cd ..

# Aguardar 5 segundos
Write-Host "Aguardando backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar Frontend
Write-Host "Iniciando Frontend..." -ForegroundColor Cyan
cd frontend
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal
cd ..

# Aguardar 10 segundos
Write-Host "Aguardando frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Abrir navegador
Write-Host "Abrindo navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "Sistema RSM iniciado com sucesso!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Login: admin / 123456" -ForegroundColor Yellow 