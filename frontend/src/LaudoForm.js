import React, { useRef, useEffect } from 'react';

function LaudoForm({ data, onChange, onSave, isLoading }) {
  const formRef = useRef(null);
  const clienteRef = useRef(null);
  const equipamentoRef = useRef(null);
  const diagnosticoRef = useRef(null);
  const solucaoRef = useRef(null);

  // Scroll automático para campos sendo preenchidos
  useEffect(() => {
    const scrollToActiveField = () => {
      let activeField = null;
      
      if (data.cliente && !data.equipamento) {
        activeField = equipamentoRef.current;
      } else if (data.equipamento && !data.diagnostico) {
        activeField = diagnosticoRef.current;
      } else if (data.diagnostico && !data.solucao) {
        activeField = solucaoRef.current;
      }
      
      if (activeField) {
        activeField.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        activeField.focus();
      }
    };

    // Aguarda um pouco para a animação de scroll
    const timeout = setTimeout(scrollToActiveField, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (typeof onChange === 'function') {
      onChange({ ...data, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === 'function') {
      onSave();
    }
  };

  const getFieldStyle = (fieldName) => {
    const baseStyle = {
      transition: 'all 0.3s ease',
      border: '2px solid var(--border-color)',
      borderRadius: '10px',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      width: '100%',
      background: 'var(--background-primary)'
    };

    // Destaca campos sendo preenchidos
    if (data[fieldName] && data[fieldName].trim() !== '') {
      return {
        ...baseStyle,
        borderColor: 'var(--moura-blue)',
        boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)',
        background: 'var(--moura-white)'
      };
    }

    return baseStyle;
  };

  const getLabelStyle = (fieldName) => {
    const baseStyle = {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    };

    // Destaca labels de campos sendo preenchidos
    if (data[fieldName] && data[fieldName].trim() !== '') {
      return {
        ...baseStyle,
        color: 'var(--moura-blue)',
        fontWeight: '700'
      };
    }

    return {
      ...baseStyle,
      color: 'var(--text-primary)'
    };
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="laudo-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cliente" style={getLabelStyle('cliente')}>
            Cliente
          </label>
          <input
            ref={clienteRef}
            id="cliente"
            type="text"
            name="cliente"
            style={getFieldStyle('cliente')}
            value={data.cliente || ''}
            onChange={handleChange}
            placeholder="Nome do cliente"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="equipamento" style={getLabelStyle('equipamento')}>
            Equipamento
          </label>
          <input
            ref={equipamentoRef}
            id="equipamento"
            type="text"
            name="equipamento"
            style={getFieldStyle('equipamento')}
            value={data.equipamento || ''}
            onChange={handleChange}
            placeholder="Tipo/modelo do equipamento"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="diagnostico" style={getLabelStyle('diagnostico')}>
          Diagnóstico
        </label>
        <textarea
          ref={diagnosticoRef}
          id="diagnostico"
          name="diagnostico"
          style={{
            ...getFieldStyle('diagnostico'),
            minHeight: '120px',
            resize: 'vertical'
          }}
          value={data.diagnostico || ''}
          onChange={handleChange}
          placeholder="Descreva o problema identificado no equipamento..."
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="solucao" style={getLabelStyle('solucao')}>
          Solução Aplicada
        </label>
        <textarea
          ref={solucaoRef}
          id="solucao"
          name="solucao"
          style={{
            ...getFieldStyle('solucao'),
            minHeight: '120px',
            resize: 'vertical'
          }}
          value={data.solucao || ''}
          onChange={handleChange}
          placeholder="Descreva a solução aplicada para resolver o problema..."
          disabled={isLoading}
          required
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        marginTop: '2rem'
      }}>
        <button
          type="button"
          onClick={() => onChange({})}
          disabled={isLoading}
          style={{
            background: 'var(--warning-color)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow)',
            fontSize: '1rem'
          }}
        >
          🗑️ Limpar
        </button>

        <button 
          type="submit" 
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Salvando...
            </>
          ) : (
            '💾 Salvar Laudo'
          )}
        </button>
      </div>

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