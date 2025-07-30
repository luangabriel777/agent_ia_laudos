import React, { useState, useEffect } from 'react';

const Reports = ({ userInfo }) => {
  const [reportData, setReportData] = useState({
    laudosTotal: 45,
    laudosFinalizados: 38,
    laudosPendentes: 7,
    defeitosFrequentes: [
      { nome: 'Bateria com baixa voltagem', quantidade: 15 },
      { nome: 'Sulfatação nas placas', quantidade: 12 },
      { nome: 'Densidade baixa do eletrólito', quantidade: 8 },
      { nome: 'Curto-circuito interno', quantidade: 6 },
      { nome: 'Terminais oxidados', quantidade: 4 }
    ],
    produtividadeTecnicos: [
      { nome: 'João Silva', laudos_concluidos: 12, tempo_medio: 2.3, score: 98 },
      { nome: 'Maria Santos', laudos_concluidos: 10, tempo_medio: 2.1, score: 95 },
      { nome: 'Pedro Costa', laudos_concluidos: 8, tempo_medio: 2.8, score: 92 },
      { nome: 'Ana Oliveira', laudos_concluidos: 8, tempo_medio: 2.5, score: 94 }
    ],
    tempoMedioProcesso: 2.4,
    indicadoresQualidade: {
      taxa_aprovacao: 94,
      satisfacao_cliente: 96,
      retrabalho: 3,
      tempo_resposta: 1.8
    },
    tendencias: [
      { periodo: 'Jan', laudos: 32, finalizados: 28 },
      { periodo: 'Fev', laudos: 38, finalizados: 35 },
      { periodo: 'Mar', laudos: 45, finalizados: 42 },
      { periodo: 'Abr', laudos: 42, finalizados: 38 },
      { periodo: 'Mai', laudos: 48, finalizados: 45 }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('mes');
  const [selectedPeriod, setSelectedPeriod] = useState('ultimo_mes');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/admin/reports?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/admin/export-report?format=${format}&period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${selectedPeriod}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      alert('Erro ao exportar relatório: ' + error.message);
    }
  };

  // ✅ CORREÇÃO: Gráfico de Pizza Simples (CSS)
  const renderPieChart = () => {
    const total = reportData.laudosTotal;
    const finalizados = reportData.laudosFinalizados;
    const pendentes = reportData.laudosPendentes;
    
    if (total === 0) return null;
    
    const finalizedPercentage = (finalizados / total) * 100;
    const pendingPercentage = (pendentes / total) * 100;
    
    return (
      <div className="pie-chart">
        <div className="pie-slice finalized" style={{ '--percentage': finalizedPercentage }}></div>
        <div className="pie-slice pending" style={{ '--percentage': pendingPercentage }}></div>
        <div className="pie-center">
          <span className="pie-total">{total}</span>
          <small>Total</small>
        </div>
      </div>
    );
  };

  // ✅ CORREÇÃO: Gráfico de Barras Simples (CSS)
  const renderTrendsChart = () => {
    const maxValue = Math.max(...reportData.tendencias.map(t => t.laudos));
    
    return (
      <div className="trends-chart">
        <div className="chart-bars">
          {reportData.tendencias.map((item, index) => (
            <div key={index} className="chart-bar-group">
              <div className="chart-bars-container">
                <div 
                  className="chart-bar total"
                  style={{ height: `${(item.laudos / maxValue) * 100}%` }}
                  title={`${item.laudos} laudos`}
                >
                  <span className="bar-value">{item.laudos}</span>
                </div>
                <div 
                  className="chart-bar finalized"
                  style={{ height: `${(item.finalizados / maxValue) * 100}%` }}
                  title={`${item.finalizados} finalizados`}
                >
                  <span className="bar-value">{item.finalizados}</span>
                </div>
              </div>
              <div className="chart-label">{item.periodo}</div>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color total"></div>
            <span>Total de Laudos</span>
          </div>
          <div className="legend-item">
            <div className="legend-color finalized"></div>
            <span>Finalizados</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner-large"></div>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="modern-container">
      <div className="modern-header">
        <div className="modern-header-content">
          <h2>📊 Relatórios e Métricas</h2>
          <p>Métricas detalhadas e insights do sistema RSM</p>
        </div>
      </div>

      <div className="modern-content">
        {/* Filtros e Exportação */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">⚙️</span>
              <h3>Controles de Relatório</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="filters-section">
              <div className="filter-controls">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="filter-select"
                >
                  <option value="ultimo_mes">Último Mês</option>
                  <option value="ultima_semana">Última Semana</option>
                  <option value="ultimo_trimestre">Último Trimestre</option>
                  <option value="ano_atual">Ano Atual</option>
                </select>
              </div>
              
              <div className="export-actions">
                <button 
                  className="btn-export pdf"
                  onClick={() => exportReport('pdf')}
                >
                  📄 Exportar PDF
                </button>
                <button 
                  className="btn-export excel"
                  onClick={() => exportReport('excel')}
                >
                  📊 Exportar Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">📈</span>
              <h3>Métricas Principais</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="metrics-overview">
              <div className="metric-card">
                <div className="metric-icon">📋</div>
                <div className="metric-content">
                  <h3>Total de Laudos</h3>
                  <div className="metric-number">{reportData.laudosTotal}</div>
                  <div className="metric-subtitle">Período selecionado</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <h3>Finalizados</h3>
                  <div className="metric-number">{reportData.laudosFinalizados}</div>
                  <div className="metric-subtitle">Laudos concluídos</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">⏳</div>
                <div className="metric-content">
                  <h3>Pendentes</h3>
                  <div className="metric-number">{reportData.laudosPendentes}</div>
                  <div className="metric-subtitle">Aguardando conclusão</div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-content">
                  <h3>Tempo Médio</h3>
                  <div className="metric-number">{reportData.tempoMedioProcesso}h</div>
                  <div className="metric-subtitle">Por laudo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Avançado */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">🎯</span>
              <h3>Dashboard Avançado</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="reports-grid">
              {/* Distribuição de Status */}
              <div className="report-card">
                <div className="card-header">
                  <h3>Distribuição de Status</h3>
                </div>
                <div className="card-content">
                  <div className="status-chart-container">
                    {renderPieChart()}
                    <div className="status-legend">
                      <div className="legend-item">
                        <div className="legend-dot finalized"></div>
                        <span>Finalizados ({reportData.laudosFinalizados})</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot pending"></div>
                        <span>Pendentes ({reportData.laudosPendentes})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Defeitos Mais Frequentes */}
              <div className="report-card">
                <div className="card-header">
                  <h3>Defeitos Mais Frequentes</h3>
                </div>
                <div className="card-content">
                  <div className="defeitos-list">
                    {reportData.defeitosFrequentes.map((defeito, index) => (
                      <div key={index} className="defeito-item">
                        <div className="defeito-rank">#{index + 1}</div>
                        <div className="defeito-info">
                          <div className="defeito-name">{defeito.nome}</div>
                          <div className="defeito-count">{defeito.quantidade} ocorrências</div>
                        </div>
                        <div className="defeito-bar">
                          <div 
                            className="defeito-progress" 
                            style={{ width: `${(defeito.quantidade / 15) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ranking de Técnicos */}
              <div className="report-card">
                <div className="card-header">
                  <h3>Ranking de Técnicos</h3>
                </div>
                <div className="card-content">
                  <div className="tecnicos-ranking">
                    {reportData.produtividadeTecnicos.map((tecnico, index) => (
                      <div key={index} className="tecnico-item">
                        <div className="tecnico-position">#{index + 1}</div>
                        <div className="tecnico-info">
                          <div className="tecnico-avatar">
                            {tecnico.nome.charAt(0)}
                          </div>
                          <div className="tecnico-details">
                            <div className="tecnico-name">{tecnico.nome}</div>
                            <div className="tecnico-stats">
                              {tecnico.laudos_concluidos} laudos • {tecnico.tempo_medio}h médio
                            </div>
                          </div>
                        </div>
                        <div className="tecnico-percentage">
                          {tecnico.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Indicadores de Qualidade */}
              <div className="report-card">
                <div className="card-header">
                  <h3>Indicadores de Qualidade</h3>
                </div>
                <div className="card-content">
                  <div className="quality-metrics">
                    <div className="quality-item">
                      <div className="quality-icon">✅</div>
                      <div className="quality-content">
                        <div className="quality-label">Taxa de Aprovação</div>
                        <div className="quality-value">{reportData.indicadoresQualidade.taxa_aprovacao}%</div>
                        <div className="quality-bar">
                          <div 
                            className="quality-progress approval" 
                            style={{ width: `${reportData.indicadoresQualidade.taxa_aprovacao}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="quality-item">
                      <div className="quality-icon">😊</div>
                      <div className="quality-content">
                        <div className="quality-label">Satisfação do Cliente</div>
                        <div className="quality-value">{reportData.indicadoresQualidade.satisfacao_cliente}%</div>
                        <div className="quality-bar">
                          <div 
                            className="quality-progress satisfaction" 
                            style={{ width: `${reportData.indicadoresQualidade.satisfacao_cliente}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="quality-item">
                      <div className="quality-icon">🔄</div>
                      <div className="quality-content">
                        <div className="quality-label">Taxa de Retrabalho</div>
                        <div className="quality-value">{reportData.indicadoresQualidade.retrabalho}%</div>
                        <div className="quality-bar">
                          <div 
                            className="quality-progress rework" 
                            style={{ width: `${reportData.indicadoresQualidade.retrabalho}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="quality-item">
                      <div className="quality-icon">⚡</div>
                      <div className="quality-content">
                        <div className="quality-label">Tempo Médio de Resposta</div>
                        <div className="quality-value">{reportData.indicadoresQualidade.tempo_resposta}h</div>
                        <div className="quality-bar">
                          <div 
                            className="quality-progress response" 
                            style={{ width: `${(reportData.indicadoresQualidade.tempo_resposta / 3) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modern-card">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span className="modern-card-icon">📅</span>
              <h3>Agendamento e Atualizações</h3>
            </div>
          </div>
          <div className="modern-card-content">
            <div className="reports-footer">
              <div className="footer-info">
                <p>Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              </div>
              <div className="footer-actions">
                <button className="btn-refresh" onClick={fetchReportData}>
                  🔄 Atualizar Dados
                </button>
                <button className="btn-schedule">
                  📅 Agendar Relatório
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 