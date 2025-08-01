# Usar imagem oficial do Python 3.11
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primeiro para aproveitar cache do Docker
COPY backend/requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY backend/ ./backend/

# Copiar script de inicialização
COPY start.sh ./start.sh

# Tornar script executável
RUN chmod +x ./start.sh

# Expor porta
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["./start.sh"] 