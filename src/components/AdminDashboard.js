import React, { useState, useEffect } from 'react';
import api from '../api';
import UpdatesPanel from './UpdatesPanel';

function AdminDashboard({ userInfo }) {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrivilegeManager, setShowPrivilegeManager] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    user_type: 'tecnico'
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data);
      
      // Carregar usuários
      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data);
      
      // Carregar privilégios
      await carregarPrivilegios();
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarPrivilegios = async () => {
    try {
      const response = await api.get('/admin/privileges');
      setPrivileges(response.data);
    } catch (error) {
      console.error('Erro ao carregar privilégios:', error);
      setPrivileges([]);
    }
  };

  const grantPrivilege = async (userId, privilegeType) => {
    try {
      await api.post('/admin/privileges', {
        user_id: userId,
        privilege_type: privilegeType
      });
      
      alert('Privilégio concedido com sucesso!');
      await carregarPrivilegios();
    } catch (error) {
      console.error('Erro ao conceder privilégio:', error);
      alert('Erro ao conceder privilégio');
    }
  };

  const revokePrivilege = async (userId, privilegeType) => {
    try {
      await api.delete(`/admin/privileges/${userId}/${privilegeType}`);
      
      alert('Privilégio revogado com sucesso!');
      await carregarPrivilegios();
    } catch (error) {
      console.error('Erro ao revogar privilégio:', error);
      alert('Erro ao revogar privilégio');
    }
  };

  const getTecnicos = () => {
    return users.filter(user => user.user_type === 'tecnico');
  };

  const hasPrivilege = (userId, privilegeType) => {
    return privileges.some(p => p.user_id === userId && p.privilege_type === privilegeType && p.is_active);
  };

  const createUser = async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      alert('Usuário criado com sucesso!');
      setShowNewUserForm(false);
      setNewUser({ username: '', password: '', user_type: 'tecnico' });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert(`Erro ao criar usuário: ${error.response?.data?.detail || error.message}`);
    }
  };

  const promoteToEncarregado = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, {
        user_type: 'encarregado'
      });
      alert('Técnico promovido para Encarregado com sucesso!');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      alert('Erro ao promover usuário');
    }
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      alert('Usuário excluído com sucesso!');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const demoteToTecnico = async (userId, username) => {
    if (!confirm(`Tem certeza que deseja rebaixar "${username}" de Encarregado para Técnico?`)) {
      return;
    }
    
    try {
      await api.put(`/admin/users/${userId}`, {
        user_type: 'tecnico'
      });
      alert('Encarregado rebaixado para Técnico com sucesso!');
      await carregarDados();
    } catch (error) {
      console.error('Erro ao rebaixar usuário:', error);
      alert('Erro ao rebaixar usuário');
    }
  };

  const handleNewUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      alert('Preencha todos os campos!');
      return;
    }
    createUser(newUser);
  };

  const getEncarregados = () => {
    return users.filter(user => user.user_type === 'encarregado');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Principal */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {userInfo?.is_admin ? '👑 Dashboard Administrativo' : '👨‍🔧 Dashboard do Encarregado'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Gerencie usuários, privilégios e visualize estatísticas em tempo real
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="group inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => {
                  setShowPrivilegeManager(!showPrivilegeManager);
                  setShowUserManager(false);
                }}
                title={showPrivilegeManager ? "Voltar para estatísticas" : "Gerenciar privilégios dos técnicos"}
              >
                <span className="mr-2 text-lg">🔐</span>
                <span className="hidden sm:inline">
                  {showPrivilegeManager ? '📊 Ver Estatísticas' : 'Gerenciar Privilégios'}
                </span>
                <span className="sm:hidden">
                  {showPrivilegeManager ? '📊' : '🔐'}
                </span>
              </button>
              
              <button 
                className="group inline-flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => {
                  setShowUserManager(!showUserManager);
                  setShowPrivilegeManager(false);
                }}
                title={showUserManager ? "Voltar para estatísticas" : "Gerenciar usuários do sistema"}
              >
                <span className="mr-2 text-lg">👥</span>
                <span className="hidden sm:inline">
                  {showUserManager ? '📊 Ver Estatísticas' : 'Gerenciar Usuários'}
                </span>
                <span className="sm:hidden">
                  {showUserManager ? '📊' : '👥'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {!showPrivilegeManager && !showUserManager ? (
          // Dashboard de Estatísticas
          <div className="space-y-8">
            {/* Cards de Estatísticas - Layout Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total de Laudos</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_laudos || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Todos os laudos do sistema</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.laudos_pendentes || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Aguardando aprovação</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors duration-200">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Aprovados</p>
                    <p className="text-3xl font-bold text-green-600">{stats.laudos_aprovados || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Laudos finalizados</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors duration-200">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Usuários</p>
                    <p className="text-3xl font-bold text-purple-600">{users.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total de usuários</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-200">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel de Atualizações */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <UpdatesPanel userInfo={userInfo} />
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-2xl">⚡</span>
                Ações Rápidas
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <button 
                  className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1"
                  onClick={() => window.dispatchEvent(new CustomEvent('show-modern-form'))}
                  title="Criar laudo básico rapidamente"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">➕</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Novo Laudo Simples</h3>
                  <p className="text-sm text-gray-600">Criar laudo básico rapidamente</p>
                </button>

                <button 
                  className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1"
                  onClick={() => window.dispatchEvent(new CustomEvent('show-advanced-form'))}
                  title="Análise técnica completa de baterias"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">🔋</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Laudo Avançado</h3>
                  <p className="text-sm text-gray-600">Análise técnica completa de baterias</p>
                </button>

                <button 
                  className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1"
                  onClick={() => window.dispatchEvent(new CustomEvent('show-voice-recorder'))}
                  title="Ditar informações com IA"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">🎤</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Gravação de Voz</h3>
                  <p className="text-sm text-gray-600">Ditar informações com IA</p>
                </button>

                <button 
                  className="group p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-reports'))}
                  title="Visualizar métricas e dados"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Relatórios</h3>
                  <p className="text-sm text-gray-600">Visualizar métricas e dados</p>
                </button>
              </div>
            </div>
          </div>
        ) : showPrivilegeManager ? (
          // Gerenciador de Privilégios
          <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-3 text-2xl">🔐</span>
                Gerenciador de Privilégios
              </h2>
              <p className="text-gray-600 text-lg">
                Gerencie quais técnicos podem finalizar laudos próprios
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-xl">👨‍🔧</span>
                Técnicos e Privilégios
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getTecnicos().map(tecnico => (
                  <div key={tecnico.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-50 hover:bg-white">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">{tecnico.username}</h4>
                      <p className="text-sm text-gray-600">ID: {tecnico.id}</p>
                      <p className="text-sm text-gray-600">
                        Criado em: {new Date(tecnico.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status do Privilégio:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          hasPrivilege(tecnico.id, 'finalize_laudos') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {hasPrivilege(tecnico.id, 'finalize_laudos') ? '✅ Ativo' : '❌ Inativo'}
                        </span>
                      </div>
                      
                      <button 
                        className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                          hasPrivilege(tecnico.id, 'finalize_laudos')
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        onClick={() => hasPrivilege(tecnico.id, 'finalize_laudos')
                          ? revokePrivilege(tecnico.id, 'finalize_laudos')
                          : grantPrivilege(tecnico.id, 'finalize_laudos')
                        }
                        title={hasPrivilege(tecnico.id, 'finalize_laudos') 
                          ? 'Revogar privilégio de finalização' 
                          : 'Conceder privilégio de finalização'
                        }
                      >
                        {hasPrivilege(tecnico.id, 'finalize_laudos') 
                          ? '🚫 Revogar Privilégio' 
                          : '✅ Conceder Privilégio'
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {getTecnicos().length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">👨‍🔧</div>
                  <p className="text-gray-600 text-lg">Nenhum técnico encontrado no sistema.</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 lg:p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-xl">ℹ️</span>
                Informações sobre Privilégios
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🔐</span>
                    Privilégio de Finalização
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Técnicos com privilégio podem finalizar seus próprios laudos
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Encarregados podem finalizar qualquer laudo
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Admin e Encarregados podem gerenciar privilégios
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🔄</span>
                    Fluxo de Aprovação
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Técnico cria → Encarregado aprova → Vendedor aprova → Finalização
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Apenas técnicos com privilégio veem painel de finalização
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Privilégios podem ser concedidos/revogados a qualquer momento
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Gerenciador de Usuários
          <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-3 text-2xl">👥</span>
                Gerenciador de Usuários
              </h2>
              <p className="text-gray-600 text-lg">
                Cadastre novos técnicos e promova para Encarregado
              </p>
            </div>

            {/* Formulário de Cadastro */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-xl">➕</span>
                Cadastrar Novo Técnico
              </h3>
              <form onSubmit={handleNewUserSubmit} className="bg-gray-50 rounded-xl p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome de Usuário:
                    </label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="Digite o nome do técnico"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha:
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Digite a senha"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Usuário:
                    </label>
                    <select
                      value={newUser.user_type}
                      onChange={(e) => setNewUser({...newUser, user_type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="tecnico">👨‍🔧 Técnico</option>
                      <option value="encarregado">👨‍🔧 Encarregado</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    type="submit" 
                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    title="Cadastrar novo usuário no sistema"
                  >
                    <span className="mr-2">✅</span>
                    Cadastrar Usuário
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de Técnicos */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-xl">👨‍🔧</span>
                Técnicos Cadastrados
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getTecnicos().map(tecnico => (
                  <div key={tecnico.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-50 hover:bg-white">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-lg">{tecnico.username}</h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          👨‍🔧 Técnico
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">ID: {tecnico.id}</p>
                      <p className="text-sm text-gray-600">
                        Criado em: {new Date(tecnico.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <button 
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={() => promoteToEncarregado(tecnico.id)}
                        title="Promover para Encarregado"
                      >
                        ⬆️ Promover para Encarregado
                      </button>
                      <button 
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={() => deleteUser(tecnico.id, tecnico.username)}
                        title="Excluir Usuário"
                      >
                        🗑️ Excluir Usuário
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {getTecnicos().length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">👨‍🔧</div>
                  <p className="text-gray-600 text-lg">Nenhum técnico encontrado no sistema.</p>
                </div>
              )}
            </div>

            {/* Lista de Encarregados */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-xl">👨‍🔧</span>
                Encarregados
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getEncarregados().map(encarregado => (
                  <div key={encarregado.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-50 hover:bg-white">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-lg">{encarregado.username}</h4>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          👨‍🔧 Encarregado
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">ID: {encarregado.id}</p>
                      <p className="text-sm text-gray-600">
                        Criado em: {new Date(encarregado.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <button 
                        className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={() => demoteToTecnico(encarregado.id, encarregado.username)}
                        title="Rebaixar para Técnico"
                      >
                        ⬇️ Rebaixar para Técnico
                      </button>
                      <button 
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={() => deleteUser(encarregado.id, encarregado.username)}
                        title="Excluir Usuário"
                      >
                        🗑️ Excluir Usuário
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {getEncarregados().length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">👨‍🔧</div>
                  <p className="text-gray-600 text-lg">Nenhum encarregado encontrado no sistema.</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 lg:p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-xl">ℹ️</span>
                Informações sobre Usuários
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">👨‍🔧</span>
                    Técnico
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Cria e edita ordens de serviço
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Pode aprovar manutenção
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Pode finalizar OS (com privilégio)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Não pode aprovar orçamento
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">👨‍🔧</span>
                    Encarregado
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Permissões superiores ao técnico
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Pode aprovar manutenção
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Pode editar e finalizar qualquer OS
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Pode cadastrar técnicos e gerenciar privilégios
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      Visualiza o dashboard administrativo
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 