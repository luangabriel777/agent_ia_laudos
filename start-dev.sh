#!/bin/bash

# ===========================================
# ART-Laudo-Técnico-Pro - Script de Desenvolvimento
# ===========================================
# Script para iniciar backend e frontend simultaneamente
# Uso: ./start-dev.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando ART-Laudo-Técnico-Pro...${NC}"
echo ""

# Verificar se Python está instalado
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo -e "${GREEN}✅ Python encontrado: $PYTHON_VERSION${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    echo -e "${GREEN}✅ Python encontrado: $PYTHON_VERSION${NC}"
    PYTHON_CMD="python"
else
    echo -e "${RED}❌ Python não encontrado. Instale Python 3.8+ primeiro.${NC}"
    exit 1
fi

# Verificar se Node.js está instalado
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version 2>&1)
    echo -e "${GREEN}✅ Node.js encontrado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js primeiro.${NC}"
    exit 1
fi

# Verificar se npm está instalado
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version 2>&1)
    echo -e "${GREEN}✅ npm encontrado: v$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado. Instale npm primeiro.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📦 Verificando dependências...${NC}"

# Verificar se as dependências do backend estão instaladas
if [ ! -d "backend/__pycache__" ]; then
    echo -e "${YELLOW}📥 Instalando dependências do backend...${NC}"
    cd backend
    pip install -r requirements.txt
    cd ..
fi

# Verificar se as dependências do frontend estão instaladas
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências do frontend...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo ""
echo -e "${YELLOW}🔧 Verificando configurações...${NC}"

# Verificar se o arquivo .env existe no backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Criando arquivo .env no backend...${NC}"
    cd backend
    echo "SECRET_KEY=your-secret-key-here-change-in-production" > .env
    echo "OPENAI_API_KEY=your-openai-api-key-here" >> .env
    cd ..
fi

echo ""
echo -e "${GREEN}🌐 Iniciando servidores...${NC}"
echo ""

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Verificar se as portas estão livres
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Porta 8000 já está em uso. Parando processo...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Porta 3000 já está em uso. Parando processo...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Parando servidores...${NC}"
    pkill -f "uvicorn app:app" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    echo -e "${GREEN}✅ Servidores parados.${NC}"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar backend em background
echo -e "${CYAN}🔧 Iniciando Backend (FastAPI) na porta 8000...${NC}"
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar um pouco para o backend inicializar
sleep 3

# Iniciar frontend em background
echo -e "${CYAN}⚛️  Iniciando Frontend (React) na porta 3000...${NC}"
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${YELLOW}⏳ Aguardando servidores inicializarem...${NC}"

# Aguardar e verificar se os servidores estão rodando
max_attempts=30
attempts=0

while [ $attempts -lt $max_attempts ]; do
    if check_port 8000 && check_port 3000; then
        break
    fi
    
    sleep 2
    attempts=$((attempts + 1))
    echo -e "${GRAY}   Aguardando... ($attempts/$max_attempts)${NC}"
done

echo ""
echo -e "${GREEN}🎉 Aplicação iniciada com sucesso!${NC}"
echo ""
echo -e "${WHITE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${WHITE}🔧 Backend:  http://localhost:8000${NC}"
echo -e "${WHITE}📚 API Docs: http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}🔑 Credenciais de teste:${NC}"
echo -e "${WHITE}   Usuário: admin${NC}"
echo -e "${WHITE}   Senha: 123456${NC}"
echo ""
echo -e "${CYAN}💡 Dicas:${NC}"
echo -e "${GRAY}   - Pressione Ctrl+C para parar os servidores${NC}"
echo -e "${GRAY}   - Logs do backend: tail -f backend.log${NC}"
echo -e "${GRAY}   - Logs do frontend: tail -f frontend.log${NC}"
echo ""

# Mostrar logs em tempo real
echo -e "${YELLOW}📋 Logs dos servidores:${NC}"
echo ""

# Função para mostrar logs
show_logs() {
    while true; do
        if [ -f "backend.log" ]; then
            tail -n 1 backend.log 2>/dev/null | while read line; do
                if [ ! -z "$line" ]; then
                    echo -e "${BLUE}[BACKEND] $line${NC}"
                fi
            done
        fi
        
        if [ -f "frontend.log" ]; then
            tail -n 1 frontend.log 2>/dev/null | while read line; do
                if [ ! -z "$line" ]; then
                    echo -e "${MAGENTA}[FRONTEND] $line${NC}"
                fi
            done
        fi
        
        sleep 1
    done
}

# Iniciar monitoramento de logs em background
show_logs &
LOGS_PID=$!

# Aguardar indefinidamente
wait 