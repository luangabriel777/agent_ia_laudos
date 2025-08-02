# Configuração de CORS para o Backend

## Problema
O frontend em `https://www.escolhatech.shop` não consegue se conectar ao backend devido a restrições de CORS.

## Solução: Configurar CORS no Backend

### Para FastAPI (Python)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.escolhatech.shop",
        "https://escolhatech.shop",
        "http://localhost:3000",  # Para desenvolvimento
        "http://localhost:8000",  # Para desenvolvimento
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Para Express.js (Node.js)
```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Configurar CORS
app.use(cors({
  origin: [
    'https://www.escolhatech.shop',
    'https://escolhatech.shop',
    'http://localhost:3000', // Para desenvolvimento
    'http://localhost:8000', // Para desenvolvimento
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Para Django (Python)
```python
# settings.py
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

## Passos para Implementar

1. **Acesse o repositório do backend**
2. **Localize o arquivo principal da aplicação** (main.py, app.py, server.js, etc.)
3. **Adicione a configuração de CORS** conforme o exemplo acima
4. **Faça commit e push das alterações**
5. **Reimplante no Railway**

## Verificação

Após a configuração, teste a conexão:
1. Acesse `https://www.escolhatech.shop`
2. Abra o console do navegador (F12)
3. Verifique se os erros de CORS desapareceram
4. Teste o login com as credenciais de teste

## Credenciais de Teste
- **Admin**: `admin` / `123456`
- **Técnico**: `tecnico` / `123456`
- **Encarregado**: `encarregado` / `123456`
- **Vendedor**: `vendedor` / `123456` 