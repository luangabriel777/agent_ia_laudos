# 🔧 Solução para Erro de CORS

## 📋 Problema Identificado

O frontend em `https://www.escolhatech.shop` está enfrentando erros de CORS ao tentar se conectar ao backend em `https://agentialaudos-production.up.railway.app`.

### Erros Encontrados:
- `net::ERR_BLOCKED_BY_CLIENT` - Bloqueado por extensões do navegador
- `CORS policy: Response to preflight request doesn't pass access control check`
- `No 'Access-Control-Allow-Origin' header is present`

## 🎯 Solução Principal: Configurar CORS no Backend

### Passo 1: Acessar o Repositório do Backend

```bash
# Clone o repositório do backend (se não tiver)
git clone <URL_DO_BACKEND>
cd <PASTA_DO_BACKEND>
```

### Passo 2: Configurar CORS

#### Para FastAPI (Python):
```python
# main.py ou app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Adicionar antes das rotas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.escolhatech.shop",
        "https://escolhatech.shop",
        "http://localhost:3000",  # Desenvolvimento
        "http://localhost:8000",  # Desenvolvimento
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Para Express.js (Node.js):
```javascript
// server.js ou app.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: [
    'https://www.escolhatech.shop',
    'https://escolhatech.shop',
    'http://localhost:3000',
    'http://localhost:8000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Para Django (Python):
```python
# settings.py
INSTALLED_APPS = [
    # ... outras apps
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Deve vir primeiro
    # ... outros middlewares
]

CORS_ALLOWED_ORIGINS = [
    "https://www.escolhatech.shop",
    "https://escolhatech.shop",
    "http://localhost:3000",
    "http://localhost:8000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

### Passo 3: Commit e Deploy

```bash
# Fazer commit das alterações
git add .
git commit -m "Fix: Configure CORS for frontend domain"
git push origin main

# O Railway deve fazer deploy automaticamente
```

## 🧪 Testando a Solução

### Método 1: Console do Navegador
1. Acesse `https://www.escolhatech.shop`
2. Abra o console (F12)
3. Cole e execute o script do arquivo `test-backend-connection.js`

### Método 2: Componente de Debug
- Em desenvolvimento, o componente `ConnectionDebug` aparecerá no canto inferior direito
- Clique em "🔄 Testar Novamente" para verificar a conexão

### Método 3: Teste Manual
1. Acesse `https://www.escolhatech.shop`
2. Tente fazer login com as credenciais de teste
3. Verifique se não há mais erros de CORS no console

## 🔑 Credenciais de Teste

- **Admin**: `admin` / `123456`
- **Técnico**: `tecnico` / `123456`
- **Encarregado**: `encarregado` / `123456`
- **Vendedor**: `vendedor` / `123456`

## 🚨 Soluções Alternativas

### Se não conseguir acessar o backend:

1. **Verificar se o backend está rodando**:
   - Acesse `https://agentialaudos-production.up.railway.app/health`
   - Deve retornar uma resposta JSON

2. **Verificar logs do Railway**:
   - Acesse o dashboard do Railway
   - Verifique os logs do serviço

3. **Configurar proxy reverso** (solução temporária):
   - Usar um serviço como Cloudflare Workers
   - Configurar CORS no proxy

## 📞 Suporte

Se o problema persistir:
1. Verifique os logs do backend no Railway
2. Teste a URL do backend diretamente no navegador
3. Verifique se o domínio está correto na configuração
4. Entre em contato com o administrador do sistema

## ✅ Checklist de Verificação

- [ ] CORS configurado no backend
- [ ] Domínios corretos na lista de origens permitidas
- [ ] Backend fazendo deploy no Railway
- [ ] Frontend acessível em https://www.escolhatech.shop
- [ ] Teste de conectividade passando
- [ ] Login funcionando com credenciais de teste 