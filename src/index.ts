// Core exports
export { TourEngine } from './core/TourEngine';
export { TourActions } from './core/TourActions';
export { TourStorage } from './core/TourStorage';

// React components
export { TourProvider, useTour } from './components/TourProvider';
export { TourRunner } from './components/TourRunner';
export { TourOverlay } from './components/TourOverlay';
export { TourPopover } from './components/TourPopover';
export { ErrorBoundary, withErrorBoundary } from './components/ErrorBoundary';
export { ToastProvider, useToast } from './components/ToastProvider';
export { Toast } from './components/Toast';

// Hooks
export { useTourEngine } from './hooks/useTourEngine';
export { useTourHighlight } from './hooks/useTourHighlight';
export { useErrorHandler, useErrorBoundary, createSafeAsyncOperation } from './hooks/useErrorHandler';
export { useToastErrorHandler } from './hooks/useToastErrorHandler';

// Integrations
export { TabIntegration } from './integrations/TabIntegration';
export { WizardIntegration } from './integrations/WizardIntegration';
export { NavigationIntegration } from './integrations/NavigationIntegration';

// Utilities
export * from './utils/positioning';

// Types
export type {
  TourStep,
  TourAction,
  TourConfig,
  TourState,
  TourTheme,
  HighlightConfig,
  PopoverConfig,
  Integration,
  TourEngineEvents,
  TourEventCallback,
  ElementPosition,
  PopoverPosition,
} from './types';

// Re-export hook return types for convenience
export type { UseTourEngineReturn } from './hooks/useTourEngine';
export type { UseTourHighlightReturn } from './hooks/useTourHighlight';
