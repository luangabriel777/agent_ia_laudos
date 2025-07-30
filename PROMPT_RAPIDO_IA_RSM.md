# 🚀 PROMPT RÁPIDO PARA IA DESENVOLVEDORA - RSM

## 📋 CONTEXTO
Você está trabalhando no **RSM – Rede de Serviços Moura**, uma plataforma para gestão de ordens de serviço e laudos técnicos de baterias. O sistema tem problemas de design: layout não responsivo, espaçamentos inconsistentes, hierarquia visual fraca e elementos sem destaque.

## 🎯 OBJETIVO
Corrigir e modernizar o design para ter layout profissional, responsivo e experiência fluida.

## 🎨 PADRÕES OBRIGATÓRIOS

### **Cores Padronizadas**
```css
--status-approved: #10b981;    /* Verde - Aprovado */
--status-pending: #f59e0b;     /* Amarelo - Pendente */
--status-error: #ef4444;       /* Vermelho - Erro */
--status-info: #3b82f6;        /* Azul - Info */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #1e293b;
--text-secondary: #64748b;
```

### **Hierarquia Visual**
- Títulos principais: `font-size: 2.5rem; font-weight: 700;`
- Subtítulos: `font-size: 1.8rem; font-weight: 600;`
- Títulos de seção: `font-size: 1.3rem; font-weight: 500;`

### **Botões Padrão**
```css
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
```

### **Cards Padrão**
```css
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}
```

## 🔧 CORREÇÕES POR TELA

### **Dashboard/Listagem**
- Container máximo: `max-width: 1200px; margin: 0 auto; padding: 2rem;`
- Grid responsivo: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));`
- Espaçamento: `gap: 1.5rem;`

### **Formulários**
- Largura máxima: `max-width: 800px; margin: 0 auto;`
- Grid 2 colunas: `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));`
- Labels: `font-weight: 600; color: #374151;`

### **Tabelas**
- Container com scroll: `overflow-x: auto;`
- Linhas alternadas: `tr:nth-child(even) { background: #f9fafb; }`
- Hover: `tr:hover { background: #f3f4f6; }`

### **Visualizador PDF**
- Container: `background: #f8fafc; border-radius: 0.75rem; padding: 1rem;`
- Altura mínima: `min-height: 600px;`

## 📱 RESPONSIVIDADE
```css
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## ✅ CHECKLIST FINAL
- [ ] Responsividade testada
- [ ] Hierarquia visual clara
- [ ] Espaçamentos consistentes (múltiplos de 0.5rem)
- [ ] Cores padronizadas aplicadas
- [ ] Hover effects implementados
- [ ] Sombras suaves em cards
- [ ] Botões com destaque adequado

## 🎯 RESULTADO ESPERADO
Layout profissional, responsivo, hierarquia clara e experiência fluida que passa confiança ao usuário.

---

**Aplique estes padrões em TODAS as telas do sistema RSM para garantir consistência e qualidade profissional.** 