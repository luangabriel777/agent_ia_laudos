# 🔐 **COMO ACESSAR O GERENCIADOR DE PRIVILÉGIOS**

## 📋 **PASSO A PASSO:**

### **1. Iniciar o Sistema:**
```bash
# No terminal, na pasta raiz do projeto
./iniciar-sistema.ps1
```

### **2. Fazer Login como Admin ou Encarregado:**
- Acesse: `http://localhost:3000`
- Use as credenciais:
  - **👑 Administrador:** `admin` / `123456`
  - **👨‍🔧 Encarregado:** `encarregado` / `123456`
- Ou clique nos botões correspondentes no login

### **3. Acessar o Gerenciador:**
- Após fazer login como Admin ou Encarregado, você será direcionado para o **Dashboard Administrativo**
- No dashboard, você verá dois botões:
  - **"🔐 Gerenciar Privilégios"** - Para gerenciar privilégios dos técnicos
  - **"👥 Gerenciar Usuários"** - Para cadastrar técnicos e promover para Encarregado
- Clique no botão desejado para acessar o gerenciador

### **4. Interface dos Gerenciadores:**

#### **🔐 Gerenciador de Privilégios:**
- **📊 Seção de Estatísticas:**
  - Total de laudos
  - Laudos pendentes
  - Laudos aprovados
  - Número de usuários

- **👨‍🔧 Seção de Técnicos e Privilégios:**
  - Lista de todos os técnicos do sistema
  - Status atual do privilégio (✅ Ativo / ❌ Inativo)
  - Botões para **Conceder** ou **Revogar** privilégios

- **ℹ️ Informações sobre Privilégios:**
  - Explicação do sistema de privilégios
  - Fluxo de aprovação
  - Regras de permissões

#### **👥 Gerenciador de Usuários:**
- **➕ Formulário de Cadastro:**
  - Nome de usuário
  - Senha
  - Tipo de usuário (Técnico ou Encarregado)
  - Botão para cadastrar

- **👨‍🔧 Lista de Técnicos:**
  - Todos os técnicos cadastrados
  - Informações de cada técnico
  - Botão para **Promover para Encarregado**

- **👨‍🔧 Lista de Encarregados:**
  - Todos os encarregados ativos
  - Informações de cada encarregado

- **ℹ️ Informações sobre Usuários:**
  - Permissões de cada tipo de usuário
  - Diferenças entre Técnico e Encarregado

### **5. Gerenciar Privilégios:**

#### **Para Conceder Privilégio:**
1. Encontre o técnico na lista
2. Se o status for "❌ Inativo"
3. Clique em **"✅ Conceder Privilégio"**
4. Confirme a ação

#### **Para Revogar Privilégio:**
1. Encontre o técnico na lista
2. Se o status for "✅ Ativo"
3. Clique em **"🚫 Revogar Privilégio"**
4. Confirme a ação

### **6. Gerenciar Usuários:**

#### **Para Cadastrar Novo Usuário:**
1. Acesse o **"👥 Gerenciar Usuários"**
2. Preencha o formulário:
   - **Nome de Usuário:** Digite o nome do técnico
   - **Senha:** Digite uma senha segura
   - **Tipo de Usuário:** Selecione "Técnico" ou "Encarregado"
3. Clique em **"✅ Cadastrar Usuário"**
4. Confirme a criação

#### **Para Promover Técnico para Encarregado:**
1. Acesse o **"👥 Gerenciar Usuários"**
2. Encontre o técnico na lista
3. Clique em **"⬆️ Promover para Encarregado"**
4. Confirme a promoção

### **7. Voltar para Estatísticas:**
- Clique em **"📊 Ver Estatísticas"** para voltar ao dashboard

---

## 🎯 **O QUE CADA PRIVILÉGIO FAZ:**

### **🔐 Privilégio `finalize_laudos`:**
- **Permite ao técnico:** Finalizar seus próprios laudos
- **Restrição:** Só pode finalizar laudos que ele mesmo criou
- **Status necessário:** Laudo deve estar com status `aprovado_vendas`

### **👑 Admin (sem privilégio específico):**
- Pode fazer tudo no sistema
- Pode gerenciar privilégios de outros usuários
- Pode finalizar qualquer laudo

### **👨‍🔧 Encarregado (sem privilégio específico):**
- Pode aprovar manutenção
- Pode finalizar qualquer laudo (não precisa de privilégio)

### **💰 Vendedor (sem privilégio específico):**
- Pode aprovar orçamentos
- Não pode finalizar laudos

---

## 🔄 **FLUXO COMPLETO COM PRIVILÉGIOS:**

1. **Técnico** cria laudo → `em_andamento`
2. **Encarregado** aprova manutenção → `aprovado_manutencao`
3. **Vendedor** aprova orçamento → `aprovado_vendas`
4. **Técnico (com privilégio)** finaliza seu próprio laudo → `finalizado`
   - OU **Encarregado** finaliza qualquer laudo → `finalizado`

---

## ⚠️ **IMPORTANTE:**

- **Admin e Encarregados** podem acessar o gerenciador de privilégios
- **Admin e Encarregados** podem cadastrar técnicos e gerenciar privilégios
- **Técnicos sem privilégio** não veem o painel de finalização
- **Técnicos com privilégio** só veem seus próprios laudos para finalizar
- **Encarregados** sempre podem finalizar qualquer laudo
- **Privilégios podem ser concedidos/revogados** a qualquer momento

---

## 🧪 **TESTE AUTOMÁTICO:**

Para testar se tudo está funcionando:

```bash
# Teste do Admin
python test_admin_dashboard.py

# Teste do Encarregado
python test_encarregado_permissions.py

# Teste do Gerenciador de Usuários
python test_user_manager.py
```

Estes scripts testam:
- Login como admin e encarregado
- Carregamento de estatísticas
- Lista de usuários
- Gerenciamento de privilégios
- Concessão de privilégios
- Cadastro de usuários
- Promoção de técnicos

---

## 🎉 **SISTEMA FUNCIONAL!**

O gerenciador de privilégios está **totalmente implementado** e **funcional**! 