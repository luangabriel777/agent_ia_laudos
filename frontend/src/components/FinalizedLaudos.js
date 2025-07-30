import React, { useState, useEffect } from 'react';
import api from '../api';

const FinalizedLaudos = ({ userInfo }) => {
  const [laudosFinalizados, setLaudosFinalizados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedLaudo, setSelectedLaudo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Carregar laudos finalizados
  const carregarLaudosFinalizados = async () => {
    try {
      setLoading(true);
      const response = await api.get('/laudos/finalized');
      setLaudosFinalizados(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar laudos finalizados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLaudosFinalizados();
  }, []);

  // Filtrar laudos baseado na busca e filtro
  const filteredLaudos = laudosFinalizados.filter(laudo => {
    const matchesSearch = 
      laudo.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laudo.equipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laudo.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      laudo.id?.toString().includes(searchTerm);

    const matchesFilter = filterStatus === 'todos' || laudo.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Função para visualizar laudo
  const visualizarLaudo = (laudo) => {
    const url = `${window.location.origin}/laudo-viewer/${laudo.id}`;
    window.open(url, '_blank');
  };

  // Função para imprimir laudo
  const imprimirLaudo = (laudo) => {
    const url = `${window.location.origin}/laudo-viewer/${laudo.id}?print=true`;
    window.open(url, '_blank');
  };

  // Função para criar novo laudo baseado no finalizado
  const criarNovoLaudo = (laudo) => {
    setSelectedLaudo(laudo);
    setShowModal(true);
  };

  // Função para confirmar criação de novo laudo
  const confirmarNovoLaudo = async () => {
    try {
      // Criar novo laudo baseado no finalizado
      const novoLaudo = {
        cliente: selectedLaudo.cliente,
        equipamento: selectedLaudo.equipamento,
        modelo: selectedLaudo.modelo,
        serie: selectedLaudo.serie,
        diagnostico: selectedLaudo.diagnostico,
        recomendacoes: selectedLaudo.recomendacoes,
        observacoes: `Laudo baseado no laudo finalizado #${selectedLaudo.id}`,
        status: 'em_andamento'
      };

      await api.post('/laudos', novoLaudo);
      
      // Fechar modal e mostrar mensagem de sucesso
      setShowModal(false);
      setSelectedLaudo(null);
      alert('Novo laudo criado com sucesso!');
      
      // Recarregar laudos finalizados
      carregarLaudosFinalizados();
    } catch (error) {
      console.error('Erro ao criar novo laudo:', error);
      alert('Erro ao criar novo laudo. Tente novamente.');
    }
  };

  // Função para fechar modal
  const fecharModal = () => {
    setShowModal(false);
    setSelectedLaudo(null);
  };

  // Função para formatar data
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'finalizado':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  // Função para obter label do status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'finalizado':
        return 'Finalizado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="finalized-laudos-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando laudos finalizados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-container">
      <div className="modern-header">
        <div className="modern-header-content">
          <h2>✅ Laudos Finalizados</h2>
          <p>Repositório de todos os laudos finalizados do sistema</p>
        </div>
      </div>

      <div className="modern-content">
        {/* Estatísticas */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">📊</span>
              <h3>Estatísticas</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{laudosFinalizados.length}</div>
                <div className="stat-label">Total Finalizados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">🔍</span>
              <h3>Filtros e Busca</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="filters-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar por cliente, equipamento, técnico ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>

              <div className="filter-controls">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="finalizado">Finalizados</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Laudos */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">📋</span>
              <h3>Laudos Finalizados ({filteredLaudos.length})</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="laudos-grid">
              {filteredLaudos.length > 0 ? (
                filteredLaudos.map(laudo => (
                  <div key={laudo.id} className="laudo-card finalized">
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
                      <h4 className="cliente-nome">{laudo.cliente}</h4>
                      <p><strong>Equipamento:</strong> {laudo.equipamento}</p>
                      <p><strong>Modelo:</strong> {laudo.modelo || 'N/A'}</p>
                      <p><strong>Série:</strong> {laudo.serie || 'N/A'}</p>
                      <p><strong>Técnico:</strong> {laudo.user_name}</p>
                      <p><strong>Data:</strong> {formatarData(laudo.created_at)}</p>
                      
                      {laudo.diagnostico && (
                        <div className="diagnostico-preview">
                          <strong>Diagnóstico:</strong>
                          <p>{laudo.diagnostico}</p>
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
                        className="btn-print"
                        onClick={() => imprimirLaudo(laudo)}
                      >
                        🖨️ Imprimir
                      </button>
                      <button 
                        className="btn-copy"
                        onClick={() => criarNovoLaudo(laudo)}
                      >
                        📋 Copiar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>Nenhum laudo finalizado encontrado</h3>
                  <p>Tente ajustar os filtros de busca ou aguarde novos laudos serem finalizados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmar Novo Laudo</h3>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Deseja criar um novo laudo baseado no laudo finalizado #{selectedLaudo?.id}?</p>
              <div className="laudo-preview">
                <h4>Dados que serão copiados:</h4>
                <ul>
                  <li><strong>Cliente:</strong> {selectedLaudo?.cliente}</li>
                  <li><strong>Equipamento:</strong> {selectedLaudo?.equipamento}</li>
                  <li><strong>Modelo:</strong> {selectedLaudo?.modelo || 'N/A'}</li>
                  <li><strong>Série:</strong> {selectedLaudo?.serie || 'N/A'}</li>
                </ul>
              </div>
              <div className="warning-box">
                <p>⚠️ O novo laudo será criado com status "Em Andamento" e você poderá editá-lo conforme necessário.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={confirmarNovoLaudo}>
                ✅ Confirmar Criação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalizedLaudos; 