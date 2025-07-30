# Script para iniciar o sistema RSM - Rede de Serviços Moura
# Autor: Sistema RSM
# Data: 2025-07-28

Write-Host "🚀 INICIANDO SISTEMA RSM - REDE DE SERVIÇOS MOURA" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verificar se estamos no diretório correto
if (-not (Test-Path "backend\app.py")) {
    Write-Host "❌ ERRO: Execute este script no diretório raiz do projeto RSM" -ForegroundColor Red
    Write-Host "   Diretório atual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Função para iniciar o backend
function Start-Backend {
    Write-Host "🔧 Iniciando BACKEND..." -ForegroundColor Cyan
    Set-Location "backend"
    
    # Verificar se Python está instalado
    try {
        python --version | Out-Null
    } catch {
        Write-Host "❌ ERRO: Python não encontrado. Instale Python 3.8+ primeiro." -ForegroundColor Red
        exit 1
    }
    
    # Verificar se as dependências estão instaladas
    if (-not (Test-Path "requirements.txt")) {
        Write-Host "❌ ERRO: requirements.txt não encontrado" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Backend iniciado na porta 8000" -ForegroundColor Green
    Write-Host "   URL: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "   Docs: http://localhost:8000/docs" -ForegroundColor Yellow
    
    # Iniciar o backend em background
    Start-Process -FilePath "python" -ArgumentList "app.py" -WindowStyle Hidden
}

# Função para iniciar o frontend
function Start-Frontend {
    Write-Host "🎨 Iniciando FRONTEND..." -ForegroundColor Cyan
    Set-Location "frontend"
    
    # Verificar se Node.js está instalado
    try {
        node --version | Out-Null
    } catch {
        Write-Host "❌ ERRO: Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
        exit 1
    }
    
    # Verificar se npm está instalado
    try {
        npm --version | Out-Null
    } catch {
        Write-Host "❌ ERRO: npm não encontrado. Instale npm primeiro." -ForegroundColor Red
        exit 1
    }
    
    # Verificar se package.json existe
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ ERRO: package.json não encontrado" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Frontend iniciado na porta 3000" -ForegroundColor Green
    Write-Host "   URL: http://localhost:3000" -ForegroundColor Yellow
    
    # Iniciar o frontend em background
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
}

# Função para verificar status
function Show-Status {
    Write-Host ""
    Write-Host "📊 STATUS DO SISTEMA:" -ForegroundColor Magenta
    Write-Host "=====================" -ForegroundColor Magenta
    
    # Verificar se o backend está rodando
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend: RODANDO (porta 8000)" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend: PARADO" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Backend: PARADO" -ForegroundColor Red
    }
    
    # Verificar se o frontend está rodando
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend: RODANDO (porta 3000)" -ForegroundColor Green
        } else {
            Write-Host "❌ Frontend: PARADO" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Frontend: PARADO" -ForegroundColor Red
    }
}

# Função para abrir o navegador
function Open-Browser {
    Write-Host ""
    Write-Host "🌐 Abrindo navegador..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
}

# Função principal
function Main {
    Write-Host "Escolha uma opção:" -ForegroundColor Yellow
    Write-Host "1. Iniciar Backend" -ForegroundColor White
    Write-Host "2. Iniciar Frontend" -ForegroundColor White
    Write-Host "3. Iniciar Ambos (Backend + Frontend)" -ForegroundColor White
    Write-Host "4. Verificar Status" -ForegroundColor White
    Write-Host "5. Abrir no Navegador" -ForegroundColor White
    Write-Host "6. Sair" -ForegroundColor White
    
    $choice = Read-Host "Digite sua escolha (1-6)"
    
    switch ($choice) {
        "1" { 
            Start-Backend
            Set-Location ".."
        }
        "2" { 
            Start-Frontend
            Set-Location ".."
        }
        "3" { 
            Start-Backend
            Set-Location ".."
            Start-Sleep -Seconds 3
            Start-Frontend
            Set-Location ".."
            Start-Sleep -Seconds 5
            Open-Browser
        }
        "4" { Show-Status }
        "5" { Open-Browser }
        "6" { 
            Write-Host "👋 Saindo..." -ForegroundColor Green
            exit 0
        }
        default { 
            Write-Host "❌ Opção inválida!" -ForegroundColor Red
        }
    }
}

# Executar função principal
Main 