# 🚀 Guia de Instalação - Sistema RSM

## 📋 Pré-requisitos

### Sistema Operacional
- **Windows**: 10/11 (64-bit)
- **macOS**: 10.15+ (Catalina)
- **Linux**: Ubuntu 20.04+, CentOS 8+

### Software Necessário
- **Python**: 3.8 ou superior
- **Node.js**: 16.0 ou superior
- **Git**: 2.30 ou superior
- **SQLite**: Incluído com Python

### Verificação de Versões
```bash
# Python
python --version
# Deve retornar: Python 3.8.x ou superior

# Node.js
node --version
# Deve retornar: v16.x.x ou superior

# Git
git --version
# Deve retornar: git version 2.30.x ou superior
```

## 🔧 Instalação Passo a Passo

### 1. Clone do Repositório
```bash
# Clone o repositório
git clone https://github.com/moura/rsm-system.git
cd rsm-system

# Verifique a estrutura
ls -la
```

### 2. Configuração do Backend

```bash
# Entre no diretório backend
cd backend

# Crie ambiente virtual Python
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configuração do Frontend

```bash
# Entre no diretório frontend
cd ../frontend

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

### 4. Inicialização do Banco de Dados

```bash
# Volte para o backend
cd ../backend

# Execute migrações
python update_db_schema.py

# Verifique a conexão
python check_db.py
```

### 5. Inicialização dos Serviços

#### Terminal 1 - Backend
```bash
cd backend
# Ative o ambiente virtual se necessário
python app.py
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## 🌐 Acesso ao Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 🔐 Credenciais Padrão

### Administrador
- **Usuário**: admin
- **Senha**: admin123

### Técnico
- **Usuário**: tecnico
- **Senha**: tecnico123

## 🐛 Solução de Problemas

### Erro: Porta já em uso
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Erro: Módulos Python não encontrados
```bash
# Verifique se o ambiente virtual está ativo
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Reinstale dependências
pip install -r requirements.txt --force-reinstall
```

### Erro: Node modules não encontrados
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro: Banco de dados
```bash
# Recrie o banco
rm laudos.db
python update_db_schema.py
```

## 📦 Instalação com Docker

### Pré-requisitos Docker
- Docker Desktop 4.0+
- Docker Compose 2.0+

### Comando de Instalação
```bash
# Clone e configure
git clone https://github.com/moura/rsm-system.git
cd rsm-system

# Execute com Docker
docker-compose up -d

# Acesse
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 🔄 Atualizações

### Atualização Manual
```bash
# Atualize o código
git pull origin main

# Backend
cd backend
pip install -r requirements.txt --upgrade

# Frontend
cd ../frontend
npm install
npm run build
```

### Atualização com Docker
```bash
docker-compose pull
docker-compose up -d
```

## 📞 Suporte

### Logs do Sistema
```bash
# Backend logs
cd backend
tail -f app.log

# Frontend logs
cd frontend
npm run build 2>&1 | tee build.log
```

### Contato
- **Email**: suporte@moura.com.br
- **Telefone**: (81) 2101-5000
- **WhatsApp**: (81) 99999-9999

---

*Documento atualizado em: ${new Date().toLocaleDateString('pt-BR')}* 