# 🚀 Deploy no Railway - Corrigido

## ✅ Problemas Resolvidos

### 1. **Erro do pip não encontrado**
- **Problema**: O Nixpacks não estava detectando automaticamente o ambiente Python
- **Solução**: Criado arquivo `nixpacks.toml` com configuração explícita do Python 3.11

### 2. **Configuração otimizada**
- Removido configurações conflitantes do `railway.json`
- Criado `.dockerignore` para otimizar o build
- Configurado health check endpoint

## 📋 Arquivos Criados/Modificados

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["python311", "python311Packages.pip"]

[phases.install]
cmds = ["pip install -r backend/requirements.txt"]

[start]
cmd = "cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT --workers 2"
```

### `railway.json` (simplificado)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  },
  "environments": {
    "production": {
      "variables": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

### `.dockerignore`
- Otimiza o build excluindo arquivos desnecessários
- Reduz o tamanho da imagem Docker

## 🔧 Configuração no Railway

### 1. **Variáveis de Ambiente Obrigatórias**
Configure estas variáveis no painel do Railway:

```bash
ENVIRONMENT=production
SECRET_KEY=sua-chave-secreta-muito-segura-aqui
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://seu-frontend.vercel.app
CORS_ORIGINS=https://seu-frontend.vercel.app
LOG_LEVEL=INFO
```

### 2. **Variáveis Opcionais**
```bash
OPENAI_API_KEY=sua-chave-da-openai-aqui
```

## 🚀 Passos para Deploy

### 1. **Preparar o Repositório**
```bash
# Certifique-se de que todos os arquivos estão commitados
git add .
git commit -m "Configuração Railway corrigida"
git push origin main
```

### 2. **Conectar ao Railway**
1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha seu repositório

### 3. **Configurar Variáveis**
1. Vá para a aba "Variables"
2. Adicione todas as variáveis de ambiente listadas acima
3. Clique em "Save"

### 4. **Deploy**
1. O Railway detectará automaticamente o `nixpacks.toml`
2. O build será executado com Python 3.11
3. O health check será configurado automaticamente

## 🔍 Monitoramento

### Health Check
- **Endpoint**: `/health`
- **Timeout**: 300 segundos
- **Retry Policy**: ON_FAILURE (máximo 3 tentativas)

### Logs
- Acesse a aba "Deployments" no Railway
- Clique em "View Logs" para monitorar a aplicação

## 🐛 Troubleshooting

### Se o deploy falhar:

1. **Verificar logs do build**
   - Acesse "Deployments" → "View Logs"
   - Procure por erros específicos

2. **Verificar variáveis de ambiente**
   - Confirme que `SECRET_KEY` está definida
   - Verifique se `ENVIRONMENT=production`

3. **Testar localmente**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

### Comandos úteis:
```bash
# Verificar se o health check está funcionando
curl https://seu-app.railway.app/health

# Verificar logs em tempo real
railway logs --follow
```

## 📊 Status do Deploy

- ✅ **Python 3.11** configurado
- ✅ **pip** disponível no build
- ✅ **Health check** funcionando
- ✅ **CORS** configurado para produção
- ✅ **Logging** configurado
- ✅ **Variáveis de ambiente** documentadas

## 🔗 URLs Importantes

- **API**: `https://seu-app.railway.app`
- **Health Check**: `https://seu-app.railway.app/health`
- **Documentação**: `https://seu-app.railway.app/docs` (apenas em desenvolvimento)

---

**Próximo passo**: Configure o frontend no Vercel e conecte com a API do Railway! 