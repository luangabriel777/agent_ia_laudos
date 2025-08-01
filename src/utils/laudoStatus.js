// Constantes de Status dos Laudos - RSM
export const LAUDO_STATUS = {
  PENDENTE: "pendente",
  EM_ANDAMENTO: "em_andamento", 
  APROVADO_MANUTENCAO: "aprovado_manutencao",
  APROVADO_VENDAS: "aprovado_vendas",
  FINALIZADO: "finalizado",
  REPROVADO: "reprovado"
};

// Labels visuais para exibição
export const STATUS_LABELS = {
  pendente: "Pendente",
  em_andamento: "Em Andamento", 
  aprovado_manutencao: "Aprovado Manutenção",
  aprovado_vendas: "Aprovado Vendas",
  finalizado: "Finalizado",
  reprovado: "Reprovado"
};

// Ícones para cada status
export const STATUS_ICONS = {
  pendente: "⏳",
  em_andamento: "📝",
  aprovado_manutencao: "✅",
  aprovado_vendas: "💰",
  finalizado: "🏁",
  reprovado: "❌"
};

// Cores para badges - Psicologia das Cores
export const STATUS_COLORS = {
  pendente: "#3B82F6",          // Azul - Confiança, estabilidade
  em_andamento: "#F59E0B",      // Âmbar - Atenção, trabalho em progresso
  aprovado_manutencao: "#10B981", // Verde - Sucesso, aprovação técnica
  aprovado_vendas: "#8B5CF6",   // Violeta - Criatividade, aprovação comercial
  finalizado: "#059669",        // Verde escuro - Conclusão, finalização
  reprovado: "#DC2626"          // Vermelho - Alerta, rejeição
};

// Função para obter informações completas do status
export const getStatusInfo = (status) => {
  return {
    label: STATUS_LABELS[status] || "Desconhecido",
    icon: STATUS_ICONS[status] || "❓",
    color: STATUS_COLORS[status] || "#757575"
  };
};

// Fluxo do laudo - para controle de transições
export const FLUXO_LAUDO = {
  // Status inicial
  INICIAL: [LAUDO_STATUS.PENDENTE],
  
  // Status em desenvolvimento
  DESENVOLVIMENTO: [LAUDO_STATUS.EM_ANDAMENTO],
  
  // Status de aprovação técnica
  APROVACAO_TECNICA: [LAUDO_STATUS.APROVADO_MANUTENCAO],
  
  // Status de aprovação comercial
  APROVACAO_COMERCIAL: [LAUDO_STATUS.APROVADO_VENDAS],
  
  // Status finais
  FINAIS: [LAUDO_STATUS.FINALIZADO, LAUDO_STATUS.REPROVADO]
};

// Função para verificar se um status é final
export const isStatusFinal = (status) => {
  return FLUXO_LAUDO.FINAIS.includes(status);
};

// Função para obter próximo status no fluxo
export const getProximoStatus = (statusAtual) => {
  switch (statusAtual) {
    case LAUDO_STATUS.PENDENTE:
      return LAUDO_STATUS.EM_ANDAMENTO;
    case LAUDO_STATUS.EM_ANDAMENTO:
      return LAUDO_STATUS.APROVADO_MANUTENCAO;
    case LAUDO_STATUS.APROVADO_MANUTENCAO:
      return LAUDO_STATUS.APROVADO_VENDAS;
    case LAUDO_STATUS.APROVADO_VENDAS:
      return LAUDO_STATUS.FINALIZADO;
    default:
      return null;
  }
};

// Função para verificar se usuário pode finalizar laudo
export const canUserFinalize = (userType, laudoStatus, userPrivileges = []) => {
  // Admin pode finalizar qualquer laudo
  if (userType === 'admin') return true;
  
  // Encarregados podem finalizar qualquer laudo aprovado pelo Vendedor
  if (userType === 'encarregado') {
    return laudoStatus === LAUDO_STATUS.APROVADO_VENDAS;
  }
  
  // Técnicos precisam ter privilégio específico para finalizar seus próprios laudos
  if (userType === 'tecnico') {
    const hasPrivilege = userPrivileges.includes('finalize_laudos');
    return hasPrivilege && laudoStatus === LAUDO_STATUS.APROVADO_VENDAS;
  }
  
  return false;
};

// Função para verificar se status podem coexistir
export const canCoexist = (status1, status2) => {
  // "em andamento" pode coexistir com "aprovado vendas"
  if ((status1 === 'em_andamento' && status2 === 'aprovado_vendas') ||
      (status1 === 'aprovado_vendas' && status2 === 'em_andamento')) {
    return true;
  }
  return false;
};

export default {
  LAUDO_STATUS,
  STATUS_LABELS,
  STATUS_ICONS,
  STATUS_COLORS,
  getStatusInfo,
  FLUXO_LAUDO,
  isStatusFinal,
  getProximoStatus,
  canCoexist
}; 