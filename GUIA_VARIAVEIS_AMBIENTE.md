# 🔧 Guia Completo - Variáveis de Ambiente Railway

## 📋 O que é cada variável?

### 🔑 **SECRET_KEY**
**O que é**: Chave secreta para criptografar tokens JWT (autenticação)

**Por que é importante**: 
- Protege os tokens de login dos usuários
- Deve ser única e muito segura
- Nunca compartilhe esta chave

**Como gerar**:
```bash
# Opção 1: Usar Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Opção 2: Usar online (temporário)
# Acesse: https://generate-secret.vercel.app/32

# Opção 3: Usar uma frase complexa
# Exemplo: "minha-chave-super-secreta-2024-rsm-laudos-123456"
```

**Exemplo de valor**:
```
SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890
```

---

### 🌐 **FRONTEND_URL**
**O que é**: URL onde está hospedado o frontend da aplicação

**Por que é importante**:
- Permite que o backend saiba de onde vêm as requisições
- Configura CORS (Cross-Origin Resource Sharing)
- Necessário para segurança

**Como configurar**:

#### **Se você ainda não tem frontend**:
```
FRONTEND_URL=https://localhost:3000
```

#### **Se vai usar Vercel (recomendado)**:
```
FRONTEND_URL=https://seu-app.vercel.app
```

#### **Se vai usar outro serviço**:
```
FRONTEND_URL=https://seu-dominio.com
```

---

### 🔒 **CORS_ORIGINS**
**O que é**: Lista de URLs permitidas para acessar a API

**Por que é importante**:
- Controle de segurança
- Define quais sites podem usar sua API
- Evita ataques de sites maliciosos

**Como configurar**:

#### **Para desenvolvimento**:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### **Para produção com Vercel**:
```
CORS_ORIGINS=https://seu-app.vercel.app
```

#### **Para múltiplos domínios**:
```
CORS_ORIGINS=https://seu-app.vercel.app,https://seu-dominio.com
```

---

## 🚀 Como Configurar no Railway

### **Passo 1: Acessar Railway**
1. Vá para [railway.app](https://railway.app)
2. Faça login
3. Acesse seu projeto

### **Passo 2: Configurar Variáveis**
1. Clique na aba **"Variables"**
2. Clique em **"New Variable"**

### **Passo 3: Adicionar Cada Variável**

#### **SECRET_KEY**
```
Name: SECRET_KEY
Value: [cole aqui a chave gerada]
```

#### **FRONTEND_URL**
```
Name: FRONTEND_URL
Value: https://seu-app.vercel.app
```

#### **CORS_ORIGINS**
```
Name: CORS_ORIGINS
Value: https://seu-app.vercel.app
```

---

## 📝 Exemplo Completo de Configuração

### **Para Desenvolvimento**:
```
ENVIRONMENT=production
SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
```

### **Para Produção com Vercel**:
```
ENVIRONMENT=production
SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://rsm-laudos.vercel.app
CORS_ORIGINS=https://rsm-laudos.vercel.app
LOG_LEVEL=INFO
```

---

## 🔧 Gerador de SECRET_KEY

Execute este comando para gerar uma chave segura:

```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
```

**Exemplo de saída**:
```
SECRET_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890
```

---

## 🌐 URLs Comuns para Frontend

### **Vercel (Recomendado)**:
```
https://seu-app.vercel.app
```

### **Netlify**:
```
https://seu-app.netlify.app
```

### **GitHub Pages**:
```
https://seu-usuario.github.io/seu-repo
```

### **Domínio Personalizado**:
```
https://api.seudominio.com
```

---

## ⚠️ Dicas Importantes

### **SECRET_KEY**:
- ✅ Use pelo menos 32 caracteres
- ✅ Misture letras, números e símbolos
- ❌ Nunca use palavras simples
- ❌ Nunca compartilhe a chave

### **FRONTEND_URL**:
- ✅ Use HTTPS em produção
- ✅ Inclua o protocolo (https://)
- ❌ Não use IP local em produção

### **CORS_ORIGINS**:
- ✅ Inclua apenas domínios confiáveis
- ✅ Use HTTPS em produção
- ❌ Não use * (wildcard) em produção

---

## 🎯 Configuração Rápida

### **1. Gerar SECRET_KEY**:
```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
```

### **2. Definir FRONTEND_URL**:
- Se vai usar Vercel: `https://seu-app.vercel.app`
- Se vai usar local: `http://localhost:3000`

### **3. Configurar CORS_ORIGINS**:
- Mesmo valor do FRONTEND_URL

### **4. Adicionar no Railway**:
- Copie e cole cada variável
- Clique em "Save"

---

## ✅ Checklist de Configuração

- [ ] SECRET_KEY gerada e configurada
- [ ] FRONTEND_URL definida
- [ ] CORS_ORIGINS configurada
- [ ] Todas as variáveis salvas no Railway
- [ ] Aplicação reiniciada automaticamente

**Pronto! Sua aplicação está segura e configurada!** 🚀 