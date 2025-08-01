import React, { useState, useEffect } from 'react';
import api from '../api';
import { StatusBadge, CompletionBadge } from '../utils/statusLabels';
import TagManager from './TagManager';

const LaudosList = ({ isAdmin = false, userType = 'tecnico', onEditLaudo }) => {
  const [laudos, setLaudos] = useState([]);
  const [filteredLaudos, setFilteredLaudos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLaudos();
  }, []);

  useEffect(() => {
    filterLaudos();
  }, [laudos, searchId, searchTerm]);

  const loadLaudos = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.get('/laudos');
      console.log('🎯 Laudos carregados:', response.data);
      setLaudos(response.data);
    } catch (err) {
      console.error('Erro ao carregar laudos:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else {
        setError('Erro ao carregar laudos. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterLaudos = () => {
    let filtered = [...laudos];

    // Filtrar por ID
    if (searchId.trim()) {
      filtered = filtered.filter(laudo => 
        laudo.id.toString().includes(searchId.trim())
      );
    }

    // Filtrar por termo de busca (cliente, equipamento, etc.)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(laudo => 
        (laudo.cliente && laudo.cliente.toLowerCase().includes(term)) ||
        (laudo.equipamento && laudo.equipamento.toLowerCase().includes(term)) ||
        (laudo.diagnostico && laudo.diagnostico.toLowerCase().includes(term)) ||
        (laudo.user_name && laudo.user_name.toLowerCase().includes(term))
      );
    }

    setFilteredLaudos(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    loadLaudos();
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
        const userType = localStorage.getItem('userType') || 'tecnico';
        const message = err.response?.data?.detail || '';
        
        if (userType === 'vendedor' && message.includes('aprovados')) {
          alert('⚠️ Vendedores só podem baixar laudos aprovados.');
        } else if (userType === 'admin') {
          alert('📄 Processando download...');
        } else {
          alert('⚠️ Erro de permissão: ' + message);
        }
      } else if (err.response?.status === 404) {
        alert('❌ Laudo não encontrado.');
      } else {
        alert('❌ Erro ao baixar PDF: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleEditLaudo = (laudo) => {
    // Notificar o componente pai para carregar o laudo para edição
    if (typeof onEditLaudo === 'function') {
      onEditLaudo(laudo);
    } else {
      // Fallback: redirecionar para formulário com dados do laudo
      alert('Função de edição será implementada em breve');
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
        <p>Carregando laudos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        background: 'var(--error-color)',
        color: 'white',
        borderRadius: '10px',
        marginBottom: '1rem'
      }}>
        <p>❌ {error}</p>
        <button
          onClick={handleRefresh}
          style={{
            background: 'white',
            color: 'var(--error-color)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="laudos-list">
      {/* Header com controles */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ color: 'var(--moura-blue)', margin: 0 }}>
          📋 {isAdmin ? 'Todos os Laudos' : userType === 'vendedor' ? 'Laudos Aprovados' : 'Meus Laudos'} ({filteredLaudos.length})
        </h2>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Busca por ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>ID:</label>
            <input
              type="text"
              placeholder="Buscar por ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                width: '120px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Busca geral */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Buscar:</label>
            <input
              type="text"
              placeholder="Cliente, equipamento, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                width: '200px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Botões de ação */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={clearSearch}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--warning-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🗑️ Limpar
            </button>
            <button
              onClick={handleRefresh}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--moura-blue)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de laudos */}
      {filteredLaudos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)',
          fontSize: '1.1rem'
        }}>
          {searchId || searchTerm ? 'Nenhum laudo encontrado com os filtros aplicados.' : 'Nenhum laudo encontrado.'}
        </div>
      ) : (
        filteredLaudos.map((laudo) => (
          <div key={laudo.id} className="laudo-item">
            <div className="laudo-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div className="laudo-title">
                  #{laudo.id} - {laudo.cliente || 'Cliente não informado'}
                </div>
                {/* Status e Completion Badges */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <StatusBadge status={laudo.status || 'pendente'} />
                  {laudo.status !== 'aprovado' && laudo.status !== 'reprovado' && (
                    <CompletionBadge laudo={laudo} />
                  )}
                </div>
              </div>
              <div className="laudo-date">
                {formatDate(laudo.created_at)}
              </div>
            </div>
            
            <div className="laudo-details">
              <div className="laudo-detail">
                <div className="laudo-detail-label">Equipamento</div>
                <div className="laudo-detail-value">
                  {laudo.equipamento || 'Não informado'}
                </div>
              </div>
              
              <div className="laudo-detail">
                <div className="laudo-detail-label">Diagnóstico</div>
                <div className="laudo-detail-value">
                  {laudo.diagnostico || 'Não informado'}
                </div>
              </div>
              
              <div className="laudo-detail">
                <div className="laudo-detail-label">Solução</div>
                <div className="laudo-detail-value">
                  {laudo.solucao || 'Não informado'}
                </div>
              </div>
              
              {isAdmin && laudo.user_name && (
                <div className="laudo-detail">
                  <div className="laudo-detail-label">Técnico</div>
                  <div className="laudo-detail-value">
                    {laudo.user_name}
                  </div>
                </div>
              )}
            </div>
            
            {/* Ações do Laudo */}
            <div className="laudo-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Botão Editar - para laudos em andamento ou pendentes */}
              {(() => {
                const userType = localStorage.getItem('userType') || 'tecnico';
                const isAdmin = localStorage.getItem('isAdmin') === 'true';
                const currentUserId = localStorage.getItem('userId');
                
                // Só mostra editar para o próprio técnico ou admin, e se não estiver aprovado
                const canEdit = (isAdmin || laudo.user_id?.toString() === currentUserId) && 
                               (laudo.status === 'em_andamento' || laudo.status === 'pendente');
                
                return canEdit;
              })() && (
                <button 
                  className="action-btn edit"
                  onClick={() => handleEditLaudo(laudo)}
                  style={{
                    background: 'var(--warning-color)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ✏️ Editar
                </button>
              )}

              {/* Gerenciador de Tags */}
              <TagManager 
                laudoId={laudo.id}
                currentTag={laudo.tag}
                onTagUpdate={(data) => {
                  // Atualizar o laudo na lista após adicionar tag
                  setLaudos(prevLaudos => 
                    prevLaudos.map(l => 
                      l.id === laudo.id 
                        ? { ...l, tag: data.tag, tag_description: data.description }
                        : l
                    )
                  );
                }}
              />

              {/* Botão Download PDF */}
              {(() => {
                const userType = localStorage.getItem('userType') || 'tecnico';
                const isAdmin = localStorage.getItem('isAdmin') === 'true';
                
                // Admin e técnico podem baixar aprovados e pendentes
                if (isAdmin || userType === 'tecnico') {
                  return laudo.status === 'aprovado' || laudo.status === 'pendente' || laudo.status === 'em_andamento';
                }
                // Vendedor só pode baixar aprovados
                else if (userType === 'vendedor') {
                  return laudo.status === 'aprovado';
                }
                return false;
              })() ? (
                <button 
                  className="action-btn pdf"
                  onClick={() => handleDownloadPDF(laudo.id)}
                  style={{
                    background: 'var(--moura-blue)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  📄 Baixar PDF
                </button>
              ) : (
                <span style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}>
                  ⏳ PDF disponível após aprovação
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LaudosList; 