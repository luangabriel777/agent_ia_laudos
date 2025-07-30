# 🚀 **COMO INICIAR O SISTEMA RSM**

## 📋 **OPÇÕES PARA INICIAR O SISTEMA**

### **Opção 1: Script Automático (RECOMENDADO)**
```powershell
# No PowerShell, execute:
.\start-rsm.ps1
```

### **Opção 2: Script Interativo**
```powershell
# No PowerShell, execute:
.\iniciar-rsm.ps1
```

### **Opção 3: Comandos Manuais**

#### **1. Iniciar Backend:**
```powershell
cd backend
python app.py
```

#### **2. Iniciar Frontend (em outro terminal):**
```powershell
cd frontend
npm start
```

---

## 🔧 **PRÉ-REQUISITOS**

### **Backend (Python):**
- ✅ Python 3.8 ou superior
- ✅ Dependências instaladas: `pip install -r requirements.txt`

### **Frontend (Node.js):**
- ✅ Node.js 14 ou superior
- ✅ npm instalado
- ✅ Dependências instaladas: `npm install`

---

## 🌐 **ACESSO AO SISTEMA**

### **URLs:**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **Documentação API:** http://localhost:8000/docs

### **Credenciais de Login:**
- **Usuário:** admin
- **Senha:** 123456

---

## 📊 **STATUS DOS SERVIÇOS**

### **Verificar se estão rodando:**
```powershell
# Backend
curl http://localhost:8000/docs

# Frontend
curl http://localhost:3000
```

### **Portas utilizadas:**
- **Backend:** 8000
- **Frontend:** 3000

---

## 🛠️ **SOLUÇÃO DE PROBLEMAS**

### **Erro: "package.json não encontrado"**
```powershell
# Certifique-se de estar no diretório correto
cd C:\Users\Administrator\Desktop\1.2\frontend
npm start
```

### **Erro: "app.py não encontrado"**
```powershell
# Certifique-se de estar no diretório correto
cd C:\Users\Administrator\Desktop\1.2\backend
python app.py
```

### **Erro: "Python não encontrado"**
- Instale Python 3.8+ do site oficial
- Adicione Python ao PATH do sistema

### **Erro: "Node.js não encontrado"**
- Instale Node.js do site oficial
- Reinicie o PowerShell após a instalação

---

## 🎯 **FUNCIONALIDADES DISPONÍVEIS**

### **✅ Implementadas e Funcionando:**
- ✅ **Login e autenticação**
- ✅ **Dashboard administrativo**
- ✅ **Gerenciamento de usuários**
- ✅ **Criação e edição de laudos**
- ✅ **Visualização de PDF**
- ✅ **Sistema de notificações**
- ✅ **Menu lateral com hover**
- ✅ **Laudos avançados**

### **🔧 Correções Implementadas:**
- ✅ **Erro de JSONEncodeError** - Corrigido
- ✅ **URLs incorretas** - Corrigidas
- ✅ **Tabelas faltantes** - Criadas
- ✅ **Rotas 404** - Adicionadas
- ✅ **Tratamento de erros** - Melhorado

---

## 📝 **COMANDOS ÚTEIS**

### **Parar serviços:**
```powershell
# Parar processos Python
taskkill /f /im python.exe

# Parar processos Node.js
taskkill /f /im node.exe
```

### **Verificar processos:**
```powershell
# Ver processos Python
tasklist | findstr python

# Ver processos Node.js
tasklist | findstr node
```

---

## 🎉 **SISTEMA PRONTO!**

Após iniciar o sistema:
1. **Acesse** http://localhost:3000
2. **Faça login** com admin/123456
3. **Teste as funcionalidades** que estavam com erro
4. **Verifique se os PDFs** estão funcionando
5. **Teste a criação de usuários** no painel admin

**🚀 Sistema RSM completamente funcional!** 