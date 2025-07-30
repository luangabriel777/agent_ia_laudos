import React, { useState, useEffect } from 'react';
import '../KanbanFlow.css';

const KanbanFlow = ({ userInfo }) => {
  const [laudos, setLaudos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colunas do Kanban baseadas no fluxo
  const columns = [
    {
      id: 'em_andamento',
      title: '🔄 Em Andamento',
      statuses: ['em_andamento'],
      color: '#ED8936'
    },
    {
      id: 'pendente',
      title: '⏳ Pendente Aprovação',
      statuses: ['pendente'],
      color: '#3182CE'
    },
    {
      id: 'aguardando_orcamento',
      title: '💰 Aguardando Orçamento',
      statuses: ['aguardando_orcamento'],
      color: '#FFEB3B',
      role: 'vendedor'
    },
    {
      id: 'orcamento_aprovado',
      title: '🔧 Pronto para Execução',
      statuses: ['orcamento_aprovado'],
      color: '#9C27B0',
      role: 'tecnico'
    },
    {
      id: 'finalizado',
      title: '✅ Finalizado',
      statuses: ['finalizado', 'compra_finalizada'],
      color: '#48BB78'
    }
  ];

  useEffect(() => {
    fetchLaudos();
  }, []);

  const fetchLaudos = async () => {
    try {
      const response = await fetch('/laudos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLaudos(data);
    } catch (error) {
      console.error('Erro ao buscar laudos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLaudosForColumn = (column) => {
    return laudos.filter(laudo => column.statuses.includes(laudo.status));
  };

  const getStatusIcon = (status) => {
    const icons = {
      'em_andamento': '🔄',
      'pendente': '⏳',
      'aguardando_orcamento': '💰',
      'orcamento_aprovado': '🔧',
      'finalizado': '✅',
      'compra_finalizada': '🏁'
    };
    return icons[status] || '📋';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'em_andamento': 'Em andamento',
      'pendente': 'Pendente',
      'aguardando_orcamento': 'Aguardando orçamento',
      'orcamento_aprovado': 'Pronto para execução',
      'finalizado': 'Finalizado',
      'compra_finalizada': 'Compra finalizada'
    };
    return labels[status] || status;
  };

  const handleApprove = async (laudoId, action) => {
    try {
      const endpoints = {
        'aprovar_manutencao': `/admin/laudo/${laudoId}/aprovar-manutencao`,
        'aprovar_vendas': `/admin/laudo/${laudoId}/aprovar-vendas`,
        'finalizar_execucao': `/admin/laudo/${laudoId}/finalizar-execucao`
      };

      const response = await fetch(endpoints[action], {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchLaudos(); // Atualizar dados
        alert('✅ Ação realizada com sucesso!');
      } else {
        throw new Error('Erro na aprovação');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao processar ação');
    }
  };

  const renderLaudoCard = (laudo) => (
    <div key={laudo.id} className="kanban-card">
      <div className="card-header">
        <span className="card-id">#{laudo.id}</span>
        <span className="card-status">
          {getStatusIcon(laudo.status)} {getStatusLabel(laudo.status)}
        </span>
      </div>
      
      <div className="card-content">
        <h4 className="card-client">{laudo.cliente}</h4>
        <p className="card-equipment">{laudo.equipamento}</p>
        <p className="card-diagnosis">{laudo.diagnostico?.substring(0, 80)}...</p>
        <div className="card-meta">
          <span className="card-tech">👨‍🔧 {laudo.user_name}</span>
          <span className="card-date">📅 {new Date(laudo.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="card-actions">
        {/* Ações baseadas no status e perfil do usuário */}
        {laudo.status === 'pendente' && userInfo?.isAdmin && (
          <button 
            className="action-btn approve"
            onClick={() => handleApprove(laudo.id, 'aprovar_manutencao')}
          >
            <span className="action-btn-icon">🔍</span>
            <span className="action-btn-text">Aprovar Supervisão</span>
          </button>
        )}
        
        {laudo.status === 'aguardando_orcamento' && (userInfo?.userType === 'vendedor' || userInfo?.isAdmin) && (
          <button 
            className="action-btn approve-vendor"
            onClick={() => handleApprove(laudo.id, 'aprovar_vendas')}
          >
            <span className="action-btn-icon">💰</span>
            <span className="action-btn-text">Aprovar Orçamento</span>
          </button>
        )}
        
        {laudo.status === 'orcamento_aprovado' && (userInfo?.userType === 'tecnico' || userInfo?.isAdmin) && (
          <button 
            className="action-btn finalize"
            onClick={() => handleApprove(laudo.id, 'finalizar_execucao')}
          >
            <span className="action-btn-icon">🔧</span>
            <span className="action-btn-text">Finalizar Execução</span>
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>Carregando fluxo de laudos...</p>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h2>🗺️ Fluxo Automatizado de Laudos RSM</h2>
        <p>Acompanhe o progresso dos laudos em tempo real</p>
      </div>
      
      <div className="kanban-board">
        {columns.map(column => {
          const columnLaudos = getLaudosForColumn(column);
          const isRelevantColumn = !column.role || 
            column.role === userInfo?.userType || 
            userInfo?.isAdmin ||
            columnLaudos.length > 0;

          if (!isRelevantColumn) return null;

          return (
            <div key={column.id} className="kanban-column">
              <div 
                className="column-header"
                style={{ borderTopColor: column.color }}
              >
                <h3>{column.title}</h3>
                <span className="column-count">
                  {columnLaudos.length} laudo{columnLaudos.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="column-content">
                {columnLaudos.length === 0 ? (
                  <div className="empty-column">
                    <span className="empty-icon">📭</span>
                    <p>Nenhum laudo nesta etapa</p>
                  </div>
                ) : (
                  columnLaudos.map(renderLaudoCard)
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="kanban-legend">
        <h4>📋 Legenda do Fluxo:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-arrow">🔄 Em andamento</span>
            <span className="legend-arrow">→</span>
            <span className="legend-arrow">⏳ Pendente</span>
            <span className="legend-arrow">→</span>
            <span className="legend-arrow">💰 Aguardando orçamento</span>
            <span className="legend-arrow">→</span>
            <span className="legend-arrow">🔧 Pronto execução</span>
            <span className="legend-arrow">→</span>
            <span className="legend-arrow">✅ Finalizado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanFlow; 