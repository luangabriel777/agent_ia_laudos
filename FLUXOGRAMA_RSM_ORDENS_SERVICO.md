# 🔄 FLUXOGRAMA RSM - ORDENS DE SERVIÇO (OS)

## 📋 **VISÃO GERAL DO FLUXO**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RSM - REDE DE SERVIÇOS MOURA                      │
│                    SISTEMA DE ORDENS DE SERVIÇO (OS)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **FLUXO PRINCIPAL DAS ORDENS DE SERVIÇO**

```
┌─────────────────┐
│   👨‍🔧 TÉCNICO   │
│   Cria a OS     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   📋 PENDENTE   │
│   Status inicial│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 🔄 EM ANDAMENTO │
│ Técnico preenche│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ✅ APROVADO     │
│ MANUTENÇÃO      │
│ 👨‍🔧 Encarregado │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 💰 APROVADO     │
│ VENDAS          │
│ 👔 Vendedor     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 🏁 FINALIZADO   │
│ OS Concluída    │
└─────────────────┘
```

---

## 👥 **PERMISSÕES POR PERFIL**

### **👨‍🔧 TÉCNICO**
```
┌─────────────────────────────────────────────────────────────────┐
│                        PERMISSÕES TÉCNICO                       │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Criar OS (status: pendente)                                  │
│ ✅ Editar OS própria                                            │
│ ✅ Aprovar manutenção (com privilégio)                          │
│ ✅ Finalizar OS (com privilégio)                                │
│ ❌ Aprovar orçamento                                            │
│ ❌ Editar OS de outros                                          │
└─────────────────────────────────────────────────────────────────┘
```

### **👨‍🔧 ENCARREGADO**
```
┌─────────────────────────────────────────────────────────────────┐
│                     PERMISSÕES ENCARREGADO                      │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Tudo do Técnico                                              │
│ ✅ Editar qualquer OS                                           │
│ ✅ Aprovar manutenção                                           │
│ ✅ Finalizar qualquer OS                                        │
│ ✅ Cadastrar técnicos                                           │
│ ✅ Gerenciar privilégios                                        │
│ ✅ Dashboard administrativo                                     │
│ ❌ Aprovar orçamento                                            │
└─────────────────────────────────────────────────────────────────┘
```

### **👔 VENDEDOR**
```
┌─────────────────────────────────────────────────────────────────┐
│                       PERMISSÕES VENDEDOR                       │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Visualizar OS                                                │
│ ✅ Aprovar orçamento                                            │
│ ✅ Recusar orçamento                                            │
│ ❌ Criar/editar OS                                              │
│ ❌ Aprovar manutenção                                           │
│ ❌ Finalizar OS                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **👑 ADMINISTRADOR**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSÕES ADMINISTRADOR                     │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Acesso total ao sistema                                      │
│ ✅ Gerenciar usuários                                           │
│ ✅ Gerenciar privilégios                                        │
│ ✅ Dashboard administrativo                                     │
│ ✅ Relatórios e estatísticas                                    │
│ ✅ Configurações do sistema                                     │
│ ✅ Logs e auditoria                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏷️ **SISTEMA DE TAGS (ORGANIZAÇÃO INTERNA)**

### **Tags Principais para Organização:**
```
┌─────────────────────────────────────────────────────────────────┐
│                        TAGS DE ORGANIZAÇÃO                      │
├─────────────────────────────────────────────────────────────────┤
│ 🔴 URGENTE     - Prioridade máxima                              │
│ ⏰ ATRASADO    - Prazo vencido                                   │
│ ⚠️ CRÍTICO     - Problema grave                                 │
│ 🔧 MANUTENÇÃO  - Requer manutenção                              │
│ 💰 VENDA       - Relacionado a vendas                           │
│ 🔄 REPARO      - Em processo de reparo                          │
│ 🛡️ PREVENTIVA  - Manutenção preventiva                          │
│ 🔧 CORRETIVA   - Manutenção corretiva                           │
└─────────────────────────────────────────────────────────────────┘
```

### **Fluxo de Tags:**
```
┌─────────────────┐
│   🏷️ TAG       │
│   Adicionada    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 📢 NOTIFICAÇÃO  │
│ Para todos os   │
│ usuários        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 📺 PAINEL TV    │
│ Atualizações    │
│ em tempo real   │
└─────────────────┘
```

---

## 🔄 **FLUXO DETALHADO COM DECISÕES**

```
┌─────────────────┐
│   👨‍🔧 TÉCNICO   │
│   Cria OS       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   📋 PENDENTE   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 🔄 EM ANDAMENTO │
│ Técnico preenche│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ 👨‍🔧 ENCARREGADO │
│ Verifica OS     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ❓ APROVA?      │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐ ┌─────────┐
│   ✅    │ │   ❌    │
│ APROVA  │ │ REJEITA │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│ ✅ APROV│ │ 📝 CORR│
│ MANUTEN │ │ TÉCNICO │
└────┬────┘ └────┬────┘
     │           │
     ▼           │
┌─────────┐      │
│ 💰 VEND │      │
│ APROVA? │      │
└────┬────┘      │
     │           │
     ▼           │
┌─────────┐      │
│ ✅ APROV│      │
│ VENDAS  │      │
└────┬────┘      │
     │           │
     ▼           │
┌─────────┐      │
│ 🏁 FINAL│      │
│ OS      │      │
└─────────┘      │
                 │
                 ▼
            ┌─────────┐
            │ 🔄 VOLTA│
            │ ANDAMENT│
            └─────────┘
```

---

## 📊 **STATUS E TRANSITIONS**

### **Status da OS:**
```
┌─────────────────────────────────────────────────────────────────┐
│                          STATUS DA OS                           │
├─────────────────────────────────────────────────────────────────┤
│ 📋 PENDENTE        - OS criada, aguardando preenchimento        │
│ 🔄 EM_ANDAMENTO    - OS sendo preenchida pelo técnico           │
│ ✅ APROVADO        - Aprovado por encarregado                   │
│ 💰 APROVADO_VENDAS - Aprovado por vendas                        │
│ 🏁 FINALIZADO      - OS concluída completamente                 │
│ ❌ REJEITADO       - OS rejeitada                               │
└─────────────────────────────────────────────────────────────────┘
```

### **Transições Permitidas:**
```
┌─────────────────────────────────────────────────────────────────┐
│                      TRANSIÇÕES DE STATUS                      │
├─────────────────────────────────────────────────────────────────┤
│ 📋 PENDENTE → 🔄 EM_ANDAMENTO (Técnico)                        │
│ 🔄 EM_ANDAMENTO → ✅ APROVADO (Encarregado)                     │
│ 🔄 EM_ANDAMENTO → 💰 APROVADO_VENDAS (Vendedor)                 │
│ ✅ APROVADO → 💰 APROVADO_VENDAS (Vendedor)                     │
│ 💰 APROVADO_VENDAS → 🏁 FINALIZADO (Técnico/Encarregado)        │
│ ❌ REJEITADO → 🔄 EM_ANDAMENTO (Técnico)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **REGRAS DE NEGÓCIO**

### **1. Múltiplas Tags Simultâneas:**
- Uma OS pode ter múltiplas tags ao mesmo tempo
- Tags são para organização interna, não afetam o fluxo principal
- Exemplo: OS pode ser "URGENTE" + "MANUTENÇÃO" + "CORRETIVA"

### **2. Aprovações Independentes:**
- Aprovação de manutenção (Encarregado) e vendas (Vendedor) são independentes
- Uma OS pode ser aprovada por vendas mesmo estando em andamento
- Ambas as aprovações são necessárias para finalização

### **3. Permissões Hierárquicas:**
- Encarregado tem todas as permissões do Técnico + extras
- Administrador tem acesso total ao sistema
- Vendedor tem permissões limitadas apenas a orçamentos

### **4. Notificações Automáticas:**
- Toda tag adicionada gera notificação para todos os usuários
- Painel de atualizações em tempo real para TV
- Auto-refresh a cada 30 segundos

---

## 🚀 **BENEFÍCIOS DO SISTEMA**

### **Para Técnicos:**
- ✅ Interface simples e intuitiva
- ✅ Criação rápida de OS
- ✅ Acompanhamento em tempo real
- ✅ Notificações automáticas

### **Para Encarregados:**
- ✅ Controle total das OS
- ✅ Aprovação eficiente
- ✅ Dashboard administrativo
- ✅ Gerenciamento de equipe

### **Para Vendedores:**
- ✅ Aprovação rápida de orçamentos
- ✅ Visibilidade das OS
- ✅ Integração com vendas

### **Para Administradores:**
- ✅ Visão completa do sistema
- ✅ Relatórios detalhados
- ✅ Controle de usuários
- ✅ Monitoramento em tempo real

---

## 📱 **INTERFACE E EXPERIÊNCIA**

### **Dashboard Principal:**
- 📊 Estatísticas em tempo real
- 🏷️ Painel de atualizações
- ⚡ Ações rápidas
- 📋 Lista de OS recentes

### **Painel de TV:**
- 🖥️ Otimizado para exibição em TV
- 🔄 Auto-refresh automático
- 🎨 Design responsivo
- 📢 Notificações visuais

### **Responsividade:**
- 📱 Mobile-first design
- 💻 Desktop otimizado
- 🖥️ Tablet adaptado
- 📺 TV display ready

---

**Status**: ✅ **SISTEMA COMPLETO E FUNCIONAL**  
**Versão**: 2.0.0  
**Data**: 29/07/2025 