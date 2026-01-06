import React, { Component, ReactNode, useEffect } from 'react';
import { useToast } from './ToastProvider';

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
  useToast?: boolean;
  toastTitle?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('Tour ErrorBoundary caught an error:', error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      if (this.props.useToast !== false) {
        return <ErrorBoundaryWithToast {...this.props} error={this.state.error} errorInfo={this.state.errorInfo} retry={this.retry} />;
      }

      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.retry);
      }

      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            maxWidth: '400px',
            margin: '10px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
            Tour Error
          </h3>
          <p style={{ margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Something went wrong with the guided tour. This error has been logged for debugging.
          </p>
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '500' }}>
              Error Details
            </summary>
            <pre
              style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#fee2e2',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </details>
          <button
            onClick={this.retry}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

interface ErrorBoundaryWithToastProps extends ErrorBoundaryProps {
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
}

function ErrorBoundaryWithToast({ 
  children, 
  error, 
  errorInfo, 
  retry, 
  toastTitle = 'Tour Error' 
}: ErrorBoundaryWithToastProps) {
  const { showError } = useToast();

  useEffect(() => {
    const errorDetails = `${error.message}\n\n${error.stack || ''}\n\nComponent Stack:\n${errorInfo.componentStack}`;
    
    showError(
      toastTitle,
      'Something went wrong with the guided tour. Click for details.',
      errorDetails
    );
    
    retry();
  }, [error, errorInfo, showError, retry, toastTitle]);

  return <>{children}</>;
}
