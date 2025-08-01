import React, { useState, useEffect } from 'react';
import UpdatesPanel from './UpdatesPanel';

const Dashboard = ({ userInfo }) => {
  const [stats, setStats] = useState({
    totalLaudos: 0,
    laudosHoje: 0,
    laudosSemana: 0,
    laudosMes: 0,
    pendentesAprovacao: 0,
    aprovados: 0,
    reprovados: 0,
    finalizados: 0
  });

  const [recentLaudos, setRecentLaudos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Verificar se o usuário é administrador
  const isAdmin = userInfo?.role === 'admin' || userInfo?.is_admin === true;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Buscar laudos para calcular estatísticas
      const laudosResponse = await fetch('/laudos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (laudosResponse.ok) {
        const laudosData = await laudosResponse.json();
        
        // ✅ Filtrar laudos baseado no perfil do usuário
        let filteredLaudos = laudosData;
        if (!isAdmin) {
          // Técnicos só veem seus próprios laudos
          filteredLaudos = laudosData.filter(laudo => 
            laudo.user_id === userInfo?.id || laudo.user_name === userInfo?.username
          );
        }
        
        setRecentLaudos(filteredLaudos.slice(0, 5));
        
        // ✅ Calcular estatísticas dos laudos filtrados
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const calculatedStats = {
          totalLaudos: filteredLaudos.length,
          laudosHoje: filteredLaudos.filter(l => l.created_at?.startsWith(today)).length,
          laudosSemana: filteredLaudos.filter(l => l.created_at >= weekAgo).length,
          laudosMes: filteredLaudos.filter(l => l.created_at >= monthAgo).length,
          pendentesAprovacao: filteredLaudos.filter(l => l.status === 'em_andamento').length,
          aprovados: filteredLaudos.filter(l => ['aprovado_manutencao', 'aprovado_vendas'].includes(l.status)).length,
          reprovados: filteredLaudos.filter(l => l.status === 'reprovado').length,
          finalizados: filteredLaudos.filter(l => l.status === 'finalizado').length
        };
        
        setStats(calculatedStats);
      }
    } catch (error) {
      console.log('Erro ao buscar dados do dashboard:', error.message);
      // Usar dados padrão em caso de erro
      setStats({
        totalLaudos: 0,
        laudosHoje: 0,
        laudosSemana: 0,
        laudosMes: 0,
        pendentesAprovacao: 0,
        aprovados: 0,
        reprovados: 0,
        finalizados: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
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

  // ✅ Função para navegar para laudos
  const handleViewAllLaudos = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-laudos'));
  };

  // ✅ Função para visualizar laudo
  const handleViewLaudo = (laudoId) => {
    window.dispatchEvent(new CustomEvent('view-laudo', { detail: { laudoId } }));
  };

  // ✅ Função para editar laudo
  const handleEditLaudo = (laudoId) => {
    window.dispatchEvent(new CustomEvent('edit-laudo', { detail: { laudoId } }));
  };

  // ✅ Função para gerar PDF
  const handleGeneratePDF = (laudoId) => {
    const token = localStorage.getItem('token');
    window.open(`/laudos/${laudoId}/pdf?token=${token}`, '_blank');
  };

  // ✅ Ações rápidas funcionais
  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-simple':
        window.dispatchEvent(new CustomEvent('show-modern-form'));
        break;
      case 'new-advanced':
        window.dispatchEvent(new CustomEvent('show-advanced-form'));
        break;
      case 'voice-recorder':
        window.dispatchEvent(new CustomEvent('show-voice-recorder'));
        break;
      case 'reports':
        window.dispatchEvent(new CustomEvent('navigate-to-reports'));
        break;
      default:
        break;
    }
  };

  return (
    <div className="modern-container dashboard-blurred">
      <div className="modern-header dashboard-header">
        <div className="modern-header-content">
          <h2>🎯 Dashboard RSM</h2>
          <p>{getGreeting()}, {userInfo?.username || 'Usuário'}! Bem-vindo ao sistema de gestão de laudos técnicos</p>
        </div>
      </div>

      <div className="modern-content">
        {/* Estatísticas Principais */}
        <div className="modern-card dashboard-stats-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">📊</span>
              <h3>Estatísticas Gerais</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="stats-grid">
              <div className="stat-item dashboard-stat">
                <div className="stat-number">{stats.totalLaudos}</div>
                <div className="stat-label">Total de Laudos</div>
              </div>
              <div className="stat-item dashboard-stat">
                <div className="stat-number">{stats.laudosHoje}</div>
                <div className="stat-label">Laudos Hoje</div>
              </div>
              <div className="stat-item dashboard-stat">
                <div className="stat-number">{stats.laudosSemana}</div>
                <div className="stat-label">Esta Semana</div>
              </div>
              <div className="stat-item dashboard-stat">
                <div className="stat-number">{stats.laudosMes}</div>
                <div className="stat-label">Este Mês</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status dos Laudos */}
        <div className="modern-card dashboard-status-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">📋</span>
              <h3>Status dos Laudos</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="status-grid">
              <div className="status-item dashboard-status">
                <div className="status-icon">⏳</div>
                <div className="status-info">
                  <div className="status-number">{stats.pendentesAprovacao}</div>
                  <div className="status-label">Pendentes</div>
                </div>
              </div>
              <div className="status-item dashboard-status">
                <div className="status-icon">✅</div>
                <div className="status-info">
                  <div className="status-number">{stats.aprovados}</div>
                  <div className="status-label">Aprovados</div>
                </div>
              </div>
              <div className="status-item dashboard-status">
                <div className="status-icon">❌</div>
                <div className="status-info">
                  <div className="status-number">{stats.reprovados}</div>
                  <div className="status-label">Reprovados</div>
                </div>
              </div>
              <div className="status-item dashboard-status">
                <div className="status-icon">🏁</div>
                <div className="status-info">
                  <div className="status-number">{stats.finalizados}</div>
                  <div className="status-label">Finalizados</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Laudos Recentes */}
        <div className="modern-card dashboard-recent-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">🕒</span>
              <h3>Laudos Recentes</h3>
            </div>
            <button className="view-all-btn" onClick={handleViewAllLaudos}>
              Ver Todos →
            </button>
          </div>
          <div className="modern-card-content">
            {recentLaudos.length > 0 ? (
              <div className="recent-laudos-grid">
                {recentLaudos.map(laudo => (
                  <div key={laudo.id} className="recent-laudo-card dashboard-laudo">
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
                      <p className="laudo-equipment">{laudo.equipamento}</p>
                      <p className="laudo-date">
                        {new Date(laudo.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="laudo-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewLaudo(laudo.id)}
                        title="Visualizar Laudo"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditLaudo(laudo.id)}
                        title="Editar Laudo"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn pdf"
                        onClick={() => handleGeneratePDF(laudo.id)}
                        title="Gerar PDF"
                      >
                        📄
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Nenhum laudo encontrado</h3>
                <p>Comece criando seu primeiro laudo técnico.</p>
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="modern-card dashboard-actions-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">⚡</span>
              <h3>Ações Rápidas</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="quick-actions-grid">
              <button 
                className="quick-action-btn new-simple"
                onClick={() => handleQuickAction('new-simple')}
              >
                <div className="quick-action-icon">📝</div>
                <h3>Novo Laudo</h3>
                <p>Criar laudo técnico básico</p>
              </button>
              
              <button 
                className="quick-action-btn new-advanced"
                onClick={() => handleQuickAction('new-advanced')}
              >
                <div className="quick-action-icon">🔧</div>
                <h3>Laudo Avançado</h3>
                <p>Formulário completo com detalhes</p>
              </button>
              
              <button 
                className="quick-action-btn voice-recorder"
                onClick={() => handleQuickAction('voice-recorder')}
              >
                <div className="quick-action-icon">🎤</div>
                <h3>Gravação de Voz</h3>
                <p>Laudo por gravação de áudio</p>
              </button>
              
              <button 
                className="quick-action-btn reports"
                onClick={() => handleQuickAction('reports')}
              >
                <div className="quick-action-icon">📊</div>
                <h3>Relatórios</h3>
                <p>Visualizar métricas e análises</p>
              </button>
            </div>
          </div>
        </div>

        {/* Painel de Atualizações */}
        <UpdatesPanel userInfo={userInfo} />
      </div>
    </div>
  );
};

export default Dashboard; 