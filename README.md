# 🚀 RSM Laudos Técnicos Pro

Sistema SaaS de geração de laudos técnicos com IA para até 15 usuários simultâneos.

## 🎯 Status do Projeto

✅ **PRONTO PARA PRODUÇÃO** - Sistema configurado para deploy imediato

## 🚀 Deploy Rápido para Produção

### Opção Recomendada: Railway + Vercel

1. **Execute o script de deploy:**
   ```powershell
   .\scripts\deploy-production.ps1
   ```

2. **Siga o guia completo:**
   - 📖 [DEPLOY_PRODUCTION.md](DEPLOY_PRODUCTION.md)

3. **Configuração automática:**
   - Backend: Railway (FastAPI)
   - Frontend: Vercel (React)
   - Banco: SQLite (Railway)

## 🏗️ Arquitetura

```
Frontend (React) → Vercel
    ↓
Backend (FastAPI) → Railway
    ↓
Banco SQLite → Railway
```

## 📋 Pré-requisitos

- ✅ Conta Railway (https://railway.app)
- ✅ Conta Vercel (https://vercel.com)
- ✅ Chave OpenAI (https://platform.openai.com)
- ✅ Repositório GitHub

## 🔧 Configuração Local

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔐 Acesso

- **Admin:** `admin` / `123456`
- **Técnico:** `tecnico` / `123456`

## 📊 Recursos

- ✅ Sistema de autenticação JWT
- ✅ Geração de laudos com IA
- ✅ Sistema de aprovação
- ✅ Dashboard administrativo
- ✅ Relatórios e estatísticas
- ✅ Sistema de tags
- ✅ Notificações em tempo real
- ✅ Interface moderna e responsiva

## 🚨 Suporte

Para dúvidas sobre deploy ou configuração:
- 📖 Consulte [DEPLOY_PRODUCTION.md](DEPLOY_PRODUCTION.md)
- 🔧 Execute o script de deploy automatizado

---

**🎉 Sistema pronto para produção com até 15 usuários simultâneos!**