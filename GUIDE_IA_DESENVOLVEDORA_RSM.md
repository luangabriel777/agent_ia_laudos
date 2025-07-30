# 🎯 GUIA COMPLETO PARA IA DESENVOLVEDORA - RSM

## 📋 CONTEXTO DO PROJETO

### **Sistema RSM – Rede de Serviços Moura**
- **Objetivo**: Plataforma digital para gestão de ordens de serviço e laudos técnicos de baterias
- **Usuários**: Técnicos, encarregados (supervisores), vendedores e administradores
- **Funções principais**:
  - Criar e editar laudos técnicos
  - Aprovar manutenções e orçamentos
  - Visualizar PDFs e status de ordens de serviço
  - Gerenciar fluxo operacional de OS do início ao fim

### **Meta**: Agilizar processos, dar rastreabilidade e melhorar a experiência do usuário

---

## 🚨 PROBLEMAS ATUAIS IDENTIFICADOS

### **Design e UX**
- ❌ Layout não responsivo e quebra em telas grandes
- ❌ Espaçamentos, margens e alinhamentos inconsistentes
- ❌ Botões e ações principais sem destaque
- ❌ Hierarquia visual fraca (títulos e textos muito parecidos)
- ❌ Cards, tabelas e formulários chapados, sem profundidade
- ❌ Visualização de PDF e áreas de edição "perdidas" no espaço

---

## 🎨 PADRÕES DE DESIGN OBRIGATÓRIOS

### **1. Hierarquia Visual**
```css
/* Títulos principais */
h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; }

/* Subtítulos */
h2 { font-size: 1.8rem; font-weight: 600; margin-bottom: 1rem; }

/* Títulos de seção */
h3 { font-size: 1.3rem; font-weight: 500; margin-bottom: 0.8rem; }

/* Texto normal */
p { font-size: 1rem; line-height: 1.6; }
```

### **2. Paleta de Cores Padronizada**
```css
/* Status Colors */
--status-approved: #10b981;    /* Verde - Aprovado */
--status-pending: #f59e0b;     /* Amarelo - Pendente */
--status-error: #ef4444;       /* Vermelho - Erro/Crítico */
--status-info: #3b82f6;        /* Azul - Informação */

/* Neutral Colors */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #1e293b;
--text-secondary: #64748b;
--border-color: #e2e8f0;
```

### **3. Botões e Interações**
```css
/* Botão Primário */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
}

/* Botão Secundário */
.btn-secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
```

### **4. Cards e Containers**
```css
/* Card Padrão */
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
```

---

## 🔧 CORREÇÕES ESPECÍFICAS POR TELA

### **Tela 1: Dashboard Inicial**
```css
/* Aplicar sempre */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}
```

### **Tela 2: Cards de Listagem**
```css
/* Cards com destaque visual */
.listing-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid #3b82f6;
  transition: all 0.2s ease;
}

.listing-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Ícones maiores e coloridos */
.card-icon {
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}
```

### **Tela 3: Formulários**
```css
/* Formulário responsivo */
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### **Tela 4: Visualizador de PDF**
```css
/* Área de visualização otimizada */
.pdf-viewer-container {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 1rem 0;
  min-height: 600px;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0.5rem;
  background: white;
}

.pdf-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}
```

### **Tela 5: Detalhes de OS/Laudo**
```css
/* Grid estruturado para informações */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.detail-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #3b82f6;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1.125rem;
  color: #1f2937;
  font-weight: 600;
  margin-top: 0.25rem;
}
```

### **Tela 6: Tabelas**
```css
/* Tabela responsiva e legível */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.table tr:nth-child(even) {
  background: #f9fafb;
}

.table tr:hover {
  background: #f3f4f6;
}

/* Status badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-approved { background: #dcfce7; color: #166534; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-error { background: #fee2e2; color: #991b1b; }
```

### **Tela 7: Cards de Estatísticas**
```css
/* Cards de estatísticas destacados */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3b82f6;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
}
```

### **Tela 8: Resumo Final**
```css
/* Resumo com destaque visual */
.summary-container {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.summary-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}
```

---

## 📱 RESPONSIVIDADE OBRIGATÓRIA

### **Breakpoints Padrão**
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### **Grid System Responsivo**
```css
/* Grid adaptativo */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

---

## ✅ CHECKLIST DE QUALIDADE

### **Antes de Finalizar Qualquer Tela, Verificar:**

- [ ] **Responsividade**: Testar em telas grandes, médias e pequenas
- [ ] **Hierarquia Visual**: Títulos, subtítulos e textos com pesos diferentes
- [ ] **Espaçamentos**: Padding e margin consistentes (múltiplos de 0.5rem)
- [ ] **Cores**: Usar paleta padronizada de status e neutras
- [ ] **Interações**: Hover effects em elementos clicáveis
- [ ] **Profundidade**: Sombras suaves em cards e containers
- [ ] **Tipografia**: Fontes legíveis e hierarquia clara
- [ ] **Botões**: Destaque visual adequado para ações principais
- [ ] **Feedback**: Estados visuais para loading, sucesso, erro
- [ ] **Acessibilidade**: Contraste adequado e navegação por teclado

---

## 🎯 RESULTADO ESPERADO

### **Após Aplicar Este Guia, o Sistema Deve Ter:**

✅ **Layout profissional, limpo e organizado**
✅ **Responsividade sem quebras em qualquer tela**
✅ **Hierarquia visual clara e navegação intuitiva**
✅ **Experiência fluida que passa confiança ao usuário**
✅ **Design moderno e consistente em todas as telas**
✅ **Performance otimizada e carregamento rápido**

---

## 📝 INSTRUÇÕES PARA IA DESENVOLVEDORA

**SEMPRE seguir este guia ao trabalhar no projeto RSM:**

1. **Leia completamente** este documento antes de qualquer implementação
2. **Aplique os padrões CSS** específicos para cada tipo de tela
3. **Use a paleta de cores** padronizada para status e elementos
4. **Implemente responsividade** em todos os componentes
5. **Siga o checklist de qualidade** antes de finalizar
6. **Mantenha consistência** visual em todo o sistema

**Este guia garante que qualquer IA desenvolvedora possa trabalhar no projeto RSM mantendo a qualidade e consistência visual profissional.** 