import React from 'react';
import api from '../api';

function LaudoForm({ data, onChange, onSave, isLoading, currentLaudoId, onLaudoSaved }) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [highlightedFields, setHighlightedFields] = React.useState({});

  // Efeito para destacar campos quando são preenchidos
  React.useEffect(() => {
    const newHighlights = {};
    
    if (data.cliente && data.cliente.trim()) {
      newHighlights.cliente = true;
      setTimeout(() => setHighlightedFields(prev => ({ ...prev, cliente: false })), 2000);
    }
    
    if (data.equipamento && data.equipamento.trim()) {
      newHighlights.equipamento = true;
      setTimeout(() => setHighlightedFields(prev => ({ ...prev, equipamento: false })), 2000);
    }
    
    if (data.diagnostico && data.diagnostico.trim()) {
      newHighlights.diagnostico = true;
      setTimeout(() => setHighlightedFields(prev => ({ ...prev, diagnostico: false })), 2000);
    }
    
    if (data.solucao && data.solucao.trim()) {
      newHighlights.solucao = true;
      setTimeout(() => setHighlightedFields(prev => ({ ...prev, solucao: false })), 2000);
    }
    
    setHighlightedFields(prev => ({ ...prev, ...newHighlights }));
  }, [data.cliente, data.equipamento, data.diagnostico, data.solucao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (typeof onChange === 'function') {
      onChange({ ...data, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  const handleSave = async () => {
    // Verificar campos obrigatórios
    const requiredFields = ['cliente', 'equipamento', 'diagnostico', 'solucao'];
    const missingFields = requiredFields.filter(field => !data[field] || !data[field].trim());
    
    if (missingFields.length > 0) {
      const missingFieldsText = missingFields.map(field => {
        const fieldNames = {
          cliente: 'Cliente',
          equipamento: 'Equipamento', 
          diagnostico: 'Diagnóstico',
          solucao: 'Solução'
        };
        return fieldNames[field];
      }).join(', ');
      
      const shouldContinue = window.confirm(
        `⚠️ Os seguintes campos estão incompletos: ${missingFieldsText}\n\n` +
        'Deseja salvar mesmo assim como "Em Andamento"?\n\n' +
        'Laudos incompletos podem ser editados posteriormente.'
      );
      
      if (!shouldContinue) {
        return;
      }
    }

    setIsSaving(true);
    try {
      let response;
      if (currentLaudoId) {
        // Editando laudo existente
        response = await api.put(`/laudos/${currentLaudoId}`, data);
        setMessage('✅ Laudo atualizado com sucesso!');
      } else {
        // Criando novo laudo
        response = await api.post('/laudos', data);
        setMessage('✅ Laudo salvo com sucesso!');
      }
      
      // Notificar o componente pai sobre o ID do laudo salvo
      if (onLaudoSaved) {
        onLaudoSaved(response.data.id);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erro ao salvar laudo: ' + err.message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndPDF = async () => {
    // Verificar campos obrigatórios
    const requiredFields = ['cliente', 'equipamento', 'diagnostico', 'solucao'];
    const missingFields = requiredFields.filter(field => !data[field] || !data[field].trim());
    
    if (missingFields.length > 0) {
      const missingFieldsText = missingFields.map(field => {
        const fieldNames = {
          cliente: 'Cliente',
          equipamento: 'Equipamento', 
          diagnostico: 'Diagnóstico',
          solucao: 'Solução'
        };
        return fieldNames[field];
      }).join(', ');
      
      const shouldContinue = window.confirm(
        `⚠️ Os seguintes campos estão incompletos: ${missingFieldsText}\n\n` +
        'Deseja salvar mesmo assim como "Em Andamento"?\n\n' +
        'Laudos incompletos podem ser editados posteriormente.'
      );
      
      if (!shouldContinue) {
        return;
      }
    }

    setIsSaving(true);
    try {
      // Sempre salvar primeiro para garantir que temos o ID mais recente
      let response;
      if (currentLaudoId) {
        // Editando laudo existente
        response = await api.put(`/laudos/${currentLaudoId}`, data);
      } else {
        // Criando novo laudo
        response = await api.post('/laudos', data);
      }
      const laudoId = response.data.id;
      
      // Notificar o componente pai
      if (onLaudoSaved) {
        onLaudoSaved(laudoId);
      }
      
      setMessage('✅ Laudo salvo! Gerando PDF...');
      
      // Baixar o PDF imediatamente após salvar
      await downloadPDF(laudoId);
      
    } catch (err) {
      setMessage('❌ Erro ao salvar laudo: ' + err.message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async (laudoId) => {
    if (!laudoId) {
      setMessage('⚠️ Salve o laudo primeiro!');
      return;
    }

    setIsGeneratingPDF(true);
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
      
      setMessage('📄 PDF baixado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (err.response?.status === 403) {
        const userType = localStorage.getItem('userType') || 'tecnico';
        if (userType === 'admin') {
          setMessage('📄 PDF disponível! Administradores podem baixar qualquer laudo.');
        } else {
          setMessage('⚠️ Este laudo precisa ser aprovado antes do download. Entre em contato com o administrador.');
        }
      } else if (err.response?.status === 404) {
        setMessage('❌ Laudo não encontrado. Salve o laudo primeiro.');
      } else {
        setMessage('❌ Erro ao gerar PDF: ' + (err.response?.data?.detail || err.message));
      }
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="laudo-form">
      {/* Indicador de Edição */}
      {currentLaudoId && (
        <div style={{
          background: 'var(--warning-color)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✏️</span>
          <strong>Editando Laudo #{currentLaudoId}</strong>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cliente" className="form-label">
            Cliente
          </label>
          <input
            id="cliente"
            type="text"
            name="cliente"
            className={`form-input ${highlightedFields.cliente ? 'field-highlight' : ''}`}
            value={data.cliente || ''}
            onChange={handleChange}
            placeholder="Nome do cliente"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="equipamento" className="form-label">
            Equipamento
        </label>
          <input
            id="equipamento"
            type="text"
            name="equipamento"
            className={`form-input ${highlightedFields.equipamento ? 'field-highlight' : ''}`}
            value={data.equipamento || ''}
            onChange={handleChange}
            placeholder="Tipo/modelo do equipamento"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="diagnostico" className="form-label">
          Diagnóstico
        </label>
          <textarea
          id="diagnostico"
            name="diagnostico"
          className={`form-input form-textarea ${highlightedFields.diagnostico ? 'field-highlight' : ''}`}
            value={data.diagnostico || ''}
            onChange={handleChange}
          placeholder="Descreva o problema identificado no equipamento..."
          disabled={isLoading}
          required
          />
      </div>

      <div className="form-group">
        <label htmlFor="solucao" className="form-label">
          Solução Aplicada
        </label>
          <textarea
          id="solucao"
            name="solucao"
          className={`form-input form-textarea ${highlightedFields.solucao ? 'field-highlight' : ''}`}
            value={data.solucao || ''}
            onChange={handleChange}
          placeholder="Descreva a solução aplicada para resolver o problema..."
          disabled={isLoading}
          required
          />
      </div>

      {/* Botões de ação */}
      <div className="form-actions">
        <button 
          type="submit" 
          className="save-btn"
          disabled={isLoading || isSaving}
        >
          {isSaving ? (
            <>
              <span className="loading-spinner"></span>
              {currentLaudoId ? 'Atualizando...' : 'Salvando...'}
            </>
          ) : (
            currentLaudoId ? '💾 Atualizar Laudo' : '💾 Salvar Laudo'
          )}
        </button>

        <button 
          type="button"
          className="pdf-btn"
          onClick={handleSaveAndPDF}
          disabled={isLoading || isSaving || isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <>
              <span className="loading-spinner"></span>
              Gerando PDF...
            </>
          ) : (
            currentLaudoId ? '📄 Atualizar e Baixar PDF' : '📄 Salvar e Baixar PDF'
          )}
        </button>

        <button 
          type="button" 
          className="clear-btn"
          onClick={() => onChange({})}
          disabled={isLoading || isSaving}
        >
          🗑️ Limpar
        </button>
      </div>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`form-message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'warning'}`}>
          {message}
        </div>
      )}

      {/* ID do laudo atual */}
      {currentLaudoId && (
        <div className="laudo-id-info">
          📋 Laudo ID: #{currentLaudoId}
        </div>
      )}

      {/* Preview do Laudo */}
      {(data.cliente || data.equipamento || data.diagnostico || data.solucao) && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'var(--background-primary)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{
            color: 'var(--primary-color)',
            marginBottom: '1rem',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            📋 Preview do Laudo
          </h4>
          
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            {data.cliente && (
              <p><strong>Cliente:</strong> {data.cliente}</p>
            )}
            {data.equipamento && (
              <p><strong>Equipamento:</strong> {data.equipamento}</p>
            )}
            {data.diagnostico && (
              <div>
                <strong>Diagnóstico:</strong>
                <p style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                  {data.diagnostico}
                </p>
              </div>
            )}
            {data.solucao && (
              <div>
                <strong>Solução:</strong>
                <p style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                  {data.solucao}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}

export default LaudoForm;