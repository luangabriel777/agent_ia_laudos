import React, { useState, useEffect } from 'react';
import api from '../api';

// === SISTEMA DE LOGGING PROFISSIONAL ===
const Logger = {
  isDevelopment: process.env.NODE_ENV === 'development',
  
  debug: (message, data = null) => {
    if (Logger.isDevelopment) {
      console.log(`🔧 [APPROVAL-DEBUG] ${message}`, data || '');
    }
  },
  
  info: (message, data = null) => {
    if (Logger.isDevelopment) {
      console.log(`ℹ️ [APPROVAL-INFO] ${message}`, data || '');
    }
  },
  
  warn: (message, data = null) => {
    console.warn(`⚠️ [APPROVAL-WARN] ${message}`, data || '');
  },
  
  error: (message, error = null) => {
    console.error(`❌ [APPROVAL-ERROR] ${message}`, error || '');
  }
};

function ApprovalCenter({ userInfo }) {
  const [laudosParaAprovacao, setLaudosParaAprovacao] = useState([]);
  const [laudosAprovados, setLaudosAprovados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLaudoId, setSelectedLaudoId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // ✅ CORREÇÃO: Verificar permissões por tipo de usuário
  const isAdmin = userInfo?.role === 'admin' || userInfo?.is_admin === true;
  const isEncarregado = userInfo?.user_type === 'encarregado';
  const isVendedor = userInfo?.user_type === 'vendedor';
  const isTecnico = userInfo?.user_type === 'tecnico';

  // ✅ CORREÇÃO: Determinar tipo de aprovação baseado no usuário
  const getApprovalType = () => {
    if (isAdmin) return 'admin';
    if (isEncarregado) return 'manutencao';
    if (isVendedor) return 'vendas';
    return null;
  };

  const approvalType = getApprovalType();

  useEffect(() => {
    if (userInfo && approvalType) {
      buscarLaudosParaAprovacao();
    }
  }, [userInfo, approvalType]);

  const buscarLaudosParaAprovacao = async () => {
    if (!userInfo || !approvalType) return;
    
    try {
      Logger.debug('Iniciando busca por aprovações', {
        userType: userInfo?.user_type,
        approvalType: approvalType,
        isAdmin: userInfo?.is_admin
      });

      const allLaudosRes = await api.get('/laudos');
      const allLaudos = allLaudosRes.data || [];

      let pendingForUser = [];
      let approvedForUser = [];

      // ✅ CORREÇÃO: Filtrar laudos baseado no tipo de aprovação
      switch (approvalType) {
        case 'admin':
          // Admin pode aprovar tudo
          pendingForUser = allLaudos.filter(laudo => 
            laudo.status === 'em_andamento'
          );
          approvedForUser = allLaudos.filter(laudo => 
            ['aprovado_manutencao', 'aprovado_vendas', 'finalizado'].includes(laudo.status)
          );
          break;
          
        case 'manutencao':
          // Encarregado aprova manutenção
          pendingForUser = allLaudos.filter(laudo => 
            laudo.status === 'em_andamento'
          );
          approvedForUser = allLaudos.filter(laudo => 
            ['aprovado_manutencao', 'finalizado'].includes(laudo.status)
          );
          break;
          
        case 'vendas':
          // Vendedor aprova orçamento
          pendingForUser = allLaudos.filter(laudo => 
            laudo.status === 'aprovado_manutencao'
          );
          approvedForUser = allLaudos.filter(laudo => 
            ['aprovado_vendas', 'finalizado'].includes(laudo.status)
          );
          break;
          
        default:
          pendingForUser = [];
          approvedForUser = [];
      }

      Logger.debug('Laudos filtrados por tipo de aprovação', {
        approvalType: approvalType,
        pending: pendingForUser.length,
        approved: approvedForUser.length
      });

      setLaudosParaAprovacao(pendingForUser);
      setLaudosAprovados(approvedForUser);
      
      Logger.info('Aprovações carregadas com sucesso', {
        pendingCount: pendingForUser.length,
        approvedCount: approvedForUser.length
      });

    } catch (error) {
      Logger.error('Erro ao buscar aprovações', error);
      setLaudosParaAprovacao([]);
      setLaudosAprovados([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: Função de aprovação baseada no tipo de usuário
  const aprovarLaudo = async (laudoId) => {
    try {
      let newStatus = 'aprovado_manutencao';
      
      // Determinar novo status baseado no tipo de aprovação
      if (approvalType === 'vendas') {
        newStatus = 'aprovado_vendas';
      } else if (approvalType === 'admin') {
        newStatus = 'aprovado_manutencao';
      }
      
      await api.put(`/laudos/${laudoId}`, {
        status: newStatus
      });
      
      Logger.info(`Laudo #${laudoId} aprovado para ${newStatus}`);
      
      // Recarregar laudos
      buscarLaudosParaAprovacao();
      
    } catch (error) {
      Logger.error('Erro ao aprovar laudo', error);
      alert('Erro ao aprovar laudo. Tente novamente.');
    }
  };

  // ✅ CORREÇÃO: Função de reprovação
  const reprovarLaudo = async (laudoId, motivo) => {
    try {
      await api.put(`/laudos/${laudoId}`, {
        status: 'reprovado',
        observacoes: motivo
      });
      
      Logger.info(`Laudo #${laudoId} reprovado`, { motivo });
      
      // Recarregar laudos
      buscarLaudosParaAprovacao();
      
    } catch (error) {
      Logger.error('Erro ao reprovar laudo', error);
      alert('Erro ao reprovar laudo. Tente novamente.');
    }
  };

  const handleReprovar = (laudoId) => {
    setSelectedLaudoId(laudoId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmarReprova = async () => {
    if (!selectedLaudoId || !rejectReason.trim()) return;

    try {
      await reprovarLaudo(selectedLaudoId, rejectReason.trim());
      setShowRejectModal(false);
      setSelectedLaudoId(null);
      setRejectReason('');
    } catch (error) {
      Logger.error('Erro ao confirmar reprovação', error);
      alert('Erro ao reprovar laudo. Tente novamente.');
    }
  };

  const visualizarLaudo = (laudo) => {
    window.open(`/laudos/${laudo.id}`, '_blank');
  };

  // ✅ CORREÇÃO: Verificar se usuário tem permissão para acessar
  if (!approvalType) {
    return (
      <div className="approval-center">
        <div className="no-permission">
          <h2>🚫 Acesso Restrito</h2>
          <p>Você não tem permissão para acessar o Centro de Aprovações.</p>
          <p>Apenas administradores, encarregados e vendedores podem aprovar laudos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="approval-center">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando aprovações...</p>
        </div>
      </div>
    );
  }

  // ✅ CORREÇÃO: Títulos dinâmicos baseados no tipo de usuário
  const getApprovalTitle = () => {
    switch (approvalType) {
      case 'admin': return 'Centro de Aprovações - Administrador';
      case 'manutencao': return 'Aprovações de Manutenção - Encarregado';
      case 'vendas': return 'Aprovações de Vendas';
      default: return 'Centro de Aprovações';
    }
  };

  const getApprovalDescription = () => {
    switch (approvalType) {
      case 'admin': return 'Aprovação de Laudos Técnicos - Acesso Total';
      case 'manutencao': return 'Aprovação de Manutenção - Encarregado';
      case 'vendas': return 'Aprovação de Orçamentos Técnicos';
      default: return 'Centro de Aprovações';
    }
  };

  return (
    <div className="modern-container">
      <div className="modern-header">
        <div className="modern-header-content">
          <h2>👨‍⚖️ Centro de Aprovações</h2>
          <p>{getApprovalDescription()}</p>
        </div>
      </div>

      <div className="modern-content">
        {/* Estatísticas de Aprovação */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">📊</span>
              <h3>Estatísticas de Aprovação</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{laudosParaAprovacao.length}</div>
                <div className="stat-label">Aguardando Aprovação</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{laudosAprovados.length}</div>
                <div className="stat-label">Aprovados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Laudos Pendentes */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">⏳</span>
              <h3>Laudos Pendentes ({laudosParaAprovacao.length})</h3>
            </div>
          </div>
          <div className="modern-card-content">
            {laudosParaAprovacao.length > 0 ? (
              <div className="laudos-grid">
                {laudosParaAprovacao.map(laudo => (
                  <div key={laudo.id} className="laudo-card pending">
                    <div className="laudo-header">
                      <span className="laudo-id">#{laudo.id}</span>
                      <span className="status-badge pending">Pendente</span>
                    </div>
                    
                    <div className="laudo-content">
                      <h4 className="cliente-nome">{laudo.cliente}</h4>
                      <p><strong>Equipamento:</strong> {laudo.equipamento}</p>
                      <p><strong>Técnico:</strong> {laudo.user_name}</p>
                      <p><strong>Data:</strong> {new Date(laudo.created_at).toLocaleDateString('pt-BR')}</p>
                      
                      {laudo.diagnostico && (
                        <div className="diagnostico-preview">
                          <strong>Diagnóstico:</strong>
                          <p>{laudo.diagnostico.substring(0, 150)}...</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="laudo-actions">
                      <button 
                        className="btn-view"
                        onClick={() => visualizarLaudo(laudo)}
                      >
                        👁️ Visualizar
                      </button>
                      <button 
                        className="btn-approve"
                        onClick={() => aprovarLaudo(laudo.id)}
                      >
                        ✅ Aprovar
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReprovar(laudo.id)}
                      >
                        ❌ Reprovar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>Nenhum laudo pendente</h3>
                <p>Todos os laudos foram processados ou não há laudos aguardando sua aprovação.</p>
              </div>
            )}
          </div>
        </div>

        {/* Laudos Aprovados */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">✅</span>
              <h3>Laudos Aprovados ({laudosAprovados.length})</h3>
            </div>
          </div>
          <div className="modern-card-content">
            {laudosAprovados.length > 0 ? (
              <div className="laudos-grid">
                {laudosAprovados.slice(0, 6).map(laudo => (
                  <div key={laudo.id} className="laudo-card approved">
                    <div className="laudo-header">
                      <span className="laudo-id">#{laudo.id}</span>
                      <span className="status-badge approved">Aprovado</span>
                    </div>
                    
                    <div className="laudo-content">
                      <h4 className="cliente-nome">{laudo.cliente}</h4>
                      <p><strong>Equipamento:</strong> {laudo.equipamento}</p>
                      <p><strong>Técnico:</strong> {laudo.user_name}</p>
                      <p><strong>Data:</strong> {new Date(laudo.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    
                    <div className="laudo-actions">
                      <button 
                        className="btn-view"
                        onClick={() => visualizarLaudo(laudo)}
                      >
                        👁️ Visualizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Nenhum laudo aprovado</h3>
                <p>Ainda não há laudos aprovados no sistema.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reprovação */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>❌ Reprovar Laudo</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Por favor, informe o motivo da reprovação do laudo #{selectedLaudoId}:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Descreva o motivo da reprovação..."
                rows={4}
                className="form-textarea"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRejectModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmarReprova}
                disabled={!rejectReason.trim()}
              >
                ❌ Confirmar Reprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalCenter; 