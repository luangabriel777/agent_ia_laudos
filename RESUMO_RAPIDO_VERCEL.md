# ⚡ Resumo Rápido - Deploy Vercel

## 🎯 Passos Essenciais (5 minutos)

### 1️⃣ **Acessar Vercel**
- Vá para: [vercel.com](https://vercel.com)
- Login com GitHub

### 2️⃣ **Importar Projeto**
- "New Project" → "Import Git Repository"
- Escolher: `luangabriel777/agent_ia_laudos`
- "Import"

### 3️⃣ **Configurar Build**
```
Framework Preset: Create React App
Root Directory: ./
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/build
Install Command: cd frontend && npm install
```

### 4️⃣ **Configurar Variável da API**
- Settings → Environment Variables
- Adicionar:
```
Name: REACT_APP_API_URL
Value: https://seu-backend.railway.app
Environment: Production, Preview, Development
```

### 5️⃣ **Deploy**
- Clique em "Deploy"
- Aguardar build completar
- Copiar URL da aplicação

## ✅ Pronto!

**URL do Frontend**: `https://seu-app.vercel.app`

---

## 🔧 Se der erro:

1. **Build failed**: Verificar logs do Vercel
2. **CORS error**: Confirmar REACT_APP_API_URL
3. **API not found**: Verificar se backend está rodando

## 📞 Ajuda
- Logs detalhados: Aba "Deployments"
- Configurações: Aba "Settings"
- Documentação: [vercel.com/docs](https://vercel.com/docs)

**Frontend pronto para produção!** 🚀 