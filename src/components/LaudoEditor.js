import React, { useState, useEffect } from 'react';

const LaudoEditor = ({ laudoId, onClose, onSave }) => {
  const [laudo, setLaudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'diagnostico', 'tecnico'

  useEffect(() => {
    if (laudoId) {
      fetchLaudo();
    }
  }, [laudoId]);

  const fetchLaudo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/laudos/${laudoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLaudo(data);
      } else {
        setError('Erro ao carregar laudo. Verifique se o laudo existe.');
      }
    } catch (err) {
      console.error('Erro ao buscar laudo:', err);
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLaudo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/laudos/${laudoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(laudo)
      });

      if (response.ok) {
        if (onSave) onSave();
        onClose();
      } else {
        const errorData = await response.json();
        setError('Erro ao salvar alterações: ' + (errorData.detail || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('Erro ao salvar laudo:', err);
      setError('Erro de conexão ao salvar. Verifique sua internet.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'pendente': '#2196F3',
      'em_andamento': '#FF9800',
      'aprovado_manutencao': '#4CAF50',
      'aprovado_vendas': '#9C27B0',
      'finalizado': '#4CAF50',
      'reprovado': '#F44336'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'aprovado_manutencao': 'Aprovado Manutenção',
      'aprovado_vendas': 'Aprovado Vendas',
      'finalizado': 'Finalizado',
      'reprovado': 'Reprovado'
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <div className="laudo-editor-overlay">
        <div className="laudo-editor-modal">
          <div className="editor-loading">
            <div className="loading-spinner-large"></div>
            <p>Carregando editor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !laudo) {
    return (
      <div className="laudo-editor-overlay">
        <div className="laudo-editor-modal">
          <div className="editor-error">
            <div className="error-icon">⚠️</div>
            <h3>Erro no Editor</h3>
            <p>{error}</p>
            <button className="btn-close-error" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!laudo) return null;

  return (
    <div className="laudo-editor-overlay">
      <div className="laudo-editor-modal">
        {/* Header do editor */}
        <div className="editor-header">
          <div className="header-info">
            <h2>✏️ Editar Laudo #{laudo.id}</h2>
            <div className="header-meta">
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: getStatusColor(laudo.status),
                  color: 'white'
                }}
              >
                {getStatusLabel(laudo.status)}
              </span>
              <span className="client-info">👤 {laudo.cliente || 'Cliente não informado'}</span>
              <span className="date-info">
                📅 {new Date(laudo.created_at || laudo.data_criacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="header-actions">
            <button 
              className="btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
            </button>
            <button className="btn-close" onClick={onClose}>
              ✖️ Fechar
            </button>
          </div>
        </div>

        {/* Navegação por abas */}
        <div className="editor-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            📋 Informações
          </button>
          <button 
            className={`tab-btn ${activeTab === 'diagnostico' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagnostico')}
          >
            🔍 Diagnóstico
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tecnico' ? 'active' : ''}`}
            onClick={() => setActiveTab('tecnico')}
          >
            👨‍💼 Técnico
          </button>
        </div>

        {/* Conteúdo do editor */}
        <div className="editor-content">
          {activeTab === 'info' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>📋 Informações do Cliente</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Cliente:</label>
                    <input
                      type="text"
                      value={laudo.cliente || ''}
                      onChange={(e) => handleInputChange('cliente', e.target.value)}
                      className="form-input"
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="form-group">
                    <label>Equipamento:</label>
                    <input
                      type="text"
                      value={laudo.equipamento || ''}
                      onChange={(e) => handleInputChange('equipamento', e.target.value)}
                      className="form-input"
                      placeholder="Tipo/modelo do equipamento"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnostico' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>🔍 Diagnóstico</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Descrição do Diagnóstico:</label>
                    <textarea
                      value={laudo.diagnostico || ''}
                      onChange={(e) => handleInputChange('diagnostico', e.target.value)}
                      className="form-textarea"
                      placeholder="Descreva o diagnóstico encontrado..."
                      rows={6}
                      style={{
                        maxWidth: '100%',
                        minHeight: '120px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>🛠️ Solução</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Descrição da Solução:</label>
                    <textarea
                      value={laudo.solucao || ''}
                      onChange={(e) => handleInputChange('solucao', e.target.value)}
                      className="form-textarea"
                      placeholder="Descreva a solução aplicada..."
                      rows={6}
                      style={{
                        maxWidth: '100%',
                        minHeight: '120px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>📝 Observações Adicionais</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Observações:</label>
                    <textarea
                      value={laudo.observacoes || ''}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      className="form-textarea"
                      placeholder="Observações adicionais sobre o laudo..."
                      rows={4}
                      style={{
                        maxWidth: '100%',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tecnico' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>👨‍💼 Informações Técnicas</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Status:</label>
                    <select
                      value={laudo.status || 'pendente'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="form-select"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="aprovado_manutencao">Aprovado Manutenção</option>
                      <option value="aprovado_vendas">Aprovado Vendas</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="reprovado">Reprovado</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Técnico Responsável:</label>
                    <input
                      type="text"
                      value={laudo.user_name || laudo.tecnico || ''}
                      onChange={(e) => handleInputChange('user_name', e.target.value)}
                      className="form-input"
                      placeholder="Nome do técnico"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer do editor */}
        <div className="editor-footer">
          <div className="footer-info">
            <small>
              Criado em: {new Date(laudo.created_at || laudo.data_criacao).toLocaleString('pt-BR')} | 
              Última atualização: {new Date(laudo.updated_at || laudo.created_at || laudo.data_criacao).toLocaleString('pt-BR')}
            </small>
          </div>
          <div className="footer-actions">
            <button 
              className="btn-save-footer"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaudoEditor; 