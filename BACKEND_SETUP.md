# Configuração do Backend no Railway

## Problema Identificado
O frontend está configurado para se conectar ao backend no Railway, mas a URL está incorreta.

## Soluções

### 1. Configurar a URL correta do Railway

Você precisa substituir a URL do backend no arquivo `src/config.js`:

```javascript
// Em src/config.js, linha 6
API_BASE_URL: process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? '' // Em desenvolvimento, usa o proxy do package.json
    : 'https://SEU-BACKEND-REAL.railway.app' // ⚠️ SUBSTITUIR PELA URL REAL
  ),
```

### 2. Configurar Variável de Ambiente no Vercel

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://SEU-BACKEND-REAL.railway.app`
   - **Environment**: Production

### 3. Verificar se o Backend está Rodando

1. Acesse o [Railway Dashboard](https://railway.app/dashboard)
2. Verifique se seu serviço está **Online**
3. Copie a URL do serviço (geralmente algo como `https://seu-projeto-production.up.railway.app`)

### 4. Testar a Conexão

1. Abra o console do navegador (F12)
2. Vá para https://www.escolhatech.shop/
3. Verifique se há erros de conexão
4. O componente de debug (em desenvolvimento) mostrará o status da conexão

### 5. Endpoints Necessários

O frontend espera os seguintes endpoints no backend:

- `POST /login` - Autenticação
- `GET /me` - Informações do usuário
- `GET /health` - Health check (opcional)

### 6. CORS Configuration

Certifique-se de que o backend está configurado para aceitar requisições do domínio:
- `https://www.escolhatech.shop`
- `https://escolhatech.shop`

## Debug

Para debugar problemas de conexão:

1. Abra o console do navegador
2. Verifique os erros de rede
3. Teste a URL do backend diretamente no navegador
4. Use o componente `ConnectionDebug` (visível apenas em desenvolvimento)

## Credenciais de Teste

Em desenvolvimento, você pode usar:
- **Admin**: `admin` / `123456`
- **Técnico**: `tecnico` / `123456`
- **Encarregado**: `encarregado` / `123456`
- **Vendedor**: `vendedor` / `123456` 