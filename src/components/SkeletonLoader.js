import React from 'react';

const SkeletonLoader = ({ type = 'card', lines = 3, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`skeleton-card ${className}`}>
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-subtitle"></div>
              </div>
            </div>
            <div className="skeleton-body">
              {Array.from({ length: lines }).map((_, index) => (
                <div key={index} className="skeleton-line"></div>
              ))}
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`skeleton-table ${className}`}>
            <div className="skeleton-table-header">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton-table-cell"></div>
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="skeleton-table-row">
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <div key={cellIndex} className="skeleton-table-cell"></div>
                ))}
              </div>
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className={`skeleton-list ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className="skeleton-list-item">
                <div className="skeleton-list-avatar"></div>
                <div className="skeleton-list-content">
                  <div className="skeleton-list-title"></div>
                  <div className="skeleton-list-subtitle"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`skeleton-default ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
              <div key={index} className="skeleton-line"></div>
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default SkeletonLoader; 