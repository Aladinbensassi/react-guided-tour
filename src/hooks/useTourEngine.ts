import { useState, useEffect, useMemo, useCallback } from 'react';
import { TourEngine } from '../core/TourEngine';
import { TourActions } from '../core/TourActions';
import { TourConfig, TourState, TourStep } from '../types';
import { useErrorHandler } from './useErrorHandler';

export interface UseTourEngineReturn {
  state: TourState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  skip: () => Promise<void>;
  goToStep: (index: number) => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentStep: TourStep | null;
  engine: TourEngine;
  actions: TourActions;
}

/**
 * Hook that creates and manages a tour engine instance.
 * Provides tour control methods and state management with error handling.
 */
export function useTourEngine(config: TourConfig): UseTourEngineReturn {
  // Use regular error handler to avoid ToastProvider dependency issues
  const errorHandler = useErrorHandler({
    onError: (error, context) => {
      console.error(`Tour Engine Error in ${context}:`, error);
    },
    retryAttempts: 1,
    retryDelay: 500,
  });
  
  const { handleAsyncError } = errorHandler;

  const actions = useMemo(() => new TourActions(), []);
  
  const engine = useMemo(() => {
    const tourEngine = new TourEngine(config);
    return tourEngine;
  }, [config]);

  const [state, setState] = useState<TourState>(engine.getState());

  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    return unsubscribe;
  }, [engine]);

  const start = useCallback(async () => {
    await handleAsyncError(
      () => engine.start(),
      'tour start'
    );
  }, [engine, handleAsyncError]);

  const stop = useCallback(async () => {
    await engine.stop();
  }, [engine]);

  const next = useCallback(async () => {
    await handleAsyncError(async () => {
      const currentStep = engine.getCurrentStep();
      if (currentStep?.action) {
        // Execute the step action first
        await actions.execute(currentStep.action);
      }
      await engine.next();
    }, 'tour next');
  }, [engine, actions, handleAsyncError]);

  const previous = useCallback(async () => {
    await handleAsyncError(
      () => engine.previous(),
      'tour previous'
    );
  }, [engine, handleAsyncError]);

  const skip = useCallback(async () => {
    await handleAsyncError(
      () => engine.skip(),
      'tour skip'
    );
  }, [engine, handleAsyncError]);

  const goToStep = useCallback(async (index: number) => {
    await handleAsyncError(
      () => engine.goToStep(index),
      `tour goToStep(${index})`
    );
  }, [engine, handleAsyncError]);

  const memoizedReturn = useMemo(() => ({
    state,
    start,
    stop,
    next,
    previous,
    skip,
    goToStep,
    isFirstStep: engine.isFirstStep(),
    isLastStep: engine.isLastStep(),
    canGoNext: engine.canGoNext(),
    canGoPrevious: engine.canGoPrevious(),
    currentStep: engine.getCurrentStep(),
    engine,
    actions,
  }), [state, start, stop, next, previous, skip, goToStep, engine, actions]);

  return memoizedReturn;
}
