# 🚀 Passo a Passo Completo - Deploy Railway

## 📋 Pré-requisitos
- ✅ Repositório no GitHub (já configurado)
- ✅ Conta no Railway (gratuita)
- ✅ Código commitado e enviado (já feito)

---

## 🎯 PASSO 1: Acessar o Railway

### 1.1 Acesse o Railway
- Vá para: [https://railway.app](https://railway.app)
- Clique em **"Login"** ou **"Sign Up"**

### 1.2 Fazer Login
- Use sua conta GitHub
- Autorize o Railway a acessar seus repositórios

---

## 🎯 PASSO 2: Criar Novo Projeto

### 2.1 Iniciar Projeto
- Clique em **"New Project"**
- Selecione **"Deploy from GitHub repo"**

### 2.2 Escolher Repositório
- Procure por: `luangabriel777/agent_ia_laudos`
- Clique no repositório
- Clique em **"Deploy Now"**

---

## 🎯 PASSO 3: Configurar Variáveis de Ambiente

### 3.1 Acessar Configurações
- No projeto criado, clique na aba **"Variables"**
- Clique em **"New Variable"**

### 3.2 Adicionar Variáveis Obrigatórias

#### **ENVIRONMENT**
```
Name: ENVIRONMENT
Value: production
```

#### **SECRET_KEY**
```
Name: SECRET_KEY
Value: sua-chave-secreta-muito-segura-aqui-123456789
```

#### **ACCESS_TOKEN_EXPIRE_MINUTES**
```
Name: ACCESS_TOKEN_EXPIRE_MINUTES
Value: 30
```

#### **FRONTEND_URL**
```
Name: FRONTEND_URL
Value: https://seu-frontend.vercel.app
```

#### **CORS_ORIGINS**
```
Name: CORS_ORIGINS
Value: https://seu-frontend.vercel.app
```

#### **LOG_LEVEL**
```
Name: LOG_LEVEL
Value: INFO
```

### 3.3 Adicionar Variável Opcional (se tiver OpenAI)

#### **OPENAI_API_KEY**
```
Name: OPENAI_API_KEY
Value: sk-sua-chave-da-openai-aqui
```

### 3.4 Salvar Configurações
- Clique em **"Save"** para cada variável
- Aguarde a aplicação reiniciar automaticamente

---

## 🎯 PASSO 4: Monitorar o Deploy

### 4.1 Verificar Build
- Vá para a aba **"Deployments"**
- Clique no deployment mais recente
- Clique em **"View Logs"**

### 4.2 Logs Esperados
```
✅ Building Docker image
✅ Installing Python dependencies
✅ Starting application
✅ Health check passed
```

### 4.3 Se houver erro
- Verifique os logs para identificar o problema
- Confirme se todas as variáveis estão configuradas
- Aguarde alguns minutos e tente novamente

---

## 🎯 PASSO 5: Verificar se Está Funcionando

### 5.1 Acessar a Aplicação
- No Railway, clique na aba **"Settings"**
- Copie a URL gerada (ex: `https://seu-app.railway.app`)

### 5.2 Testar Health Check
- Acesse: `https://seu-app.railway.app/health`
- Deve retornar:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "database": "connected",
  "openai": "configured",
  "version": "2.0.0"
}
```

### 5.3 Testar API
- Acesse: `https://seu-app.railway.app/docs`
- Deve mostrar a documentação da API (em desenvolvimento)

---

## 🎯 PASSO 6: Configurar Domínio (Opcional)

### 6.1 Domínio Personalizado
- Na aba **"Settings"**
- Clique em **"Custom Domains"**
- Adicione seu domínio (ex: `api.seudominio.com`)

### 6.2 Atualizar Variáveis
- Atualize `FRONTEND_URL` e `CORS_ORIGINS` com o novo domínio

---

## 🎯 PASSO 7: Conectar com Frontend

### 7.1 Atualizar Frontend
- No frontend, atualize a URL da API
- Use a URL do Railway: `https://seu-app.railway.app`

### 7.2 Testar Login
- Acesse o frontend
- Tente fazer login com:
  - **Usuário**: `admin`
  - **Senha**: `123456`

---

## 🔧 Troubleshooting

### ❌ Erro: "Build failed"
**Solução**: 
- Verifique se o `Dockerfile` está na raiz
- Confirme se `backend/requirements.txt` existe
- Verifique os logs do build

### ❌ Erro: "Health check failed"
**Solução**:
- Aguarde alguns minutos
- Verifique se a aplicação está rodando
- Confirme se as variáveis estão configuradas

### ❌ Erro: "Database connection failed"
**Solução**:
- O SQLite será criado automaticamente
- Verifique se o diretório tem permissões de escrita

### ❌ Erro: "CORS error"
**Solução**:
- Confirme se `FRONTEND_URL` está correto
- Verifique se `CORS_ORIGINS` inclui o frontend

---

## 📊 Status de Verificação

| Item | Status | Como Verificar |
|------|--------|----------------|
| ✅ Build | Funcionando | Logs do Railway |
| ✅ Health Check | Respondendo | `/health` endpoint |
| ✅ API | Ativa | `/docs` endpoint |
| ✅ Database | Conectado | Health check response |
| ✅ Variáveis | Configuradas | Aba Variables |
| ✅ CORS | Funcionando | Frontend conecta |

---

## 🎉 Sucesso!

### URLs Importantes
- **API**: `https://seu-app.railway.app`
- **Health Check**: `https://seu-app.railway.app/health`
- **Documentação**: `https://seu-app.railway.app/docs`

### Próximos Passos
1. ✅ Backend no Railway (concluído)
2. 🔄 Frontend no Vercel
3. 🔄 Configurar domínio personalizado
4. 🔄 Configurar monitoramento

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Railway
2. Confirme as variáveis de ambiente
3. Teste localmente primeiro
4. Consulte a documentação do Railway

**A aplicação está pronta para produção!** 🚀 