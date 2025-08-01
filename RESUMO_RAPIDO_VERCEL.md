# ⚡ Resumo Rápido - Deploy Vercel

## 🎯 Passos Essenciais (5 minutos)

### 1️⃣ **Acessar Vercel**
- Vá para: [vercel.com](https://vercel.com)
- Login com GitHub

### 2️⃣ **Importar Projeto**
- "New Project" → "Import Git Repository"
- Escolher: `luangabriel777/agent_ia_laudos`
- "Import"

### 3️⃣ **Configurar Build** ⚠️ IMPORTANTE
```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

**🔑 CHAVE**: Root Directory deve ser `frontend` (não `./`)

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

1. **Build failed**: Verificar se Root Directory é `frontend`
2. **Framework not detected**: Selecionar manualmente "Create React App"
3. **CORS error**: Confirmar REACT_APP_API_URL

## 📞 Ajuda
- Logs detalhados: Aba "Deployments"
- Configurações: Aba "Settings"
- Documentação: [vercel.com/docs](https://vercel.com/docs)

**Frontend pronto para produção!** 🚀 