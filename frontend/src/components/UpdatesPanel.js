import React, { useState, useEffect } from 'react';
import api from '../api';

const UpdatesPanel = ({ userInfo }) => {
  const [recentTags, setRecentTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadRecentTags();
    
    // Auto-refresh a cada 30 segundos se habilitado
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadRecentTags, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadRecentTags = async () => {
    try {
      const response = await api.get('/laudos/tags/recent?limit=10');
      setRecentTags(response.data.tags || []);
    } catch (error) {
      console.error('Erro ao carregar tags recentes:', error);
      // Em caso de erro, definir array vazio para não quebrar o componente
      setRecentTags([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  const getTagColor = (tag) => {
    const colors = {
      'urgente': '#ef4444',
      'crítico': '#dc2626',
      'importante': '#f59e0b',
      'manutenção': '#3b82f6',
      'venda': '#10b981',
      'reparo': '#8b5cf6',
      'preventiva': '#06b6d4',
      'corretiva': '#f97316'
    };
    
    const lowerTag = tag.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (lowerTag.includes(key)) return color;
    }
    
    return '#6b7280'; // cor padrão
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendente': '#f59e0b',
      'em_andamento': '#3b82f6',
      'aprovado': '#10b981',
      'rejeitado': '#ef4444',
      'finalizado': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-3 text-xl">🔄</span>
              Painel de Atualizações
            </h3>
            <div className="flex items-center space-x-2">
              <button 
                className={`p-2 rounded-lg transition-all duration-200 ${
                  autoRefresh 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                onClick={() => setAutoRefresh(!autoRefresh)}
                title={autoRefresh ? 'Auto-refresh ativo' : 'Auto-refresh desativado'}
              >
                {autoRefresh ? '🔄' : '⏸️'}
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
            <span className="text-gray-600">Carregando atualizações...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg lg:text-xl font-semibold text-white flex items-center">
            <span className="mr-3 text-xl">🔄</span>
            Painel de Atualizações
          </h3>
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              onClick={loadRecentTags}
              title="Atualizar agora"
            >
              🔄
            </button>
            <button 
              className={`p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                autoRefresh 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Auto-refresh ativo - Clique para pausar' : 'Auto-refresh pausado - Clique para ativar'}
            >
              {autoRefresh ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 lg:p-8">
        {recentTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-8xl mb-6 opacity-30">🏷️</div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Nenhuma tag recente</h4>
            <p className="text-gray-600 max-w-md text-lg leading-relaxed mb-6">
              As tags adicionadas aos laudos aparecerão aqui para acompanhamento em tempo real
            </p>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 max-w-md">
              <p className="text-sm text-purple-700 font-medium">
                💡 Dica: Adicione tags aos laudos para melhor organização e acompanhamento
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {recentTags.map((tag, index) => (
              <div key={`${tag.laudo_id}-${index}`} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-50 hover:bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: getTagColor(tag.tag) }}
                  >
                    {tag.tag}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {formatTimeAgo(tag.updated_at)}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 text-base mb-2">Laudo #{tag.laudo_id}</h4>
                    <p className="text-sm text-gray-700 font-medium mb-1">{tag.cliente}</p>
                    <p className="text-sm text-gray-600">{tag.equipamento}</p>
                  </div>
                  
                  {tag.description && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800 leading-relaxed">{tag.description}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: getStatusColor(tag.status) }}
                    >
                      {tag.status}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      por {tag.updated_by}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <span className="flex items-center">
              <span className="mr-2 text-lg">🖥️</span>
              Painel otimizado para exibição em TV
            </span>
            <span className="flex items-center">
              <span className="mr-2 text-lg">⏱️</span>
              Atualizações automáticas a cada 30 segundos
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-sm font-medium">
              {autoRefresh ? 'Auto-refresh ativo' : 'Auto-refresh pausado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPanel; 