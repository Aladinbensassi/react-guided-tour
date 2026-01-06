import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from './Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  showDetails?: boolean;
  details?: string;
}

export interface ToastContextValue {
  showToast: (toast: Omit<ToastData, 'id'>) => string;
  showError: (title: string, message: string, details?: string) => string;
  showWarning: (title: string, message: string) => string;
  showSuccess: (title: string, message: string) => string;
  showInfo: (title: string, message: string) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastProvider = React.memo(function ToastProvider({
  children,
  maxToasts = 5,
  position = 'top-right',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    const newToast: ToastData = { ...toast, id };
    
    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });
    
    return id;
  }, [generateId, maxToasts]);

  const showError = useCallback((title: string, message: string, details?: string) => {
    return showToast({
      type: 'error',
      title,
      message,
      details,
      showDetails: !!details,
      duration: 8000,
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string) => {
    return showToast({
      type: 'warning',
      title,
      message,
      duration: 6000,
    });
  }, [showToast]);

  const showSuccess = useCallback((title: string, message: string) => {
    return showToast({
      type: 'success',
      title,
      message,
      duration: 4000,
    });
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string) => {
    return showToast({
      type: 'info',
      title,
      message,
      duration: 5000,
    });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10000,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxHeight: '100vh',
      overflow: 'hidden',
    };

    const positionStyles = {
      'top-right': {
        top: '20px',
        right: '20px',
      },
      'top-left': {
        top: '20px',
        left: '20px',
      },
      'bottom-right': {
        bottom: '20px',
        right: '20px',
        flexDirection: 'column-reverse' as const,
      },
      'bottom-left': {
        bottom: '20px',
        left: '20px',
        flexDirection: 'column-reverse' as const,
      },
    };

    return { ...baseStyles, ...positionStyles[position] };
  };

  const contextValue: ToastContextValue = {
    showToast,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {toasts.length > 0 && (
        <div style={getContainerStyles()}>
          {toasts.map(toast => (
            <div key={toast.id} style={{ pointerEvents: 'auto' }}>
              <Toast
                {...toast}
                onClose={removeToast}
              />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
});

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
