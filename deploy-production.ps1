# Deploy para Producao - RSM Laudos
Write-Host "=== DEPLOY PARA PRODUCAO - RSM LAUDOS ===" -ForegroundColor Green

# Verificar Git
Write-Host "Verificando Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando Git..." -ForegroundColor Yellow
    git init
}

# Primeiro commit
Write-Host "Fazendo primeiro commit..." -ForegroundColor Yellow
git add .
git commit -m "Initial commit - RSM Laudos Pro ready for production"

Write-Host ""
Write-Host "=== PROXIMOS PASSOS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Crie um repositorio no GitHub" -ForegroundColor White
Write-Host "2. Execute:" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/seu-usuario/seu-repo.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure Railway e Vercel seguindo DEPLOY_PRODUCTION.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== ARQUIVOS PRONTOS ===" -ForegroundColor Green
Write-Host "✅ railway.json - Configurado para Railway" -ForegroundColor Green
Write-Host "✅ vercel.json - Configurado para Vercel" -ForegroundColor Green
Write-Host "✅ requirements.txt - Dependencias Python" -ForegroundColor Green
Write-Host "✅ package.json - Dependencias Node.js" -ForegroundColor Green
Write-Host "✅ DEPLOY_PRODUCTION.md - Guia completo" -ForegroundColor Green 