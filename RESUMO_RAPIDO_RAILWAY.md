# ⚡ Resumo Rápido - Deploy Railway

## 🎯 Passos Essenciais (5 minutos)

### 1️⃣ **Acessar Railway**
- Vá para: [railway.app](https://railway.app)
- Login com GitHub

### 2️⃣ **Criar Projeto**
- "New Project" → "Deploy from GitHub repo"
- Escolher: `luangabriel777/agent_ia_laudos`
- "Deploy Now"

### 3️⃣ **Configurar Variáveis** (Obrigatórias)
```
ENVIRONMENT=production
SECRET_KEY=sua-chave-secreta-muito-segura-aqui-123456789
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://seu-frontend.vercel.app
CORS_ORIGINS=https://seu-frontend.vercel.app
LOG_LEVEL=INFO
```

### 4️⃣ **Verificar Deploy**
- Aba "Deployments" → "View Logs"
- Aguardar build completar
- Copiar URL da aplicação

### 5️⃣ **Testar**
- Acessar: `sua-url.railway.app/health`
- Deve retornar status "healthy"

## ✅ Pronto!

**URL da API**: `https://sua-app.railway.app`

---

## 🔧 Se der erro:

1. **Build failed**: Verificar logs
2. **Health check failed**: Aguardar + verificar variáveis
3. **CORS error**: Confirmar FRONTEND_URL

## 📞 Ajuda
- Logs detalhados: Aba "Deployments"
- Configurações: Aba "Variables"
- Documentação: [railway.app/docs](https://railway.app/docs)

**Aplicação pronta para produção!** 🚀 