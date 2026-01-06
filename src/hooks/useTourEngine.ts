import { useState, useEffect, useMemo, useCallback } from 'react';
import { TourEngine } from '../core/TourEngine';
import { TourActions } from '../core/TourActions';
import { TourConfig, TourState, TourStep } from '../types';

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

export function useTourEngine(config: TourConfig): UseTourEngineReturn {
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
    try {
      await engine.start();
    } catch (error) {
      console.error('Error in useTourEngine.start():', error);
    }
  }, [engine]);

  const stop = useCallback(async () => {
    await engine.stop();
  }, [engine]);

  const next = useCallback(async () => {
    const currentStep = engine.getCurrentStep();
    if (currentStep?.action) {
      // Execute the step action first
      await actions.execute(currentStep.action);
    }
    await engine.next();
  }, [engine, actions]);

  const previous = useCallback(async () => {
    await engine.previous();
  }, [engine]);

  const skip = useCallback(async () => {
    await engine.skip();
  }, [engine]);

  const goToStep = useCallback(async (index: number) => {
    await engine.goToStep(index);
  }, [engine]);

  return {
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
  };
}
