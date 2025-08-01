import React, { useState, useEffect } from 'react';
import api from '../api';
import { StatusBadge, CompletionBadge } from '../utils/statusLabels';

const ApprovalTab = ({ userInfo }) => {
  const [pendingLaudos, setPendingLaudos] = useState([]);
  const [approvedLaudos, setApprovedLaudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('pending');
  const [rejectedLaudos, setRejectedLaudos] = useState([]); // 'pending' ou 'approved'
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    fetchLaudos();
  }, []);

  const fetchLaudos = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🎯 Carregando laudos para aprovação...');
      
      let pendingRes, approvedRes, rejectedRes;
      
      // ADMIN: busca todos os laudos
      if (userInfo?.isAdmin) {
        [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          api.get('/admin/laudos-pendentes'),
          api.get('/admin/laudos-aprovados'),
          api.get('/admin/laudos-reprovados')
        ]);
      }
              // VENDEDOR: busca apenas laudos aguardando orçamento
        else if (userInfo?.userType === 'vendedor') {
          const allLaudosResponse = await api.get('/laudos');
          const allLaudos = allLaudosResponse.data;
          
          // Pendentes para vendedor: laudos aguardando orçamento
          pendingRes = { data: allLaudos.filter(l => l.status === 'aguardando_orcamento') };
          
          // Aprovados pelo vendedor: laudos com orçamento aprovado e finalizados
          approvedRes = { data: allLaudos.filter(l => 
            l.status === 'orcamento_aprovado' || 
            l.status === 'finalizado' || 
            l.status === 'compra_finalizada'
          ) };
          
          // Vendedor não vê reprovados
          rejectedRes = { data: [] };
        }
        // TÉCNICO: busca apenas laudos com orçamento aprovado para execução
        else if (userInfo?.userType === 'tecnico') {
          const allLaudosResponse = await api.get('/laudos');
          const allLaudos = allLaudosResponse.data;
          
          // Pendentes para técnico: laudos com orçamento aprovado (aguardando execução)
          pendingRes = { data: allLaudos.filter(l => l.status === 'orcamento_aprovado') };
          
          // Finalizados pelo técnico: laudos finalizados
          approvedRes = { data: allLaudos.filter(l => 
            l.status === 'finalizado' || 
            l.status === 'compra_finalizada'
          ) };
          
          // Técnico não vê reprovados
          rejectedRes = { data: [] };
        }
      
      console.log('🎯 Laudos pendentes:', pendingRes.data);
      console.log('🎯 Laudos aprovados:', approvedRes.data);
      console.log('🎯 Laudos reprovados:', rejectedRes.data);
      
      setPendingLaudos(pendingRes.data || []);
      setApprovedLaudos(approvedRes.data || []);
      setRejectedLaudos(rejectedRes.data || []);
      
      // Extrair lista única de técnicos
      const allLaudos = [...(pendingRes.data || []), ...(approvedRes.data || []), ...(rejectedRes.data || [])];
      const uniqueTechnicians = [...new Set(allLaudos.map(l => l.user_name).filter(Boolean))];
      setTechnicians(uniqueTechnicians);
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Erro ao carregar laudos:', err);
      
      if (err.response?.status === 403) {
        setError('Acesso negado. Verifique se você tem permissões adequadas.');
      } else if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (err.response?.status === 404) {
        setError('Endpoints de aprovação não encontrados. Verifique se o backend está funcionando.');
      } else {
        setError(`Erro ao carregar laudos: ${err.message || 'Erro desconhecido'}`);
      }
      
      setLoading(false);
    }
  };

  const handleApprove = async (laudoId) => {
    try {
      await api.post(`/admin/laudo/${laudoId}/aprovar`);
      fetchLaudos(); // Recarregar lista
    } catch (err) {
      alert('Erro ao aprovar laudo: ' + err.message);
    }
  };

  const handleApproveManutencao = async (laudoId) => {
    try {
      await api.post(`/admin/laudo/${laudoId}/aprovar-manutencao`);
      alert('Supervisão aprovada com sucesso!');
      fetchLaudos(); // Recarregar lista
    } catch (err) {
      alert('Erro ao aprovar supervisão: ' + err.message);
    }
  };

  const handleApproveVendas = async (laudoId) => {
    try {
      await api.post(`/admin/laudo/${laudoId}/aprovar-vendas`);
      alert('Orçamento aprovado com sucesso!');
      fetchLaudos(); // Recarregar lista
    } catch (err) {
      alert('Erro ao aprovar orçamento: ' + err.message);
    }
  };

  const handleFinalizarExecucao = async (laudoId) => {
    try {
      await api.post(`/admin/laudo/${laudoId}/finalizar-execucao`);
      alert('Execução finalizada com sucesso!');
      fetchLaudos(); // Recarregar lista
    } catch (err) {
      alert('Erro ao finalizar execução: ' + err.message);
    }
  };

  const handleReject = async (laudoId) => {
    try {
      const rejectionReason = prompt('Digite o motivo da reprovação:');
      if (!rejectionReason || !rejectionReason.trim()) {
        alert('Motivo da reprovação é obrigatório!');
        return;
      }
      
      await api.post(`/admin/laudo/${laudoId}/recusar`, {
        rejection_reason: rejectionReason.trim()
      });
      fetchLaudos(); // Recarregar lista
    } catch (err) {
      alert('Erro ao recusar laudo: ' + err.message);
    }
  };

  const handleDownloadPDF = async (laudoId) => {
    try {
      const response = await api.get(`/laudos/${laudoId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laudo_${laudoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response?.status === 403) {
        alert('⚠️ Sem permissão para baixar este PDF.');
      } else if (err.response?.status === 404) {
        alert('❌ Laudo não encontrado.');
      } else {
        alert('❌ Erro ao baixar PDF: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const filteredLaudos = () => {
    let laudos;
    if (activeView === 'pending') {
      laudos = pendingLaudos;
    } else if (activeView === 'approved') {
      laudos = approvedLaudos;
    } else if (activeView === 'rejected') {
      laudos = rejectedLaudos;
    } else {
      laudos = [];
    }
    
    if (selectedTechnician === 'all') return laudos;
    return laudos.filter(l => l.user_name === selectedTechnician);
  };

  if (loading) {
    return (
      <div className="approval-tab">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando laudos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="approval-tab">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="approval-tab">
      <div className="approval-header">
        <h2>
          {userInfo?.isAdmin ? 'Gestão de Aprovações - Administrador' : 
           userInfo?.userType === 'vendedor' ? 'Aprovações de Orçamento - Vendas' : 
           'Aprovações de Execução - Técnico'}
        </h2>
        
        <div className="approval-controls">
          <div className="view-toggle">
            {/* ADMIN vê todas as opções */}
            {userInfo?.isAdmin && (
              <>
                <button
                  className={`toggle-btn ${activeView === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveView('pending')}
                >
                  ⏳ Pendentes ({pendingLaudos.length})
                </button>
                <button
                  className={`toggle-btn ${activeView === 'approved' ? 'active' : ''}`}
                  onClick={() => setActiveView('approved')}
                >
                  ✅ Aprovados ({approvedLaudos.length})
                </button>
                <button
                  className={`toggle-btn ${activeView === 'rejected' ? 'active' : ''}`}
                  onClick={() => setActiveView('rejected')}
                >
                  ❌ Reprovados ({rejectedLaudos.length})
                </button>
              </>
            )}
            
            {/* VENDEDOR vê apenas aprovados pela manutenção */}
            {userInfo?.userType === 'vendedor' && (
              <>
                <button
                  className={`toggle-btn ${activeView === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveView('pending')}
                >
                  💰 Aguardando Orçamento ({pendingLaudos.length})
                </button>
                <button
                  className={`toggle-btn ${activeView === 'approved' ? 'active' : ''}`}
                  onClick={() => setActiveView('approved')}
                >
                  ✅ Orçamentos Aprovados ({approvedLaudos.length})
                </button>
              </>
            )}
            
            {/* TÉCNICO vê apenas aprovados pelas vendas */}
            {userInfo?.userType === 'tecnico' && !userInfo?.isAdmin && (
              <>
                <button
                  className={`toggle-btn ${activeView === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveView('pending')}
                >
                  🔧 Aguardando Execução ({pendingLaudos.length})
                </button>
                <button
                  className={`toggle-btn ${activeView === 'approved' ? 'active' : ''}`}
                  onClick={() => setActiveView('approved')}
                >
                  ✅ Execuções Finalizadas ({approvedLaudos.length})
                </button>
              </>
            )}
          </div>

          <div className="filter-technician">
            <label>Filtrar por técnico:</label>
            <select 
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="technician-filter"
            >
              <option value="all">Todos os técnicos</option>
              {technicians.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="laudos-grid">
        {filteredLaudos().length === 0 ? (
          <div className="no-laudos">
            <p>Nenhum laudo {activeView === 'pending' ? 'pendente' : activeView === 'approved' ? 'aprovado' : 'reprovado'} encontrado.</p>
          </div>
        ) : (
          filteredLaudos().map(laudo => (
            <div key={laudo.id} className={`laudo-card ${laudo.status}`}>
              <div className="laudo-header">
                <span className="laudo-id">#{laudo.id}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <StatusBadge status={laudo.status || 'pendente'} />
                  {laudo.status !== 'aprovado' && laudo.status !== 'reprovado' && (
                    <CompletionBadge laudo={laudo} />
                  )}
                </div>
              </div>
              
              <div className="laudo-info">
                <p><strong>Técnico:</strong> {laudo.user_name}</p>
                <p><strong>Cliente:</strong> {laudo.cliente}</p>
                <p><strong>Equipamento:</strong> {laudo.equipamento}</p>
                <p><strong>Data:</strong> {new Date(laudo.created_at).toLocaleString('pt-BR')}</p>
                {laudo.approved_by_name && (
                  <p><strong>Aprovado por:</strong> {laudo.approved_by_name}</p>
                )}
              </div>

              <div className="laudo-content">
                <div className="field-preview">
                  <h4>Diagnóstico:</h4>
                  <p>{laudo.diagnostico}</p>
                </div>
                <div className="field-preview">
                  <h4>Solução:</h4>
                  <p>{laudo.solucao}</p>
                </div>
                {laudo.rejection_reason && (
                  <div className="field-preview" style={{ 
                    background: 'var(--error-color)', 
                    color: 'white', 
                    padding: '0.5rem',
                    borderRadius: '5px',
                    marginTop: '0.5rem'
                  }}>
                    <h4>Motivo da Reprovação:</h4>
                    <p>{laudo.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="laudo-actions">
                {laudo.status === 'pendente' && (
                  <>
                    {/* ADMIN aprova primeiro estágio */}
                    {userInfo?.isAdmin && (
                      <button 
                        className="action-btn approve"
                        onClick={() => handleApproveManutencao(laudo.id)}
                      >
                        <span className="action-btn-icon">🔍</span>
                        <span className="action-btn-text">Aprovar Supervisão</span>
                      </button>
                    )}
                    {/* Apenas ADMIN pode recusar */}
                    {userInfo?.isAdmin && (
                      <button 
                        className="action-btn reject"
                        onClick={() => handleReject(laudo.id)}
                      >
                        <span className="action-btn-icon">❌</span>
                        <span className="action-btn-text">Recusar</span>
                      </button>
                    )}
                  </>
                )}
                
                {laudo.status === 'aguardando_orcamento' && (
                  <>
                    {/* VENDEDOR aprova orçamento */}
                    {(userInfo?.isAdmin || userInfo?.userType === 'vendedor') && (
                      <button 
                        className="action-btn approve-vendor"
                        onClick={() => handleApproveVendas(laudo.id)}
                      >
                        <span className="action-btn-icon">💰</span>
                        <span className="action-btn-text">Aprovar Orçamento</span>
                      </button>
                    )}
                    {/* Apenas ADMIN pode recusar */}
                    {userInfo?.isAdmin && (
                      <button 
                        className="action-btn reject"
                        onClick={() => handleReject(laudo.id)}
                      >
                        <span className="action-btn-icon">❌</span>
                        <span className="action-btn-text">Recusar</span>
                      </button>
                    )}
                  </>
                )}
                
                {laudo.status === 'orcamento_aprovado' && (
                  <>
                    {/* TÉCNICO finaliza execução */}
                    {(userInfo?.isAdmin || userInfo?.userType === 'tecnico') && (
                      <button 
                        className="action-btn finalize"
                        onClick={() => handleFinalizarExecucao(laudo.id)}
                      >
                        <span className="action-btn-icon">🔧</span>
                        <span className="action-btn-text">Finalizar Execução</span>
                      </button>
                    )}
                    {/* Apenas ADMIN pode recusar */}
                    {userInfo?.isAdmin && (
                      <button 
                        className="action-btn reject"
                        onClick={() => handleReject(laudo.id)}
                      >
                        <span className="action-btn-icon">❌</span>
                        <span className="action-btn-text">Recusar</span>
                      </button>
                    )}
                  </>
                )}
                
                {(laudo.status === 'finalizado' || laudo.status === 'compra_finalizada' || laudo.status === 'concluido') && (
                  <div style={{ 
                    padding: '0.5rem', 
                    backgroundColor: '#E8F5E8', 
                    borderRadius: '5px',
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    🏁 Compra Finalizada - Disponível para Consulta
                  </div>
                )}
                
                {(laudo.status === 'finalizado' || laudo.status === 'compra_finalizada' || laudo.status === 'concluido' || laudo.status === 'aprovado') && (
                  <button 
                    className="action-btn pdf"
                    onClick={() => handleDownloadPDF(laudo.id)}
                  >
                    📄 Baixar PDF
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalTab; 