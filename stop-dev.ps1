# ===========================================
# ART-Laudo-Técnico-Pro - Script de Parada
# ===========================================
# Script para parar backend e frontend
# Uso: .\stop-dev.ps1

Write-Host "🛑 Parando ART-Laudo-Técnico-Pro..." -ForegroundColor Yellow
Write-Host ""

# Parar processos do backend
$backendProcesses = Get-Process | Where-Object { $_.ProcessName -eq "python" -and $_.CommandLine -like "*uvicorn*" }
if ($backendProcesses) {
    Write-Host "🔧 Parando Backend..." -ForegroundColor Cyan
    $backendProcesses | Stop-Process -Force
    Write-Host "✅ Backend parado." -ForegroundColor Green
} else {
    Write-Host "ℹ️  Backend não estava rodando." -ForegroundColor Gray
}

# Parar processos do frontend
$frontendProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*npm*" }
if ($frontendProcesses) {
    Write-Host "⚛️  Parando Frontend..." -ForegroundColor Cyan
    $frontendProcesses | Stop-Process -Force
    Write-Host "✅ Frontend parado." -ForegroundColor Green
} else {
    Write-Host "ℹ️  Frontend não estava rodando." -ForegroundColor Gray
}

# Parar jobs do PowerShell
$jobs = Get-Job
if ($jobs) {
    Write-Host "🧹 Limpando jobs do PowerShell..." -ForegroundColor Cyan
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "✅ Jobs limpos." -ForegroundColor Green
}

# Verificar se as portas estão livres
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port8000) {
    Write-Host "⚠️  Porta 8000 ainda está em uso. Forçando parada..." -ForegroundColor Yellow
    Get-Process -Id $port8000.OwningProcess | Stop-Process -Force
}

if ($port3000) {
    Write-Host "⚠️  Porta 3000 ainda está em uso. Forçando parada..." -ForegroundColor Yellow
    Get-Process -Id $port3000.OwningProcess | Stop-Process -Force
}

Write-Host ""
Write-Host "🎉 Todos os servidores foram parados!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Para iniciar novamente, use: .\start-dev.ps1" -ForegroundColor Cyan 