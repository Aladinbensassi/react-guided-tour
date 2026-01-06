import { useCallback, useRef } from 'react';

export interface ErrorHandlerOptions {
  onError?: (error: Error, context?: string) => void;
  logErrors?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface UseErrorHandlerReturn {
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

export function useErrorHandler(options: ErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    onError,
    logErrors = true,
    retryAttempts = 0,
    retryDelay = 1000,
  } = options;

  const retryCountRef = useRef<Map<string, number>>(new Map());

  const handleError = useCallback((error: Error, context?: string) => {
    if (logErrors) {
      console.error(`Tour Error${context ? ` in ${context}` : ''}:`, error);
    }

    if (onError) {
      try {
        onError(error, context);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }
  }, [onError, logErrors]);

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
        throw error; // Re-throw to maintain original behavior
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

// Utility function for creating error-safe async operations
export function createSafeAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    context?: string;
    fallback?: T;
    onError?: (error: Error) => void;
    retryAttempts?: number;
    retryDelay?: number;
  } = {}
) {
  const {
    context,
    fallback,
    onError,
    retryAttempts = 0,
    retryDelay = 1000,
  } = options;

  return async (): Promise<T | undefined> => {
    let attempts = 0;
    
    while (attempts <= retryAttempts) {
      try {
        return await operation();
      } catch (error) {
        const errorObj = error as Error;
        
        // Log error
        console.error(`Error in ${context || 'async operation'} (attempt ${attempts + 1}):`, errorObj);
        
        // Call custom error handler
        if (onError) {
          onError(errorObj);
        }
        
        attempts++;
        
        // If we've exhausted retries, return fallback
        if (attempts > retryAttempts) {
          return fallback;
        }
        
        // Wait before retrying
        if (retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    return fallback;
  };
}

// Error boundary hook for functional components
export function useErrorBoundary() {
  const handleError = useCallback((error: Error, errorInfo?: { componentStack: string }) => {
    // This will be caught by the nearest ErrorBoundary
    throw error;
  }, []);

  return { handleError };
}
