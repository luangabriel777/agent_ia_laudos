#!/bin/bash

# ===========================================
# ART-Laudo-Técnico-Pro - Script de Parada
# ===========================================
# Script para parar backend e frontend
# Uso: ./stop-dev.sh

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

echo -e "${YELLOW}🛑 Parando ART-Laudo-Técnico-Pro...${NC}"
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

# Parar processos do backend
if pgrep -f "uvicorn app:app" > /dev/null; then
    echo -e "${CYAN}🔧 Parando Backend...${NC}"
    pkill -f "uvicorn app:app"
    sleep 2
    echo -e "${GREEN}✅ Backend parado.${NC}"
else
    echo -e "${GRAY}ℹ️  Backend não estava rodando.${NC}"
fi

# Parar processos do frontend
if pgrep -f "npm start" > /dev/null; then
    echo -e "${CYAN}⚛️  Parando Frontend...${NC}"
    pkill -f "npm start"
    sleep 2
    echo -e "${GREEN}✅ Frontend parado.${NC}"
else
    echo -e "${GRAY}ℹ️  Frontend não estava rodando.${NC}"
fi

# Parar processos Node.js relacionados
if pgrep -f "react-scripts" > /dev/null; then
    echo -e "${CYAN}🧹 Limpando processos React...${NC}"
    pkill -f "react-scripts"
    echo -e "${GREEN}✅ Processos React limpos.${NC}"
fi

# Verificar se as portas estão livres
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Porta 8000 ainda está em uso. Forçando parada...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠️  Porta 3000 ainda está em uso. Forçando parada...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Limpar arquivos de log
if [ -f "backend.log" ]; then
    echo -e "${CYAN}🧹 Removendo log do backend...${NC}"
    rm backend.log
fi

if [ -f "frontend.log" ]; then
    echo -e "${CYAN}🧹 Removendo log do frontend...${NC}"
    rm frontend.log
fi

echo ""
echo -e "${GREEN}🎉 Todos os servidores foram parados!${NC}"
echo ""
echo -e "${CYAN}💡 Para iniciar novamente, use: ./start-dev.sh${NC}" 