import React from 'react';
import TagManager from './TagManager';

const LaudoGallery = ({ laudos, userInfo, onRefresh, onViewLaudo, onEditLaudo }) => {
  
  const getStatusColor = (status) => {
    const statusColors = {
      'em_andamento': '#f59e0b',
      'pendente': '#3b82f6', 
      'ap_manutencao': '#10b981',
      'aguardando_orcamento': '#8b5cf6',
      'ap_vendas': '#6366f1',
      'finalizado': '#059669',
      'reprovado': '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'em_andamento': 'Em Andamento',
      'pendente': 'Pendente', 
      'ap_manutencao': 'Ap. Manutenção',
      'aguardando_orcamento': 'Aguardando Orçamento',
      'ap_vendas': 'Ap. Vendas', 
      'finalizado': 'Finalizado',
      'reprovado': 'Reprovado'
    };
    return statusLabels[status] || status;
  };

  // ✅ CORREÇÃO: Usar as funções passadas como props
  const handleEdit = (laudoId) => {
    console.log('[DEBUG] Editar laudoId:', laudoId);
    if (onEditLaudo) {
      onEditLaudo(laudoId);
    }
  };

  const handleView = (laudoId) => {
    console.log('[DEBUG] Visualizar laudoId:', laudoId);
    if (onViewLaudo) {
      onViewLaudo(laudoId);
    }
  };

  const handleGeneratePDF = (laudoId) => {
    const token = localStorage.getItem('token');
    window.open(`/laudos/${laudoId}/pdf?token=${token}`, '_blank');
  };

  return (
    <div className="laudo-gallery">
      {/* ✅ CORREÇÃO: Grid responsivo de miniaturas PDF */}
      <div className="laudos-grid-pdf">
        {laudos.map(laudo => (
          <div key={laudo.id} className="laudo-miniature-pdf">
            {/* Ícone PDF sobreposto */}
            <div className="pdf-overlay">
              <div className="pdf-icon">📄</div>
            </div>
            
            {/* Header da miniatura */}
            <div className="miniature-header">
              <span className="laudo-id">#{laudo.id}</span>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: getStatusColor(laudo.status),
                  color: 'white'
                }}
              >
                {getStatusLabel(laudo.status)}
              </span>
            </div>

            {/* Conteúdo da miniatura */}
            <div className="miniature-content">
              <h4 className="cliente-name">{laudo.cliente}</h4>
              <p className="equipamento-info">{laudo.equipamento}</p>
              <p className="date-info">
                {new Date(laudo.data_criacao).toLocaleDateString('pt-BR')}
              </p>
              <p className="tecnico-info">
                <strong>Técnico:</strong> {laudo.tecnico || 'N/A'}
              </p>
              <div className="diagnostico-preview">
                <p>{(laudo.diagnostico || 'Diagnóstico não informado').substring(0, 80)}...</p>
              </div>
            </div>

            {/* Footer com ações */}
            <div className="miniature-actions">
              <button 
                className="action-btn-mini view-modern"
                onClick={() => handleView(laudo.id)}
                title="Visualizar Laudo"
              >
                <span className="btn-icon">👁️</span>
                <span className="btn-text">Ver</span>
              </button>
              <button 
                className="action-btn-mini edit-modern"
                onClick={() => handleEdit(laudo.id)}
                title="Editar Laudo"
              >
                <span className="btn-icon">✏️</span>
                <span className="btn-text">Editar</span>
              </button>
              
              {/* Gerenciador de Tags */}
              <TagManager 
                laudoId={laudo.id}
                currentTag={laudo.tag}
                onTagUpdate={(data) => {
                  // Atualizar o laudo na lista após adicionar tag
                  if (onRefresh) {
                    onRefresh();
                  }
                }}
              />
              
              {laudo.status === 'finalizado' && (
                <button 
                  className="action-btn-mini pdf-modern"
                  onClick={() => handleGeneratePDF(laudo.id)}
                  title="Baixar PDF"
                >
                  <span className="btn-icon">📄</span>
                  <span className="btn-text">PDF</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {laudos.length === 0 && (
        <div className="empty-gallery">
          <div className="empty-icon">📭</div>
          <h3>Nenhum laudo encontrado</h3>
          <p>Os laudos aparecerão aqui em formato de miniatura PDF</p>
        </div>
      )}
    </div>
  );
};

export default LaudoGallery; 