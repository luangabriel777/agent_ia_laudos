# ART-Laudo-Técnico-Pro - Script de Desenvolvimento
Write-Host "Iniciando ART-Laudo-Tecnico-Pro..." -ForegroundColor Green

# Verificar dependências
Write-Host "Verificando dependencias..." -ForegroundColor Yellow

# Instalar dependências do backend se necessário
Write-Host "Instalando dependencias do backend..." -ForegroundColor Yellow
Set-Location backend
pip install -r requirements.txt
Set-Location ..

# Instalar dependências do frontend se necessário
Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Criar arquivo .env se não existir
Write-Host "Criando arquivo .env..." -ForegroundColor Yellow
Set-Location backend
"SECRET_KEY=your-secret-key-here-change-in-production" | Out-File -FilePath ".env" -Encoding ASCII
Set-Location ..

Write-Host "Iniciando servidores..." -ForegroundColor Green

# Iniciar backend
Write-Host "Iniciando Backend (porta 8000)..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
}

# Aguardar um pouco
Start-Sleep -Seconds 3

# Iniciar frontend
Write-Host "Iniciando Frontend (porta 3000)..." -ForegroundColor Cyan
Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm start
}

Write-Host ""
Write-Host "Aplicacao iniciada!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "Login: admin / 123456" -ForegroundColor Yellow
Write-Host ""
Write-Host "Use 'Get-Job | Stop-Job' para parar os servidores" -ForegroundColor Cyan 