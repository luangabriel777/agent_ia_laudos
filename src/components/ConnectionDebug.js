import React, { useState, useEffect } from 'react';
import api from '../api';
import config from '../config';

const ConnectionDebug = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState({});

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      
      // Teste básico de conectividade
      const response = await api.get('/health', { timeout: 5000 });
      
      setStatus('connected');
      setDetails({
        status: response.status,
        data: response.data,
        url: config.API_BASE_URL,
        environment: process.env.NODE_ENV
      });
    } catch (error) {
      setStatus('error');
      setDetails({
        error: error.message,
        url: config.API_BASE_URL,
        environment: process.env.NODE_ENV,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Só mostra em desenvolvimento
  }

  return (
    <div className="connection-debug" style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: status === 'connected' ? '#4CAF50' : status === 'error' ? '#f44336' : '#ff9800',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🔌 Status da Conexão: {status === 'connected' ? '✅ Conectado' : status === 'error' ? '❌ Erro' : '⏳ Verificando...'}
      </div>
      
      {status === 'error' && (
        <div style={{ fontSize: '10px' }}>
          <div>URL: {details.url || 'Não configurada'}</div>
          <div>Erro: {details.error}</div>
          {details.status && <div>Status: {details.status}</div>}
          <button 
            onClick={checkConnection}
            style={{
              background: 'white',
              color: '#f44336',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '3px',
              marginTop: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Testar Novamente
          </button>
        </div>
      )}
      
      {status === 'connected' && (
        <div style={{ fontSize: '10px' }}>
          <div>URL: {details.url}</div>
          <div>Status: {details.status}</div>
        </div>
      )}
    </div>
  );
};

export default ConnectionDebug; 