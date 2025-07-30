# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO - RSM Laudos

## 📋 Pré-requisitos

1. **Conta no Railway** (https://railway.app)
2. **Conta no Vercel** (https://vercel.com)
3. **Chave da OpenAI** (https://platform.openai.com/api-keys)
4. **Repositório no GitHub** com o código

## 🔧 PASSO 1: Deploy do Backend no Railway

### 1.1 Acesse o Railway
- Vá para https://railway.app
- Faça login com sua conta GitHub

### 1.2 Crie novo projeto
- Clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha seu repositório

### 1.3 Configure o projeto
- Railway detectará automaticamente o `railway.json`
- Aguarde o build inicial

### 1.4 Configure as variáveis de ambiente
No Railway, vá em "Variables" e adicione:

```env
ENVIRONMENT=production
SECRET_KEY=sua-chave-secreta-muito-segura-aqui
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=sua-chave-da-openai-aqui
FRONTEND_URL=https://seu-frontend.vercel.app
CORS_ORIGINS=https://seu-frontend.vercel.app
LOG_LEVEL=INFO
```

### 1.5 Obtenha a URL do backend
- Após o deploy, Railway fornecerá uma URL como: `https://seu-projeto.railway.app`
- **Guarde esta URL!** Você precisará dela para o frontend

## 🌐 PASSO 2: Deploy do Frontend no Vercel

### 2.1 Acesse o Vercel
- Vá para https://vercel.com
- Faça login com sua conta GitHub

### 2.2 Importe o projeto
- Clique em "New Project"
- Importe o mesmo repositório GitHub
- Vercel detectará automaticamente o `vercel.json`

### 2.3 Configure as variáveis de ambiente
No Vercel, vá em "Settings" > "Environment Variables" e adicione:

```env
REACT_APP_API_URL=https://sua-url-do-railway.railway.app
```

### 2.4 Deploy
- Clique em "Deploy"
- Aguarde o build e deploy

## 🔗 PASSO 3: Configuração Final

### 3.1 Atualize a URL do frontend no Railway
No Railway, atualize a variável:
```env
FRONTEND_URL=https://seu-projeto.vercel.app
```

### 3.2 Teste o sistema
- Acesse: https://seu-projeto.vercel.app
- Login padrão: `admin` / `123456`

## 📊 MONITORAMENTO

### Railway Dashboard
- Acesse o dashboard do Railway
- Monitore logs, performance e uso de recursos

### Vercel Analytics
- Acesse o dashboard do Vercel
- Monitore performance e erros

## 🔒 SEGURANÇA

### Variáveis sensíveis
- ✅ Nunca commite chaves no GitHub
- ✅ Use variáveis de ambiente
- ✅ Troque a SECRET_KEY padrão

### SSL/HTTPS
- ✅ Railway e Vercel fornecem SSL automático
- ✅ URLs já são HTTPS

## 🚨 TROUBLESHOOTING

### Erro de CORS
- Verifique se `FRONTEND_URL` está correto no Railway
- Confirme se `CORS_ORIGINS` inclui a URL do Vercel

### Erro de conexão com API
- Verifique se `REACT_APP_API_URL` está correto no Vercel
- Teste a URL da API diretamente no navegador

### Erro de build
- Verifique os logs no Railway/Vercel
- Confirme se todas as dependências estão no `requirements.txt`

## 📈 ESCALABILIDADE

### Para mais de 15 usuários
- Railway: Upgrade para plano pago ($5-20/mês)
- Vercel: Plano gratuito suporta até 100GB de banda

### Monitoramento avançado
- Configure alertas no Railway
- Use Vercel Analytics para performance

## 🎯 PRÓXIMOS PASSOS

1. **Teste completo** com 15 usuários simultâneos
2. **Configure domínio customizado** (opcional)
3. **Configure backup automático** do banco
4. **Monitore performance** e otimize conforme necessário

---

## ✅ CHECKLIST FINAL

- [ ] Backend deployado no Railway
- [ ] Frontend deployado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Sistema testado e funcionando
- [ ] Login admin funcionando
- [ ] Criação de laudos funcionando
- [ ] Sistema de aprovação funcionando

**🎉 Seu SaaS está pronto para produção!** 