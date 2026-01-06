import React, { createContext, useContext, ReactNode } from 'react';
import { TourConfig, TourTheme } from '../types';
import { useTourEngine, UseTourEngineReturn } from '../hooks/useTourEngine';

interface TourContextValue extends UseTourEngineReturn {
  config: TourConfig;
  theme: TourTheme;
}

const TourContext = createContext<TourContextValue | null>(null);

export interface TourProviderProps {
  config: TourConfig;
  children: ReactNode;
}

const defaultTheme: TourTheme = {
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '12px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '14px',
  zIndex: 9999,
  overlay: {
    backgroundColor: '#000000',
    opacity: 0.5,
  },
  highlight: {
    borderColor: '#3b82f6',
    borderWidth: '4px',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    animation: 'tour-highlight-pulse 2s infinite',
  },
  popover: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxWidth: '384px',
  },
};

export function TourProvider({ config, children }: TourProviderProps) {
  const tourEngine = useTourEngine(config);
  const theme = { ...defaultTheme, ...config.theme };

  const contextValue: TourContextValue = {
    ...tourEngine,
    config,
    theme,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
