#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de inicialização do Sistema RSM
.DESCRIPTION
    Inicializa o backend e frontend do Sistema RSM de forma automatizada
.PARAMETER Environment
    Ambiente de execução (dev, prod, test)
.PARAMETER BackendOnly
    Inicializa apenas o backend
.PARAMETER FrontendOnly
    Inicializa apenas o frontend
.EXAMPLE
    .\start.ps1
    Inicializa o sistema completo em modo desenvolvimento
.EXAMPLE
    .\start.ps1 -Environment prod
    Inicializa o sistema em modo produção
#>

param(
    [Parameter()]
    [ValidateSet("dev", "prod", "test")]
    [string]$Environment = "dev",
    
    [Parameter()]
    [switch]$BackendOnly,
    
    [Parameter()]
    [switch]$FrontendOnly
)

# Configurações
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"
$LogPath = Join-Path $ProjectRoot "logs"

# Cores para output
$Colors = @{
    Info = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Header = "Magenta"
}

# Função para log colorido
function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Colors[$Color]
}

# Função para verificar se um processo está rodando
function Test-ProcessRunning {
    param([string]$ProcessName)
    return Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
}

# Função para verificar se uma porta está em uso
function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Função para matar processo na porta
function Stop-ProcessOnPort {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-ColorLog "Processo na porta $Port finalizado" "Warning"
    }
}

# Função para inicializar backend
function Start-Backend {
    Write-ColorLog "🚀 Inicializando Backend..." "Header"
    
    # Verificar se Python está instalado
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-ColorLog "❌ Python não encontrado. Instale Python 3.8+ e tente novamente." "Error"
        exit 1
    }
    
    # Verificar se o diretório backend existe
    if (-not (Test-Path $BackendPath)) {
        Write-ColorLog "❌ Diretório backend não encontrado em: $BackendPath" "Error"
        exit 1
    }
    
    # Mudar para o diretório backend
    Set-Location $BackendPath
    
    # Verificar se o ambiente virtual existe
    $venvPath = Join-Path $BackendPath "venv"
    if (-not (Test-Path $venvPath)) {
        Write-ColorLog "📦 Criando ambiente virtual Python..." "Info"
        python -m venv venv
    }
    
    # Ativar ambiente virtual
    Write-ColorLog "🔧 Ativando ambiente virtual..." "Info"
    & "$venvPath\Scripts\Activate.ps1"
    
    # Instalar dependências se necessário
    if (-not (Test-Path "requirements.txt")) {
        Write-ColorLog "❌ requirements.txt não encontrado" "Error"
        exit 1
    }
    
    Write-ColorLog "📦 Verificando dependências..." "Info"
    pip install -r requirements.txt --quiet
    
    # Verificar se o banco existe
    if (-not (Test-Path "laudos.db")) {
        Write-ColorLog "🗄️ Inicializando banco de dados..." "Info"
        python update_db_schema.py
    }
    
    # Verificar se a porta 8000 está livre
    if (Test-PortInUse 8000) {
        Write-ColorLog "⚠️ Porta 8000 em uso. Finalizando processo..." "Warning"
        Stop-ProcessOnPort 8000
        Start-Sleep -Seconds 2
    }
    
    # Inicializar aplicação
    Write-ColorLog "✅ Backend iniciado em http://localhost:8000" "Success"
    Write-ColorLog "📚 Documentação API: http://localhost:8000/docs" "Info"
    
    # Executar em background
    Start-Process python -ArgumentList "app.py" -WindowStyle Hidden
}

# Função para inicializar frontend
function Start-Frontend {
    Write-ColorLog "🎨 Inicializando Frontend..." "Header"
    
    # Verificar se Node.js está instalado
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-ColorLog "❌ Node.js não encontrado. Instale Node.js 16+ e tente novamente." "Error"
        exit 1
    }
    
    # Verificar se o diretório frontend existe
    if (-not (Test-Path $FrontendPath)) {
        Write-ColorLog "❌ Diretório frontend não encontrado em: $FrontendPath" "Error"
        exit 1
    }
    
    # Mudar para o diretório frontend
    Set-Location $FrontendPath
    
    # Verificar se node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-ColorLog "📦 Instalando dependências Node.js..." "Info"
        npm install --silent
    }
    
    # Verificar se a porta 3000 está livre
    if (Test-PortInUse 3000) {
        Write-ColorLog "⚠️ Porta 3000 em uso. Finalizando processo..." "Warning"
        Stop-ProcessOnPort 3000
        Start-Sleep -Seconds 2
    }
    
    # Inicializar aplicação
    Write-ColorLog "✅ Frontend iniciado em http://localhost:3000" "Success"
    
    # Executar em background
    Start-Process npm -ArgumentList "start" -WindowStyle Hidden
}

# Função para verificar status
function Test-SystemStatus {
    Write-ColorLog "🔍 Verificando status do sistema..." "Header"
    
    $backendRunning = Test-PortInUse 8000
    $frontendRunning = Test-PortInUse 3000
    
    if ($backendRunning) {
        Write-ColorLog "✅ Backend: Rodando (http://localhost:8000)" "Success"
    } else {
        Write-ColorLog "❌ Backend: Parado" "Error"
    }
    
    if ($frontendRunning) {
        Write-ColorLog "✅ Frontend: Rodando (http://localhost:3000)" "Success"
    } else {
        Write-ColorLog "❌ Frontend: Parado" "Error"
    }
    
    if ($backendRunning -and $frontendRunning) {
        Write-ColorLog "🎉 Sistema RSM totalmente operacional!" "Success"
        Write-ColorLog "🌐 Acesse: http://localhost:3000" "Info"
    }
}

# Função principal
function Start-RSMSystem {
    Write-ColorLog "=" * 60 "Header"
    Write-ColorLog "🚀 SISTEMA RSM - INICIALIZADOR" "Header"
    Write-ColorLog "=" * 60 "Header"
    Write-ColorLog "Ambiente: $Environment" "Info"
    Write-ColorLog "Diretório: $ProjectRoot" "Info"
    
    # Criar diretório de logs se não existir
    if (-not (Test-Path $LogPath)) {
        New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
    }
    
    # Inicializar componentes baseado nos parâmetros
    if ($BackendOnly) {
        Start-Backend
    } elseif ($FrontendOnly) {
        Start-Frontend
    } else {
        # Inicializar ambos
        Start-Backend
        Start-Sleep -Seconds 3
        Start-Frontend
        Start-Sleep -Seconds 5
        Test-SystemStatus
    }
    
    Write-ColorLog "=" * 60 "Header"
    Write-ColorLog "✅ Inicialização concluída!" "Success"
    Write-ColorLog "=" * 60 "Header"
}

# Executar função principal
Start-RSMSystem 