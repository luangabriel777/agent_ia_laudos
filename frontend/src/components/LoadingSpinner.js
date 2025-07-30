import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = 'Carregando...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary-500',
    success: 'border-success-500',
    warning: 'border-warning-500',
    error: 'border-error-500'
  };

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner; 