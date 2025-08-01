import React, { useState, useEffect } from 'react';
import './App.css';
import './ModernDesign.css';
import './DesignSystem.css';
import Login from './Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import LaudosManager from './components/LaudosManager';
import FinalizedLaudos from './components/FinalizedLaudos';
import ApprovalCenter from './components/ApprovalCenter';
import ApprovalPanel from './components/ApprovalPanel';
import FormularioLaudoAvancado from './components/FormularioLaudoAvancado';
import ModernLaudoForm from './components/ModernLaudoForm';
import ContinuousAudioRecorder from './components/ContinuousAudioRecorder';
import LaudoViewer from './components/LaudoViewer';
import LaudoEditor from './components/LaudoEditor';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ConnectionDebug from './components/ConnectionDebug';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModernForm, setShowModernForm] = useState(false);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [showContinuousRecorder, setShowContinuousRecorder] = useState(false);
  
  // ✅ Estados para visualização e edição de laudos
  const [showLaudoViewer, setShowLaudoViewer] = useState(false);
  const [showLaudoEditor, setShowLaudoEditor] = useState(false);
  const [selectedLaudoId, setSelectedLaudoId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfo();
    }
  }, []);

  // ✅ Event listeners para navegação do Dashboard
  useEffect(() => {
    const handleNavigateToLaudos = () => {
      setCurrentView('laudos');
    };

    const handleNavigateToReports = () => {
      setCurrentView('reports');
    };

    const handleShowModernForm = () => {
      setShowModernForm(true);
    };

    const handleShowAdvancedForm = () => {
      setShowAdvancedForm(true);
    };

    const handleShowVoiceRecorder = () => {
      setShowContinuousRecorder(true);
    };

    // ✅ Implementar visualização e edição de laudo funcionais
    const handleViewLaudo = (event) => {
      const { laudoId } = event.detail;
      setSelectedLaudoId(laudoId);
      setShowLaudoViewer(true);
    };

    const handleEditLaudo = (event) => {
      const { laudoId } = event.detail;
      setSelectedLaudoId(laudoId);
      setShowLaudoEditor(true);
    };

    // Registrar event listeners
    window.addEventListener('navigate-to-laudos', handleNavigateToLaudos);
    window.addEventListener('navigate-to-reports', handleNavigateToReports);
    window.addEventListener('show-modern-form', handleShowModernForm);
    window.addEventListener('show-advanced-form', handleShowAdvancedForm);
    window.addEventListener('show-voice-recorder', handleShowVoiceRecorder);
    window.addEventListener('view-laudo', handleViewLaudo);
    window.addEventListener('edit-laudo', handleEditLaudo);

    // Cleanup
    return () => {
      window.removeEventListener('navigate-to-laudos', handleNavigateToLaudos);
      window.removeEventListener('navigate-to-reports', handleNavigateToReports);
      window.removeEventListener('show-modern-form', handleShowModernForm);
      window.removeEventListener('show-advanced-form', handleShowAdvancedForm);
      window.removeEventListener('show-voice-recorder', handleShowVoiceRecorder);
      window.removeEventListener('view-laudo', handleViewLaudo);
      window.removeEventListener('edit-laudo', handleEditLaudo);
    };
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
  };

  const handleLogin = (userInfo) => {
    setUserInfo(userInfo);
    setIsLoggedIn(true);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    setCurrentView('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeAllModals = () => {
    setShowModernForm(false);
    setShowAdvancedForm(false);
    setShowContinuousRecorder(false);
    setShowLaudoViewer(false);
    setShowLaudoEditor(false);
    setSelectedLaudoId(null);
  };

  const handleViewLaudo = (laudoId) => {
    setSelectedLaudoId(laudoId);
    setShowLaudoViewer(true);
  };

  const handleEditLaudo = (laudoId) => {
    setSelectedLaudoId(laudoId);
    setShowLaudoEditor(true);
  };

  const handleLaudoSaved = () => {
    // Recarregar dados se necessário
    closeAllModals();
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        // Se for admin ou encarregado, mostrar AdminDashboard, senão Dashboard normal
        return (userInfo?.is_admin || userInfo?.user_type === 'encarregado') ? <AdminDashboard userInfo={userInfo} /> : <Dashboard userInfo={userInfo} />;
      case 'laudos':
        return (
          <LaudosManager 
            userInfo={userInfo}
            onShowAdvancedForm={() => setShowAdvancedForm(true)}
            onShowModernForm={() => setShowModernForm(true)}
            onShowRecorder={() => setShowContinuousRecorder(true)}
            onViewLaudo={handleViewLaudo}
            onEditLaudo={handleEditLaudo}
          />
        );
      case 'finalized':
        return <FinalizedLaudos userInfo={userInfo} />;
      case 'approval':
        return <ApprovalPanel userInfo={userInfo} />;
      case 'reports':
        return <Reports userInfo={userInfo} />;
      case 'settings':
        return <Settings userInfo={userInfo} />;
      default:
        return (userInfo?.is_admin || userInfo?.user_type === 'encarregado') ? <AdminDashboard userInfo={userInfo} /> : <Dashboard userInfo={userInfo} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="modern-main-layout">
      <Sidebar 
        userInfo={userInfo}
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <div className={`modern-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          userInfo={userInfo}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <div className="modern-page-content">
          {renderMainContent()}
        </div>
      </div>

      {/* Modais */}
      {showModernForm && (
        <ModernLaudoForm 
          userInfo={userInfo}
          onClose={() => setShowModernForm(false)}
        />
      )}

      {showAdvancedForm && (
        <FormularioLaudoAvancado 
          userInfo={userInfo}
          onClose={() => setShowAdvancedForm(false)}
        />
      )}

      {showContinuousRecorder && (
        <ContinuousAudioRecorder 
          onClose={() => setShowContinuousRecorder(false)}
        />
      )}

      {/* ✅ Modais de visualização e edição de laudos */}
      {showLaudoViewer && selectedLaudoId && (
        <LaudoViewer 
          laudoId={selectedLaudoId}
          onClose={() => {
            setShowLaudoViewer(false);
            setSelectedLaudoId(null);
          }}
        />
      )}

      {showLaudoEditor && selectedLaudoId && (
        <LaudoEditor 
          laudoId={selectedLaudoId}
          onClose={() => {
            setShowLaudoEditor(false);
            setSelectedLaudoId(null);
          }}
          onSave={handleLaudoSaved}
        />
      )}

      {/* Componente de debug de conexão (só aparece em desenvolvimento) */}
      <ConnectionDebug />
    </div>
  );
}

export default App;