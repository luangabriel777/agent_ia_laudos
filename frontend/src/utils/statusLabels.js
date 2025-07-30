/**
 * Utilitário para gerar etiquetas de status dos laudos
 */

export const getStatusLabel = (status) => {
  const statusMap = {
    'pendente': {
      text: 'Pendente',
      emoji: '⏳',
      color: '#2196F3', // Blue
      bgColor: '#E3F2FD',
      borderColor: '#2196F3'
    },
    'em_andamento': {
      text: 'Em Andamento',
      emoji: '📝',
      color: '#FF9800', // Orange
      bgColor: '#FFF3E0',
      borderColor: '#FF9800'
    },
    'aprovado_manutencao': {
      text: 'Aprovado Manutenção',
      emoji: '✅',
      color: '#4CAF50', // Green
      bgColor: '#E8F5E8',
      borderColor: '#4CAF50'
    },
    'aprovado_vendas': {
      text: 'Aprovado Vendas',
      emoji: '💰',
      color: '#9C27B0', // Purple
      bgColor: '#F3E5F5',
      borderColor: '#9C27B0'
    },
    'finalizado': {
      text: 'Finalizado',
      emoji: '🏁',
      color: '#4CAF50', // Green
      bgColor: '#E8F5E8',
      borderColor: '#4CAF50'
    },
    'reprovado': {
      text: 'Reprovado',
      emoji: '❌',
      color: '#F44336', // Red
      bgColor: '#FFEBEE',
      borderColor: '#F44336'
    }
  };

  return statusMap[status] || {
    text: 'Desconhecido',
    emoji: '❓',
    color: '#757575',
    bgColor: '#F5F5F5',
    borderColor: '#757575'
  };
};

export const getCompletionStatus = (laudo) => {
  // Determina se o laudo está completo baseado nos campos obrigatórios
  const requiredFields = ['cliente', 'equipamento', 'diagnostico', 'solucao'];
  const completedFields = requiredFields.filter(field => 
    laudo[field] && laudo[field].toString().trim() !== ''
  );
  
  const isComplete = completedFields.length === requiredFields.length;
  
  if (laudo.status === 'finalizado') {
    return 'finalized';
  } else if (laudo.status === 'reprovado') {
    return 'rejected';
  } else if (laudo.status === 'aprovado_manutencao' || laudo.status === 'aprovado_vendas') {
    return 'approved';
  } else if (isComplete) {
    return 'complete';
  } else {
    return 'in_progress';
  }
};

export const getCompletionLabel = (completionStatus) => {
  const labelMap = {
    'in_progress': {
      text: 'Em Andamento',
      emoji: '📝',
      color: '#FF9800',
      bgColor: '#FFF3E0'
    },
    'complete': {
      text: 'Concluído',
      emoji: '✅',
      color: '#4CAF50',
      bgColor: '#E8F5E8'
    },
    'approved': {
      text: 'Aprovado',
      emoji: '🟢',
      color: '#4CAF50',
      bgColor: '#E8F5E8'
    },
    'finalized': {
      text: 'Finalizado',
      emoji: '🏁',
      color: '#4CAF50',
      bgColor: '#E8F5E8'
    },
    'rejected': {
      text: 'Reprovado',
      emoji: '🔴',
      color: '#F44336',
      bgColor: '#FFEBEE'
    }
  };

  return labelMap[completionStatus] || labelMap['in_progress'];
};

export const StatusBadge = ({ status, className = '', style = {} }) => {
  const statusInfo = getStatusLabel(status);
  
  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: `1px solid ${statusInfo.borderColor}`,
        backgroundColor: statusInfo.bgColor,
        color: statusInfo.color,
        ...style
      }}
    >
      <span>{statusInfo.emoji}</span>
      <span>{statusInfo.text}</span>
    </span>
  );
};

export const CompletionBadge = ({ laudo, className = '', style = {} }) => {
  const completionStatus = getCompletionStatus(laudo);
  const statusInfo = getCompletionLabel(completionStatus);
  
  return (
    <span
      className={`completion-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: statusInfo.bgColor,
        color: statusInfo.color,
        ...style
      }}
    >
      <span>{statusInfo.emoji}</span>
      <span>{statusInfo.text}</span>
    </span>
  );
}; 