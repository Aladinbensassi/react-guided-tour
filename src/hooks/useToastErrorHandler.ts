import { useCallback, useRef } from 'react';
import { useToast } from '../components/ToastProvider';

export interface ToastErrorHandlerOptions {
  onError?: (error: Error, context?: string) => void;
  logErrors?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  toastTitle?: string;
}

export interface UseToastErrorHandlerReturn {
  handleError: (error: Error, context?: string) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallback?: T
  ) => Promise<T | undefined>;
  wrapFunction: <T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: string
  ) => T;
  wrapAsyncFunction: <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: string
  ) => T;
}

export function useToastErrorHandler(options: ToastErrorHandlerOptions = {}): UseToastErrorHandlerReturn {
  const {
    onError,
    logErrors = true,
    retryAttempts = 0,
    retryDelay = 1000,
    toastTitle = 'Tour Error',
  } = options;

  const toast = useToast();
  const retryCountRef = useRef<Map<string, number>>(new Map());

  const handleError = useCallback((error: Error, context?: string) => {
    if (logErrors) {
      console.error(`Tour Error${context ? ` in ${context}` : ''}:`, error);
    }

    const message = context ? `Error in ${context}` : 'An error occurred';
    const details = `${error.message}\n\n${error.stack || ''}`;
    toast.showError(toastTitle, message, details);

    if (onError) {
      try {
        onError(error, context);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }
  }, [onError, logErrors, toast, toastTitle]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T | undefined> => {
    const contextKey = context || 'unknown';
    const currentRetries = retryCountRef.current.get(contextKey) || 0;

    try {
      const result = await asyncFn();
      retryCountRef.current.delete(contextKey);
      return result;
    } catch (error) {
      handleError(error as Error, context);

      if (currentRetries < retryAttempts) {
        retryCountRef.current.set(contextKey, currentRetries + 1);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        return handleAsyncError(asyncFn, context, fallback);
      }

      retryCountRef.current.delete(contextKey);
      
      return fallback;
    }
  }, [handleError, retryAttempts, retryDelay]);

  const wrapFunction = useCallback(<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        handleError(error as Error, context);
        throw error;
      }
    }) as T;
  }, [handleError]);

  const wrapAsyncFunction = useCallback(<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error as Error, context);
        throw error;
      }
    }) as T;
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    wrapFunction,
    wrapAsyncFunction,
  };
}
