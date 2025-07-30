import React from 'react';

const Sidebar = ({ userInfo, currentView, onViewChange, collapsed, onToggle }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🎯' },
    { id: 'laudos', label: 'Laudos', icon: '📋' },
    { id: 'finalized', label: 'Finalizados', icon: '✅' },
    { id: 'approval', label: 'Aprovação', icon: '👨‍⚖️' },
    { id: 'reports', label: 'Relatórios', icon: '📊' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' },
  ];

  // Filtrar itens baseado no perfil do usuário
  const filteredMenuItems = menuItems.filter(item => {
    if (item.id === 'approval' && !userInfo?.is_admin && userInfo?.user_type !== 'encarregado') {
      return false;
    }
    return true;
  });

  return (
    <div className={`modern-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="modern-sidebar-header">
        <div className="modern-sidebar-logo">
          {collapsed ? (
            <div className="logo-collapsed">🔋</div>
          ) : (
            <div className="logo-expanded">
              <div className="logo-icon">🔋</div>
              <div className="logo-text">
                <div className="logo-title">RSM MOURA</div>
                <div className="logo-subtitle">Maintenance Management</div>
              </div>
            </div>
          )}
        </div>
        <button 
          className="modern-sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="modern-sidebar-nav">
        {filteredMenuItems.map(item => (
          <div
            key={item.id}
            className={`modern-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="modern-nav-icon">{item.icon}</span>
            {!collapsed && (
              <span className="modern-nav-text">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Informações do usuário */}
      {!collapsed && (
        <div className="modern-user-info" style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          right: '20px',
          padding: 'var(--space-4)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="modern-user-avatar">
              {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="modern-user-name">
                {userInfo?.username || 'Usuário'}
              </div>
              <div className="modern-user-role">
                {userInfo?.user_type || 'Técnico'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 