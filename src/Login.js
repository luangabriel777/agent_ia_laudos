import React, { useState } from 'react';
import './LoginModern.css';
import api from './api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  // ✅ DETECÇÃO DE MODO DESENVOLVIMENTO
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ✅ CORREÇÃO: Usando API configurada
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await api.post('/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // ✅ CORREÇÃO: Buscar informações do usuário
        const userResponse = await api.get('/me');
        
        if (userResponse.data) {
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          onLogin(userResponse.data);
        } else {
          setError('Erro ao buscar informações do usuário');
        }
      } else {
        setError('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro de login:', error);
      
      if (error.response) {
        // Erro do servidor
        if (error.response.status === 401) {
          setError('Credenciais inválidas. Verifique seu usuário e senha.');
        } else if (error.response.status === 500) {
          setError('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          setError(`Erro ${error.response.status}: ${error.response.data?.detail || 'Erro desconhecido'}`);
        }
      } else if (error.request) {
        // Erro de conexão
        setError('Erro de conexão. Verifique se o backend está rodando e tente novamente.');
      } else {
        // Outro erro
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (username, password) => {
    setCredentials({ username, password });
    // Auto-submit after setting credentials
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      setCredentials({ username, password });
      handleSubmit(fakeEvent);
    }, 100);
  };

  // ✅ CORREÇÃO: Handler para erro de carregamento da logo
  const handleLogoError = () => {
    setLogoError(true);
  };

  // ✅ CORREÇÃO: Fallback da logo em caso de erro
  const renderLogo = () => {
    if (logoError) {
      return (
        <div className="login-logo-fallback">
          <span className="logo-fallback-icon">🔋</span>
        </div>
      );
    }

    return (
      <img 
        src="/moura-logo.svg" 
        alt="Moura RSM" 
        onError={handleLogoError}
        onLoad={() => setLogoError(false)}
        className="login-logo"
      />
    );
  };

  // ✅ DADOS DOS ACESSOS RÁPIDOS - Cores institucionais Moura
  const quickLogins = [
    { name: "Admin", username: "admin", password: "123456", color: "quick-btn-admin", icon: "👑" },
    { name: "Técnico", username: "tecnico", password: "123456", color: "quick-btn-tecnico", icon: "🔧" },
    { name: "Encarregado", username: "encarregado", password: "123456", color: "quick-btn-encarregado", icon: "👨‍🔧" },
    { name: "Vendas", username: "vendedor", password: "123456", color: "quick-btn-vendedor", icon: "💰" },
  ];

  return (
    <div className="login-container-modern">
      {/* ✅ FUNDO GRADIENTE RADIAL */}
      <div className="login-background">
        <div className="gradient-overlay"></div>
        <div className="radial-glow"></div>
      </div>

      <div className="login-card-modern">
        {/* ✅ HEADER MODERNO */}
        <div className="login-header-modern">
          <div className="logo-container-modern">
            <div className="logo-modern">
              {renderLogo()}
            </div>
          </div>
          <h1 className="login-title-modern">RSM</h1>
          <h2 className="login-subtitle-modern">Rede de Serviços Moura</h2>
          <p className="login-description-modern">Sistema de Laudos Técnicos Inteligente</p>
        </div>

        {/* ✅ MENSAGEM DE ERRO */}
        {error && (
          <div className="error-message-modern">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* ✅ FORMULÁRIO MODERNO */}
        <form onSubmit={handleSubmit} className="login-form-modern">
          <div className="form-group-modern">
            <label htmlFor="username" className="form-label-modern">
              Usuário
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              className="form-input-modern"
              placeholder="Digite seu usuário"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group-modern">
            <label htmlFor="password" className="form-label-modern">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className="form-input-modern"
              placeholder="Digite sua senha"
              required
              disabled={isLoading}
            />
          </div>

          {/* ✅ BOTÃO DE LOGIN MODERNO */}
          <button 
            type="submit" 
            className="login-btn-modern"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner-modern"></div>
                Entrando...
              </>
            ) : (
              <>
                <span className="btn-icon">🔐</span>
                Entrar no Sistema
              </>
            )}
          </button>
        </form>

        {/* ✅ ACESSOS RÁPIDOS (APENAS EM DESENVOLVIMENTO) */}
        {isDevelopment && (
          <div className="quick-access-modern">
            <div className="quick-access-header">
              <h3 className="quick-access-title-modern">
                <span className="dev-icon">🚀</span>
                Acessos Rápidos
              </h3>
              <button 
                className="toggle-credentials-btn"
                onClick={() => setShowCredentials(!showCredentials)}
              >
                {showCredentials ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            <div className="quick-access-grid-modern">
              {quickLogins.map((login) => (
                <button
                  key={login.name}
                  onClick={() => handleQuickLogin(login.username, login.password)}
                  disabled={isLoading}
                  className={`quick-btn-modern ${login.color}`}
                >
                  <span className="quick-btn-icon-modern">{login.icon}</span>
                  <span className="quick-btn-text">{login.name}</span>
                </button>
              ))}
            </div>

            {/* ✅ INFORMAÇÕES DE CREDENCIAIS COLAPSÁVEIS */}
            {showCredentials && (
              <div className="credentials-info-modern">
                <div className="credentials-header">
                  <span className="credentials-icon">👥</span>
                  <span>Usuários de Teste</span>
                </div>
                <div className="credentials-list">
                  <div className="credential-item">
                    <span className="credential-icon">👑</span>
                    <span className="credential-label">Admin:</span>
                    <code className="credential-code">admin / 123456</code>
                  </div>
                  <div className="credential-item">
                    <span className="credential-icon">🔧</span>
                    <span className="credential-label">Técnico:</span>
                    <code className="credential-code">tecnico / 123456</code>
                  </div>
                  <div className="credential-item">
                    <span className="credential-icon">👨‍🔧</span>
                    <span className="credential-label">Encarregado:</span>
                    <code className="credential-code">encarregado / 123456</code>
                  </div>
                  <div className="credential-item">
                    <span className="credential-icon">💰</span>
                    <span className="credential-label">Vendedor:</span>
                    <code className="credential-code">vendedor / 123456</code>
                  </div>
                </div>
                <div className="dev-mode-indicator-modern">
                  <span className="dev-icon">🔧</span>
                  Modo Desenvolvimento Ativo
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ FOOTER */}
        <div className="login-footer-modern">
          <p>© 2024 Moura Baterias - Sistema RSM</p>
        </div>
      </div>
    </div>
  );
};

export default Login;