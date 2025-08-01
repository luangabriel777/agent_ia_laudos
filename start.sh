#!/bin/bash

# Script de inicialização para Railway
# Define porta padrão se não for fornecida
export PORT=${PORT:-8000}

echo "🚀 Iniciando aplicação na porta $PORT"

# Navegar para o diretório backend
cd backend

# Iniciar a aplicação
exec python -m uvicorn app:app --host 0.0.0.0 --port $PORT --workers 2 