import React, { useEffect, useState } from 'react';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  showDetails?: boolean;
  details?: string;
}

export const Toast = React.memo(function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  showDetails = false,
  details,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      maxWidth: '400px',
      minWidth: '300px',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease-in-out',
    };

    const typeStyles = {
      error: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        color: '#991b1b',
      },
      warning: {
        backgroundColor: '#fffbeb',
        borderColor: '#fed7aa',
        color: '#92400e',
      },
      success: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        color: '#166534',
      },
      info: {
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
        color: '#1e40af',
      },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getIconStyles = () => ({
    display: 'inline-block',
    marginRight: '8px',
    fontSize: '16px',
  });

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div style={getToastStyles()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={getIconStyles()}>{getIcon()}</span>
            <strong style={{ fontSize: '14px', fontWeight: '600' }}>{title}</strong>
          </div>
          <div style={{ marginLeft: '24px', lineHeight: '1.4' }}>
            {message}
          </div>
          
          {showDetails && details && (
            <div style={{ marginTop: '12px', marginLeft: '24px' }}>
              <button
                onClick={() => setShowDetailView(!showDetailView)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0',
                }}
              >
                {showDetailView ? 'Hide Details' : 'Show Details'}
              </button>
              
              {showDetailView && (
                <pre
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '150px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {details}
                </pre>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: 'inherit',
            padding: '0',
            marginLeft: '12px',
            opacity: 0.7,
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
});
