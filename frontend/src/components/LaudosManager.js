import React, { useState, useEffect } from 'react';
import LaudoGallery from './LaudoGallery';

const LaudosManager = ({ userInfo, onShowAdvancedForm, onShowModernForm, onShowRecorder, onViewLaudo, onEditLaudo }) => {
  const [laudos, setLaudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('gallery'); // ✅ CORREÇÃO: Estado para alternância
  
  useEffect(() => {
    fetchLaudos();
  }, []);

  const fetchLaudos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/laudos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLaudos(data);
      }
    } catch (error) {
      console.error('Erro ao buscar laudos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // ✅ CORREÇÃO: Filtrar laudos por busca e status
  const filteredLaudos = laudos.filter(laudo => {
    const matchesSearch = !searchTerm || 
      laudo.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laudo.equipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laudo.id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || laudo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="modern-container">
        <div className="modern-header">
          <div className="modern-header-content">
            <h2>📋 Gestão de Laudos</h2>
          </div>
        </div>
        <div className="modern-content">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando laudos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-container">
      <div className="modern-header">
        <div className="modern-header-content">
          <h2>📋 Gestão de Laudos</h2>
          <p>Visualize, gerencie e acompanhe todos os laudos técnicos</p>
        </div>
      </div>

      <div className="modern-content">
        {/* Ações Principais */}
        <div className="modern-card">
          <div className="modern-card-header">
            <h3 className="modern-card-title">🚀 Ações Rápidas</h3>
          </div>
          <div className="quick-actions-grid">
            <button 
              className="modern-btn modern-btn-primary"
              onClick={onShowAdvancedForm}
            >
              <span>🔋</span>
              Novo Laudo Avançado
            </button>
            <button 
              className="modern-btn modern-btn-secondary"
              onClick={onShowModernForm}
            >
              <span>➕</span>
              Novo Laudo Simples
            </button>
            <button 
              className="modern-btn modern-btn-success"
              onClick={onShowRecorder}
            >
              <span>🎤</span>
              Gravação de Voz
            </button>
          </div>
        </div>

        {/* Controles de Busca e Filtros */}
        <div className="modern-card">
          <div className="modern-card-header">
            <h3 className="modern-card-title">🔍 Busca e Filtros</h3>
          </div>
          <div className="modern-form-grid">
            <div className="modern-form-group">
              <label>Buscar</label>
              <input
                type="text"
                placeholder="🔍 Buscar por cliente, equipamento ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-form-group input"
              />
            </div>
            <div className="modern-form-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="modern-form-group select"
              >
                <option value="all">Todos os Status</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="pendente">Pendente</option>
                <option value="ap_manutencao">Ap. Manutenção</option>
                <option value="aguardando_orcamento">Aguardando Orçamento</option>
                <option value="ap_vendas">Ap. Vendas</option>
                <option value="finalizado">Finalizado</option>
                <option value="reprovado">Reprovado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Controles de Visualização */}
        <div className="modern-card">
          <div className="modern-card-header">
            <h3 className="modern-card-title">📊 Visualização</h3>
            <div className="view-controls">
              <div className="view-toggle-container">
                <button
                  className={`modern-btn ${viewMode === 'gallery' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
                  onClick={() => setViewMode('gallery')}
                >
                  <span>🖼️</span>
                  Galeria
                </button>
                <button
                  className={`modern-btn ${viewMode === 'list' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
                  onClick={() => setViewMode('list')}
                >
                  <span>📋</span>
                  Lista
                </button>
              </div>
              <div className="results-info">
                <span className="modern-badge">
                  {filteredLaudos.length} laudo{filteredLaudos.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo dos Laudos */}
        <div className="modern-card">
          <div className="modern-card-header">
            <h3 className="modern-card-title">📋 Laudos</h3>
          </div>
          <div className="laudos-content">
            {viewMode === 'gallery' ? (
              <LaudoGallery 
                laudos={filteredLaudos} 
                userInfo={userInfo} 
                onRefresh={fetchLaudos}
                onViewLaudo={onViewLaudo}
                onEditLaudo={onEditLaudo}
              />
            ) : (
              <div className="laudos-list-view">
                {filteredLaudos.length > 0 ? (
                  <div className="modern-table">
                    <div className="table-header">
                      <div className="table-row header-row">
                        <div className="table-cell">ID</div>
                        <div className="table-cell">Cliente</div>
                        <div className="table-cell">Equipamento</div>
                        <div className="table-cell">Status</div>
                        <div className="table-cell">Data</div>
                        <div className="table-cell">Ações</div>
                      </div>
                    </div>
                    <div className="table-body">
                      {filteredLaudos.map(laudo => (
                        <div key={laudo.id} className="table-row">
                          <div className="table-cell">
                            <span className="laudo-id">#{laudo.id}</span>
                          </div>
                          <div className="table-cell">
                            <span className="cliente-name">{laudo.cliente}</span>
                          </div>
                          <div className="table-cell">
                            <span className="equipamento-name">{laudo.equipamento}</span>
                          </div>
                          <div className="table-cell">
                            <span 
                              className="modern-status-badge"
                              style={{ 
                                backgroundColor: getStatusColor(laudo.status),
                                color: 'white'
                              }}
                            >
                              {getStatusLabel(laudo.status)}
                            </span>
                          </div>
                          <div className="table-cell">
                            <span className="date-text">
                              {new Date(laudo.data_criacao || laudo.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="table-cell">
                            <div className="table-actions">
                              <button 
                                className="action-btn view"
                                onClick={() => onViewLaudo && onViewLaudo(laudo.id)}
                                title="Visualizar Laudo"
                              >
                                👁️
                              </button>
                              <button 
                                className="action-btn edit"
                                onClick={() => onEditLaudo && onEditLaudo(laudo.id)}
                                title="Editar Laudo"
                              >
                                ✏️
                              </button>
                              {laudo.status === 'finalizado' && (
                                <button 
                                  className="action-btn pdf"
                                  onClick={() => {
                                    const token = localStorage.getItem('token');
                                    window.open(`/laudos/${laudo.id}/pdf?token=${token}`, '_blank');
                                  }}
                                  title="Baixar PDF"
                                >
                                  📄
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>Nenhum laudo encontrado</h3>
                    <p>Nenhum laudo corresponde aos critérios de busca</p>
                    <button 
                      className="modern-btn modern-btn-primary"
                      onClick={onShowModernForm}
                    >
                      Criar Primeiro Laudo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaudosManager; 