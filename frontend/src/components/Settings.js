import React, { useState, useEffect } from 'react';
import api from '../api';

const Settings = ({ userInfo }) => {
  const [activeTab, setActiveTab] = useState('system');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Estados para diferentes seções
  const [systemSettings, setSystemSettings] = useState({
    system_name: 'RSM - Rede de Serviços Moura',
    version: '2.0.0',
    company_name: 'Moura Baterias S.A.',
    company_cnpj: '12.345.678/0001-90',
    company_address: 'Av. das Indústrias, 1000 - Distrito Industrial',
    company_city: 'Belo Jardim - PE',
    company_phone: '(87) 3726-1000',
    company_email: 'contato@moura.com.br',
    support_email: 'suporte@moura.com.br',
    primary_color: '#1B365D',
    secondary_color: '#6366F1'
  });

  const [aiSettings, setAiSettings] = useState({
    openai_api_key: '',
    openai_model: 'gpt-3.5-turbo',
    whisper_enabled: true,
    max_tokens: 1000,
    temperature: 0.7
  });

  const [emailSettings, setEmailSettings] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    email_enabled: false,
    notification_email: ''
  });

  const [backupSettings, setBackupSettings] = useState({
    auto_backup: true,
    backup_frequency: 'daily',
    backup_retention: 30,
    backup_path: './backups/',
    last_backup: null
  });

  const [securitySettings, setSecuritySettings] = useState({
    session_timeout: 30,
    max_login_attempts: 5,
    password_min_length: 8,
    require_special_chars: true,
    two_factor_enabled: false
  });

  const [auditLog, setAuditLog] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadSettings();
    loadAuditLog();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data) {
        setSystemSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLog = async () => {
    try {
      const response = await api.get('/admin/audit-log');
      setAuditLog(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar log de auditoria:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const saveSettings = async (section, data) => {
    try {
      setIsLoading(true);
      setSaveMessage('');
      
      // Simular salvamento (implementar endpoint real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveMessage('✅ Configurações salvas com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('❌ Erro ao salvar configurações');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const testOpenAIConnection = async () => {
    try {
      setIsLoading(true);
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✅ Conexão com OpenAI testada com sucesso!');
    } catch (error) {
      alert('❌ Erro ao testar conexão com OpenAI');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      setIsLoading(true);
      // Simular teste de e-mail
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✅ E-mail de teste enviado com sucesso!');
    } catch (error) {
      alert('❌ Erro ao enviar e-mail de teste');
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setIsLoading(true);
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('✅ Backup criado com sucesso!');
      setBackupSettings(prev => ({ ...prev, last_backup: new Date().toISOString() }));
    } catch (error) {
      alert('❌ Erro ao criar backup');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'system', label: 'Sistema', icon: '⚙', color: '#3B82F6' },
    { id: 'ai', label: 'Inteligência Artificial', icon: 'AI', color: '#10B981' },
    { id: 'email', label: 'E-mail', icon: '✉', color: '#F59E0B' },
    { id: 'backup', label: 'Backup', icon: '💾', color: '#8B5CF6' },
    { id: 'security', label: 'Segurança', icon: '🔒', color: '#EF4444' },
    { id: 'users', label: 'Usuários', icon: '👥', color: '#06B6D4' },
    { id: 'audit', label: 'Auditoria', icon: '📋', color: '#84CC16' }
  ];

  const renderSystemTab = () => (
    <div className="modern-settings-tab-content">
      <div className="modern-settings-section">
        <h3>🏢 Informações da Empresa</h3>
        <div className="modern-settings-grid responsive">
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Nome do Sistema</label>
            <input
              type="text"
              value={systemSettings.system_name}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, system_name: e.target.value }))}
              className="modern-settings-input"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Razão Social</label>
            <input
              type="text"
              value={systemSettings.company_name}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, company_name: e.target.value }))}
              className="modern-settings-input"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">CNPJ</label>
            <input
              type="text"
              value={systemSettings.company_cnpj}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, company_cnpj: e.target.value }))}
              className="modern-settings-input"
              placeholder="00.000.000/0001-00"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Telefone</label>
            <input
              type="text"
              value={systemSettings.company_phone}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, company_phone: e.target.value }))}
              className="modern-settings-input"
              placeholder="(00) 0000-0000"
            />
          </div>
          <div className="modern-settings-form-group full-width">
            <label className="modern-settings-label">Endereço</label>
            <input
              type="text"
              value={systemSettings.company_address}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, company_address: e.target.value }))}
              className="modern-settings-input"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Cidade</label>
            <input
              type="text"
              value={systemSettings.company_city}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, company_city: e.target.value }))}
              className="modern-settings-input"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">E-mail</label>
            <input
              type="email"
              value={systemSettings.company_email}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, company_email: e.target.value }))}
              className="modern-settings-input"
            />
          </div>
        </div>
      </div>

      <div className="modern-settings-section">
        <h3>🎨 Personalização Visual</h3>
        <div className="modern-settings-grid responsive">
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Cor Primária</label>
            <div className="modern-color-input-group">
              <input
                type="color"
                value={systemSettings.primary_color}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                className="modern-color-picker"
              />
              <input
                type="text"
                value={systemSettings.primary_color}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                className="modern-settings-input"
              />
            </div>
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Cor Secundária</label>
            <div className="modern-color-input-group">
              <input
                type="color"
                value={systemSettings.secondary_color}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                className="modern-color-picker"
              />
              <input
                type="text"
                value={systemSettings.secondary_color}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                className="modern-settings-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="modern-settings-actions">
        <button 
          className={`modern-btn-save ${isLoading ? 'loading' : ''}`}
          onClick={() => saveSettings('system', systemSettings)}
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="modern-settings-tab-content">
      <div className="modern-settings-section">
        <h3>🤖 Configurações da OpenAI</h3>
        <div className="modern-settings-grid">
          <div className="modern-settings-form-group full-width">
            <label className="modern-settings-label">API Key</label>
            <input
              type="password"
              value={aiSettings.openai_api_key}
              onChange={(e) => setAiSettings(prev => ({ ...prev, openai_api_key: e.target.value }))}
              className="modern-settings-input"
              placeholder="sk-..."
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Modelo</label>
            <select
              value={aiSettings.openai_model}
              onChange={(e) => setAiSettings(prev => ({ ...prev, openai_model: e.target.value }))}
              className="modern-settings-input"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Máximo de Tokens</label>
            <input
              type="number"
              value={aiSettings.max_tokens}
              onChange={(e) => setAiSettings(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
              className="modern-settings-input"
              min="100"
              max="4000"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Temperatura</label>
            <input
              type="number"
              value={aiSettings.temperature}
              onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="modern-settings-input"
              min="0"
              max="2"
              step="0.1"
            />
          </div>
          <div className="modern-settings-form-group full-width">
            <label className="modern-settings-label">
              <input
                type="checkbox"
                checked={aiSettings.whisper_enabled}
                onChange={(e) => setAiSettings(prev => ({ ...prev, whisper_enabled: e.target.checked }))}
                className="modern-settings-input"
              />
              <span>Habilitar Whisper (Transcrição de Áudio)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="modern-settings-actions">
        <button 
          className="modern-btn"
          onClick={testOpenAIConnection}
          disabled={!aiSettings.openai_api_key || isLoading}
        >
          {isLoading ? '🧪 Testando...' : '🧪 Testar Conexão'}
        </button>
        <button 
          className="modern-btn-save"
          onClick={() => saveSettings('ai', aiSettings)}
          disabled={isLoading}
        >
          {isLoading ? '💾 Salvando...' : '💾 Salvar Configurações'}
        </button>
      </div>
    </div>
  );

  const renderEmailTab = () => (
    <div className="modern-settings-tab-content">
      <div className="modern-settings-section">
        <h3>📧 Configurações SMTP</h3>
        <div className="modern-settings-grid">
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Servidor SMTP</label>
            <input
              type="text"
              value={emailSettings.smtp_host}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
              className="modern-settings-input"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Porta</label>
            <input
              type="number"
              value={emailSettings.smtp_port}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))}
              className="modern-settings-input"
              placeholder="587"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Usuário</label>
            <input
              type="email"
              value={emailSettings.smtp_username}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_username: e.target.value }))}
              className="modern-settings-input"
              placeholder="seu@email.com"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Senha</label>
            <input
              type="password"
              value={emailSettings.smtp_password}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
              className="modern-settings-input"
              placeholder="sua_senha"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">E-mail de Notificação</label>
            <input
              type="email"
              value={emailSettings.notification_email}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, notification_email: e.target.value }))}
              className="modern-settings-input"
              placeholder="notificacoes@empresa.com"
            />
          </div>
          <div className="modern-settings-form-group full-width">
            <label className="modern-settings-label">
              <input
                type="checkbox"
                checked={emailSettings.email_enabled}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, email_enabled: e.target.checked }))}
                className="modern-settings-input"
              />
              <span>Habilitar Envio de E-mails</span>
            </label>
          </div>
        </div>
      </div>

      <div className="modern-settings-actions">
        <button 
          className="modern-btn"
          onClick={testEmailConnection}
          disabled={!emailSettings.smtp_host || isLoading}
        >
          {isLoading ? '📧 Testando...' : '📧 Enviar E-mail Teste'}
        </button>
        <button 
          className="modern-btn-save"
          onClick={() => saveSettings('email', emailSettings)}
          disabled={isLoading}
        >
          {isLoading ? '💾 Salvando...' : '💾 Salvar Configurações'}
        </button>
      </div>
    </div>
  );

  const renderBackupTab = () => (
    <div className="modern-settings-tab-content">
      <div className="modern-settings-section">
        <h3>💾 Configurações de Backup</h3>
        <div className="modern-settings-grid">
          <div className="modern-settings-form-group full-width">
            <label className="modern-settings-label">
              <input
                type="checkbox"
                checked={backupSettings.auto_backup}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, auto_backup: e.target.checked }))}
                className="modern-settings-input"
              />
              <span>Ativar Backup Automático</span>
            </label>
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Frequência</label>
            <select
              value={backupSettings.backup_frequency}
              onChange={(e) => setBackupSettings(prev => ({ ...prev, backup_frequency: e.target.value }))}
              className="modern-settings-input"
              disabled={!backupSettings.auto_backup}
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Retenção (dias)</label>
            <input
              type="number"
              value={backupSettings.backup_retention}
              onChange={(e) => setBackupSettings(prev => ({ ...prev, backup_retention: parseInt(e.target.value) }))}
              className="modern-settings-input"
              min="1"
              max="365"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Diretório de Backup</label>
            <input
              type="text"
              value={backupSettings.backup_path}
              onChange={(e) => setBackupSettings(prev => ({ ...prev, backup_path: e.target.value }))}
              className="modern-settings-input"
              placeholder="./backups/"
            />
          </div>
        </div>
      </div>

      <div className="modern-settings-section">
        <h3>📊 Status do Backup</h3>
        <div className="modern-settings-grid">
          <div className="modern-settings-form-group">
            <label className="modern-info-label">Último Backup:</label>
            <div className="modern-info-value">
              {backupSettings.last_backup 
                ? new Date(backupSettings.last_backup).toLocaleString('pt-BR')
                : 'Nunca realizado'
              }
            </div>
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-info-label">Status:</label>
            <div className={`modern-laudo-status ${backupSettings.auto_backup ? 'modern-status-aprovado' : 'modern-status-rejeitado'}`}>
              {backupSettings.auto_backup ? '✅ Ativo' : '❌ Inativo'}
            </div>
          </div>
        </div>
      </div>

      <div className="modern-settings-actions">
        <button 
          className="modern-btn"
          onClick={createBackup}
          disabled={isLoading}
        >
          {isLoading ? '💾 Criando...' : '💾 Criar Backup Manual'}
        </button>
        <button 
          className="modern-btn-save"
          onClick={() => saveSettings('backup', backupSettings)}
          disabled={isLoading}
        >
          {isLoading ? '💾 Salvando...' : '💾 Salvar Configurações'}
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="modern-settings-tab-content">
      <div className="modern-settings-section">
        <h3>🔒 Configurações de Segurança</h3>
        <div className="modern-settings-grid">
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Timeout da Sessão (minutos)</label>
            <input
              type="number"
              value={securitySettings.session_timeout}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }))}
              className="modern-settings-input"
              min="5"
              max="480"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Máximo de Tentativas de Login</label>
            <input
              type="number"
              value={securitySettings.max_login_attempts}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, max_login_attempts: parseInt(e.target.value) }))}
              className="modern-settings-input"
              min="3"
              max="10"
            />
          </div>
          <div className="modern-settings-form-group">
            <label className="modern-settings-label">Tamanho Mínimo da Senha</label>
            <input
              type="number"
              value={securitySettings.password_min_length}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, password_min_length: parseInt(e.target.value) }))}
              className="modern-settings-input"
              min="6"
              max="20"
            />
          </div>
          <div className="modern-settings-form-group full-width">
            <label className="modern-settings-label">
              <input
                type="checkbox"
                checked={securitySettings.require_special_chars}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, require_special_chars: e.target.checked }))}
                className="modern-settings-input"
              />
              <span>Exigir Caracteres Especiais na Senha</span>
            </label>
          </div>
          <div className="modern-settings-form-group full-width">
            <label className="modern-settings-label">
              <input
                type="checkbox"
                checked={securitySettings.two_factor_enabled}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, two_factor_enabled: e.target.checked }))}
                className="modern-settings-input"
              />
              <span>Habilitar Autenticação de Dois Fatores (2FA)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="modern-settings-actions">
        <button 
          className="modern-btn-save"
          onClick={() => saveSettings('security', securitySettings)}
          disabled={isLoading}
        >
          {isLoading ? '💾 Salvando...' : '💾 Salvar Configurações'}
        </button>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="modern-settings-tab-content">
      <div className="modern-settings-section">
        <h3>👥 Usuários do Sistema</h3>
        <div className="modern-cards-grid">
          {users.map(user => (
            <div key={user.id} className="modern-card">
              <div className="modern-card-header">
                <div className="modern-user-avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="modern-user-info">
                  <h4 className="modern-user-name">{user.username}</h4>
                  <p className="modern-user-role">
                    {user.user_type === 'admin' ? '👨‍💼 Administrador' :
                     user.user_type === 'encarregado' ? '👨‍🔧 Encarregado' :
                     user.user_type === 'tecnico' ? '🔧 Técnico' : '💰 Vendedor'}
                  </p>
                  <p className="modern-info-value">
                    Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="modern-card-actions">
                <button className="modern-btn modern-btn-secondary" title="Editar">
                  ✏️
                </button>
                <button className="modern-btn modern-btn-secondary" title="Excluir">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="modern-settings-tab-content">
      <div className="modern-settings-section">
        <h3>📋 Log de Auditoria</h3>
        <div className="modern-filters-container">
          <div className="modern-filter-group">
            <label className="modern-filter-label">Ação:</label>
            <select className="modern-filter-select">
              <option value="all">Todas as Ações</option>
              <option value="login">Login</option>
              <option value="create">Criação</option>
              <option value="update">Atualização</option>
              <option value="delete">Exclusão</option>
            </select>
          </div>
          <div className="modern-filter-group">
            <label className="modern-filter-label">Usuário:</label>
            <select className="modern-filter-select">
              <option value="all">Todos os Usuários</option>
              {users.map(user => (
                <option key={user.id} value={user.username}>{user.username}</option>
              ))}
            </select>
          </div>
          <button className="modern-btn">🔍 Filtrar</button>
        </div>
        
        <div className="modern-content">
          {auditLog.length > 0 ? (
            auditLog.map(entry => (
              <div key={entry.id} className="modern-card">
                <div className="modern-card-header">
                  <div className="modern-card-icon">
                    {entry.action === 'login' ? '🔐' :
                     entry.action === 'create' ? '➕' :
                     entry.action === 'update' ? '✏️' :
                     entry.action === 'delete' ? '🗑️' : '📝'}
                  </div>
                  <div className="modern-card-content">
                    <div className="modern-card-title">
                      <strong>{entry.user}</strong> {entry.details}
                    </div>
                    <div className="modern-info-value">
                      {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="modern-card">
              <div className="modern-card-content">
                <div className="modern-card-icon">📋</div>
                <h3>Nenhum registro encontrado</h3>
                <p>Logs de auditoria aparecerão aqui conforme atividades forem realizadas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'system': return renderSystemTab();
      case 'ai': return renderAITab();
      case 'email': return renderEmailTab();
      case 'backup': return renderBackupTab();
      case 'security': return renderSecurityTab();
      case 'users': return renderUsersTab();
      case 'audit': return renderAuditTab();
      default: return renderSystemTab();
    }
  };

  return (
    <div className="modern-settings-main">
      <div className="modern-container">
        <div className="modern-header">
          <h2>⚙️ Configurações do Sistema</h2>
          <p>Gerencie todas as configurações e parâmetros do RSM</p>
        </div>
        
        {saveMessage && (
          <div className={`modern-card ${saveMessage.includes('✅') ? 'modern-status-aprovado' : 'modern-status-rejeitado'}`}>
            {saveMessage}
          </div>
        )}

        <div className="modern-settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`modern-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="modern-settings-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="modern-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings; 