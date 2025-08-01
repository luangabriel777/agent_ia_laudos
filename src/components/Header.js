import React from 'react';

const Header = ({ userInfo, onLogout, onToggleSidebar, sidebarCollapsed }) => {
  const getUserRole = () => {
    if (userInfo?.is_admin) return 'Administrador';
    if (userInfo?.user_type === 'encarregado') return 'Encarregado';
    if (userInfo?.user_type === 'vendedor') return 'Vendedor';
    return 'Técnico';
  };

  return (
    <header className="modern-main-header">
      <div className="modern-header-left">
        <button 
          className="modern-toggle-sidebar"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>
        
        <div className="modern-breadcrumb">
          <span className="breadcrumb-text">
            Sistema RSM - {getUserRole()}
          </span>
        </div>
      </div>

      <div className="modern-header-right">
        <div className="modern-user-info">
          <div className="modern-user-avatar">
            {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="modern-user-details">
            <div className="modern-user-name">
              {userInfo?.username || 'Usuário'}
            </div>
            <div className="modern-user-role">
              {getUserRole()}
            </div>
          </div>
        </div>

        <button 
          className="modern-logout-btn"
          onClick={onLogout}
          title="Sair do sistema"
        >
          🚪 Sair
        </button>
      </div>
    </header>
  );
};

export default Header; 