import React, { useState, useEffect } from 'react';
import api from '../api';
import { canUserFinalize } from '../utils/laudoStatus';

// === SISTEMA DE LOGGING PROFISSIONAL ===
const Logger = {
  isDevelopment: process.env.NODE_ENV === 'development',
  
  debug: (message, data = null) => {
    if (Logger.isDevelopment) {
      console.log(`🔧 [APPROVAL-PANEL-DEBUG] ${message}`, data || '');
    }
  },
  
  info: (message, data = null) => {
    if (Logger.isDevelopment) {
      console.log(`ℹ️ [APPROVAL-PANEL-INFO] ${message}`, data || '');
    }
  },
  
  warn: (message, data = null) => {
    console.warn(`⚠️ [APPROVAL-PANEL-WARN] ${message}`, data || '');
  },
  
  error: (message, error = null) => {
    console.error(`❌ [APPROVAL-PANEL-ERROR] ${message}`, error || '');
  }
};

function ApprovalPanel({ userInfo }) {
  const [laudosPendentes, setLaudosPendentes] = useState([]);
  const [laudosAprovados, setLaudosAprovados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLaudo, setSelectedLaudo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [userPrivileges, setUserPrivileges] = useState([]);

  // ✅ Determinar tipo de usuário e permissões
  const isAdmin = userInfo?.is_admin === true;
  const isEncarregado = userInfo?.user_type === 'encarregado';
  const isVendedor = userInfo?.user_type === 'vendedor';
  const isTecnico = userInfo?.user_type === 'tecnico';

  // ✅ Determinar tipo de aprovação
  const getApprovalType = () => {
    if (isAdmin) return 'admin';
    if (isEncarregado) return 'manutencao';
    if (isVendedor) return 'vendas';
    if (isTecnico) return 'finalizacao';
    return null;
  };

  const approvalType = getApprovalType();

  useEffect(() => {
    if (userInfo && approvalType) {
      carregarPrivilegios();
      carregarLaudos();
    }
  }, [userInfo, approvalType]);

  const carregarPrivilegios = async () => {
    try {
      const response = await api.get('/user/privileges');
      setUserPrivileges(response.data || []);
    } catch (error) {
      Logger.error('Erro ao carregar privilégios', error);
      setUserPrivileges([]);
    }
  };

  const carregarLaudos = async () => {
    if (!userInfo || !approvalType) return;
    
    try {
      setLoading(true);
      Logger.debug('Carregando laudos para aprovação', { approvalType });

      const response = await api.get('/laudos/approval');
      const allLaudos = response.data || [];

      let pendentes = [];
      let aprovados = [];

      // ✅ Filtrar laudos baseado no tipo de aprovação
      switch (approvalType) {
        case 'admin':
          // Admin pode aprovar tudo
          pendentes = allLaudos.filter(laudo => 
            ['em_andamento', 'aprovado_manutencao'].includes(laudo.status)
          );
          aprovados = allLaudos.filter(laudo => 
            ['aprovado_vendas', 'finalizado'].includes(laudo.status)
          );
          break;
          
        case 'manutencao':
          // Encarregado aprova manutenção e pode finalizar
          pendentes = allLaudos.filter(laudo => 
            ['em_andamento', 'aprovado_vendas'].includes(laudo.status)
          );
          aprovados = allLaudos.filter(laudo => 
            ['aprovado_manutencao', 'finalizado'].includes(laudo.status)
          );
          break;
          
        case 'vendas':
          // Vendedor aprova orçamento
          pendentes = allLaudos.filter(laudo => 
            ['em_andamento', 'aprovado_manutencao'].includes(laudo.status)
          );
          aprovados = allLaudos.filter(laudo => 
            ['aprovado_vendas', 'finalizado'].includes(laudo.status)
          );
          break;
          
        case 'finalizacao':
          // Técnicos só podem finalizar seus próprios laudos (se tiverem privilégio)
          if (userInfo?.user_type === 'tecnico') {
            pendentes = allLaudos.filter(laudo => 
              laudo.status === 'aprovado_vendas' && 
              laudo.user_id === userInfo.id &&
              canUserFinalize(userInfo?.user_type, laudo.status, userPrivileges)
            );
            aprovados = allLaudos.filter(laudo => 
              laudo.status === 'finalizado' && laudo.user_id === userInfo.id
            );
          } else if (userInfo?.user_type === 'encarregado') {
            // Encarregados podem finalizar qualquer laudo
            pendentes = allLaudos.filter(laudo => 
              laudo.status === 'aprovado_vendas'
            );
            aprovados = allLaudos.filter(laudo => 
              laudo.status === 'finalizado'
            );
          }
          break;
          
        default:
          pendentes = [];
          aprovados = [];
      }

      setLaudosPendentes(pendentes);
      setLaudosAprovados(aprovados);
      
      Logger.info('Laudos carregados com sucesso', {
        pendentes: pendentes.length,
        aprovados: aprovados.length
      });

    } catch (error) {
      Logger.error('Erro ao carregar laudos', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Função de aprovação
  const aprovarLaudo = async (laudoId) => {
    try {
      let approvalTypeParam = 'manutencao';
      
      // Determinar tipo de aprovação baseado no usuário
      if (approvalType === 'vendas') {
        approvalTypeParam = 'vendas';
      } else if (approvalType === 'admin') {
        // Admin pode aprovar tanto manutenção quanto vendas
        approvalTypeParam = selectedLaudo?.status === 'aprovado_manutencao' ? 'vendas' : 'manutencao';
      }
      
      await api.post(`/laudos/${laudoId}/approve?approval_type=${approvalTypeParam}`);
      
      Logger.info(`Laudo #${laudoId} aprovado para ${approvalTypeParam}`);
      
      // Recarregar laudos
      await carregarLaudos();
      
      // Limpar modal
      setShowModal(false);
      setSelectedLaudo(null);
      setApprovalNote('');
      
      // Mostrar mensagem de sucesso
      alert(`Laudo #${laudoId} aprovado com sucesso!`);
      
    } catch (error) {
      Logger.error('Erro ao aprovar laudo', error);
      alert('Erro ao aprovar laudo. Tente novamente.');
    }
  };

  // ✅ Função de finalização
  const finalizarLaudo = async (laudoId) => {
    try {
      await api.post(`/laudos/${laudoId}/finalize`);
      
      Logger.info(`Laudo #${laudoId} finalizado`);
      
      // Recarregar laudos
      await carregarLaudos();
      
      // Mostrar mensagem de sucesso
      alert(`Laudo #${laudoId} finalizado com sucesso!`);
      
    } catch (error) {
      Logger.error('Erro ao finalizar laudo', error);
      alert('Erro ao finalizar laudo. Tente novamente.');
    }
  };

  // ✅ Função de reprovação
  const reprovarLaudo = async (laudoId) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, informe o motivo da reprovação.');
      return;
    }

    try {
      await api.put(`/laudos/${laudoId}`, {
        status: 'reprovado',
        observacoes: `Reprovado por ${userInfo?.username}: ${rejectionReason}`
      });
      
      Logger.info(`Laudo #${laudoId} reprovado`, { motivo: rejectionReason });
      
      // Recarregar laudos
      await carregarLaudos();
      
      // Limpar modal
      setShowModal(false);
      setSelectedLaudo(null);
      setRejectionReason('');
      
      // Mostrar mensagem de sucesso
      alert(`Laudo #${laudoId} reprovado com sucesso!`);
      
    } catch (error) {
      Logger.error('Erro ao reprovar laudo', error);
      alert('Erro ao reprovar laudo. Tente novamente.');
    }
  };

  // ✅ Abrir modal de aprovação
  const abrirModalAprovacao = (laudo) => {
    setSelectedLaudo(laudo);
    setShowModal(true);
    setApprovalNote('');
    setRejectionReason('');
  };

  // ✅ Fechar modal
  const fecharModal = () => {
    setShowModal(false);
    setSelectedLaudo(null);
    setApprovalNote('');
    setRejectionReason('');
  };

  // ✅ Verificar se usuário tem permissão
  if (!approvalType) {
    return (
      <div className="approval-panel">
        <div className="no-permission">
          <h2>🚫 Acesso Restrito</h2>
          <p>Você não tem permissão para aprovar laudos.</p>
          <p>Apenas administradores, encarregados e vendedores podem aprovar laudos.</p>
        </div>
      </div>
    );
  }

  // ✅ Títulos dinâmicos
  const getPanelTitle = () => {
    switch (approvalType) {
      case 'admin': return 'Painel de Aprovações - Administrador';
      case 'manutencao': return 'Painel de Aprovações - Encarregado';
      case 'vendas': return 'Painel de Aprovações - Vendas';
      case 'finalizacao': return 'Finalização de Laudos - Técnico';
      default: return 'Painel de Aprovações';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'em_andamento': 'Em Andamento',
      'aprovado_manutencao': 'Aprovado Manutenção',
      'aprovado_vendas': 'Aprovado Vendas',
      'finalizado': 'Finalizado',
      'reprovado': 'Reprovado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'em_andamento': '#F59E0B',      // Âmbar - Atenção, trabalho em progresso
      'aprovado_manutencao': '#10B981', // Verde - Sucesso, aprovação técnica
      'aprovado_vendas': '#8B5CF6',   // Violeta - Criatividade, aprovação comercial
      'finalizado': '#059669',        // Verde escuro - Conclusão, finalização
      'reprovado': '#DC2626'          // Vermelho - Alerta, rejeição
    };
    return colorMap[status] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="approval-panel">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando laudos para aprovação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-panel">
      <div className="panel-header">
        <h2>🔍 {getPanelTitle()}</h2>
        <button className="btn-refresh" onClick={carregarLaudos}>
          🔄 Atualizar
        </button>
      </div>

      <div className="panel-content">
        {/* Laudos Pendentes */}
        <div className="section-pendentes">
          <h3>⏳ Aguardando Aprovação ({laudosPendentes.length})</h3>
          
          {laudosPendentes.length > 0 ? (
            <div className="laudos-grid">
              {laudosPendentes.map(laudo => (
                <div key={laudo.id} className="laudo-card pendente">
                  <div className="laudo-header">
                    <span className="laudo-id">#{laudo.id}</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(laudo.status) }}
                    >
                      {getStatusLabel(laudo.status)}
                    </span>
                  </div>
                  
                  <div className="laudo-content">
                    <h4>{laudo.cliente}</h4>
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
                    {/* Botão de Aprovação para Encarregado/Vendedor */}
                    {(approvalType === 'manutencao' && laudo.status === 'em_andamento') && (
                      <button 
                        className="btn-approve"
                        onClick={() => abrirModalAprovacao(laudo)}
                      >
                        ✅ Aprovar Manutenção
                      </button>
                    )}
                    
                    {(approvalType === 'vendas' && laudo.status === 'aprovado_manutencao') && (
                      <button 
                        className="btn-approve"
                        onClick={() => abrirModalAprovacao(laudo)}
                      >
                        ✅ Aprovar Orçamento
                      </button>
                    )}
                    
                    {/* Botão de Finalização para Encarregado */}
                    {(approvalType === 'manutencao' && laudo.status === 'aprovado_vendas') && (
                      <button 
                        className="btn-finalize"
                        onClick={() => finalizarLaudo(laudo.id)}
                      >
                        🏁 Finalizar
                      </button>
                    )}
                    
                    {/* Botão de Finalização para Técnico */}
                    {(approvalType === 'finalizacao' && laudo.status === 'aprovado_vendas') && (
                      <button 
                        className="btn-finalize"
                        onClick={() => finalizarLaudo(laudo.id)}
                      >
                        🏁 Finalizar
                      </button>
                    )}
                    
                    {/* Botões para Admin */}
                    {approvalType === 'admin' && (
                      <>
                        {laudo.status === 'em_andamento' && (
                          <button 
                            className="btn-approve"
                            onClick={() => abrirModalAprovacao(laudo)}
                          >
                            ✅ Aprovar Manutenção
                          </button>
                        )}
                        
                        {laudo.status === 'aprovado_manutencao' && (
                          <button 
                            className="btn-approve"
                            onClick={() => abrirModalAprovacao(laudo)}
                          >
                            ✅ Aprovar Orçamento
                          </button>
                        )}
                        
                        {laudo.status === 'aprovado_vendas' && (
                          <button 
                            className="btn-finalize"
                            onClick={() => finalizarLaudo(laudo.id)}
                          >
                            🏁 Finalizar
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Botão de Reprovação */}
                    {(approvalType === 'manutencao' && laudo.status === 'em_andamento') && (
                      <button 
                        className="btn-reject"
                        onClick={() => abrirModalAprovacao(laudo)}
                      >
                        ❌ Reprovar
                      </button>
                    )}
                    
                    {(approvalType === 'vendas' && laudo.status === 'aprovado_manutencao') && (
                      <button 
                        className="btn-reject"
                        onClick={() => abrirModalAprovacao(laudo)}
                      >
                        ❌ Reprovar
                      </button>
                    )}
                    
                    {/* Botões de Reprovação para Admin */}
                    {approvalType === 'admin' && (
                      <>
                        {laudo.status === 'em_andamento' && (
                          <button 
                            className="btn-reject"
                            onClick={() => abrirModalAprovacao(laudo)}
                          >
                            ❌ Reprovar
                          </button>
                        )}
                        
                        {laudo.status === 'aprovado_manutencao' && (
                          <button 
                            className="btn-reject"
                            onClick={() => abrirModalAprovacao(laudo)}
                          >
                            ❌ Reprovar
                          </button>
                        )}
                      </>
                    )}
                    
                    <button 
                      className="btn-view"
                      onClick={() => {
                        // Abrir visualização em nova aba
                        const url = `${window.location.origin}/laudo-viewer/${laudo.id}`;
                        window.open(url, '_blank');
                      }}
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
              <h3>Nenhum laudo aguardando aprovação</h3>
              <p>Todos os laudos foram processados ou não há laudos pendentes para seu tipo de aprovação.</p>
            </div>
          )}
        </div>

        {/* Laudos Aprovados */}
        <div className="section-aprovados">
          <h3>✅ Aprovados ({laudosAprovados.length})</h3>
          
          {laudosAprovados.length > 0 ? (
            <div className="laudos-grid">
              {laudosAprovados.map(laudo => (
                <div key={laudo.id} className="laudo-card aprovado">
                  <div className="laudo-header">
                    <span className="laudo-id">#{laudo.id}</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(laudo.status) }}
                    >
                      {getStatusLabel(laudo.status)}
                    </span>
                  </div>
                  
                  <div className="laudo-content">
                    <h4>{laudo.cliente}</h4>
                    <p><strong>Equipamento:</strong> {laudo.equipamento}</p>
                    <p><strong>Técnico:</strong> {laudo.user_name}</p>
                    <p><strong>Data:</strong> {new Date(laudo.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  
                  <div className="laudo-actions">
                    <button 
                      className="btn-view"
                      onClick={() => {
                        // Abrir visualização em nova aba
                        const url = `${window.location.origin}/laudo-viewer/${laudo.id}`;
                        window.open(url, '_blank');
                      }}
                    >
                      👁️ Visualizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>Nenhum laudo aprovado</h3>
              <p>Ainda não há laudos aprovados por você.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Aprovação/Reprovação */}
      {showModal && selectedLaudo && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Aprovar/Reprovar Laudo #{selectedLaudo.id}</h3>
              <button className="btn-close" onClick={fecharModal}>✖️</button>
            </div>
            
            <div className="modal-body">
              <div className="laudo-info">
                <p><strong>Cliente:</strong> {selectedLaudo.cliente}</p>
                <p><strong>Equipamento:</strong> {selectedLaudo.equipamento}</p>
                <p><strong>Status Atual:</strong> {getStatusLabel(selectedLaudo.status)}</p>
              </div>
              
              <div className="approval-options">
                <div className="option-approve">
                  <h4>✅ Aprovar</h4>
                  <textarea
                    placeholder="Observações de aprovação (opcional)"
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    className="form-textarea"
                  />
                  <button 
                    className="btn-approve"
                    onClick={() => aprovarLaudo(selectedLaudo.id)}
                  >
                    Confirmar Aprovação
                  </button>
                </div>
                
                <div className="option-reject">
                  <h4>❌ Reprovar</h4>
                  <textarea
                    placeholder="Motivo da reprovação (obrigatório)"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="form-textarea"
                    required
                  />
                  <button 
                    className="btn-reject"
                    onClick={() => reprovarLaudo(selectedLaudo.id)}
                  >
                    Confirmar Reprovação
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalPanel; 