import React, { useState, useEffect } from 'react';

const LaudoViewer = ({ laudoId, onClose }) => {
  const [laudo, setLaudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' ou 'details'

  useEffect(() => {
    if (laudoId) {
      fetchLaudo();
      generatePdfUrl();
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

  const generatePdfUrl = () => {
    const token = localStorage.getItem('token');
    setPdfUrl(`/laudos/${laudoId}/pdf?token=${token}`);
  };

  // ✅ CORREÇÃO: Implementar função de impressão funcional
  const handlePrint = () => {
    try {
      if (viewMode === 'pdf') {
        // Para PDF, abrir em nova janela para impressão
        const token = localStorage.getItem('token');
        const printWindow = window.open(`/laudos/${laudoId}/pdf?token=${token}&print=true`, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        // Para detalhes, imprimir a página atual
        window.print();
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert('Erro ao abrir impressão. Tente novamente.');
    }
  };

  // ✅ CORREÇÃO: Implementar função de download PDF funcional
  const handleDownloadPDF = () => {
    try {
      const token = localStorage.getItem('token');
      const downloadUrl = `/laudos/${laudoId}/pdf?token=${token}&download=true`;
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `laudo-${laudoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao baixar PDF. Tente novamente.');
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
      <div className="laudo-viewer-overlay">
        <div className="laudo-viewer-modal">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Carregando laudo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="laudo-viewer-overlay">
        <div className="laudo-viewer-modal">
          <div className="error-message">
            <h3>❌ Erro ao carregar laudo</h3>
            <p>{error}</p>
            <button onClick={onClose} className="btn btn-primary">
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="laudo-viewer-overlay">
      <div className="laudo-viewer-modal">
        <div className="laudo-viewer-header">
          <div className="header-info">
            <h2>Laudo #{laudo.id}</h2>
            <div className="status-badge" style={{ backgroundColor: getStatusColor(laudo.status) }}>
                {getStatusLabel(laudo.status)}
            </div>
          </div>

          <div className="header-actions">
              <button 
                className={`view-mode-btn ${viewMode === 'pdf' ? 'active' : ''}`}
                onClick={() => setViewMode('pdf')}
              >
                📄 PDF
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'details' ? 'active' : ''}`}
                onClick={() => setViewMode('details')}
              >
                📋 Detalhes
              </button>
            <button onClick={handleDownloadPDF} className="btn btn-secondary">
                💾 Baixar PDF
              </button>
            <button onClick={handlePrint} className="btn btn-secondary">
                🖨️ Imprimir
              </button>
            <button onClick={onClose} className="btn btn-close">
              ✕
              </button>
          </div>
        </div>

        <div className="laudo-viewer-content">
          {viewMode === 'pdf' ? (
            <div className="pdf-container">
              {/* ✅ CORREÇÃO: Melhorar iframe para exibir o PDF HTML */}
              <iframe
                src={pdfUrl}
                title={`Laudo ${laudo.id}`}
                className="pdf-iframe"
                frameBorder="0"
                onLoad={() => console.log('PDF carregado com sucesso')}
                onError={(e) => {
                  console.error('Erro ao carregar PDF:', e);
                  setError('Erro ao carregar visualização do PDF');
                }}
              />
            </div>
          ) : (
            <div className="details-container">
              <div className="laudo-details">
                <div className="detail-section">
                  <h3>Informações Gerais</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Cliente:</label>
                      <span>{laudo.cliente || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Equipamento:</label>
                      <span>{laudo.equipamento || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Técnico:</label>
                      <span>{laudo.user_name || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Data de Criação:</label>
                      <span>{new Date(laudo.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Problema Relatado</h3>
                  <p>{laudo.problema_relatado || 'Não informado'}</p>
                </div>

                <div className="detail-section">
                  <h3>Diagnóstico Técnico</h3>
                  <p>{laudo.diagnostico || 'Não informado'}</p>
                </div>

                <div className="detail-section">
                  <h3>Solução Aplicada</h3>
                  <p>{laudo.solucao || 'Não informado'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaudoViewer; 