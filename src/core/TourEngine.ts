import { TourConfig, TourStep, TourState, TourEngineEvents, TourEventCallback } from '../types';
import { TourStorage } from './TourStorage';

/**
 * Core tour engine that manages tour state, navigation, and lifecycle.
 * Handles step progression, state persistence, and event emission.
 */
export class TourEngine {
  private config: TourConfig;
  private state: TourState;
  private storage: TourStorage;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor(config: TourConfig) {
    this.config = config;
    this.storage = new TourStorage(config.storage?.key || `tour-${config.id}`);
    this.state = this.initializeState();
  }

  private initializeState(): TourState {
    const savedState = this.config.storage?.remember ? this.storage.getState() : null;
    
    return {
      isRunning: false,
      currentStepIndex: savedState?.currentStepIndex || 0,
      currentStep: null,
      totalSteps: this.config.steps.length,
      isLoading: false,
      error: null,
      completedSteps: savedState?.completedSteps || [],
      skippedSteps: savedState?.skippedSteps || [],
      isCompleted: savedState?.isCompleted || false,
      isSkipped: savedState?.isSkipped || false,
      completedAt: savedState?.completedAt,
      skippedAt: savedState?.skippedAt,
    };
  }

  public getState(): TourState {
    return { ...this.state };
  }

  public getConfig(): TourConfig {
    return { ...this.config };
  }

  /**
   * Starts the tour from the current step index.
   */
  public async start(): Promise<void> {
    try {
      this.setState({ 
        isRunning: true,
        isLoading: true,
        error: null 
      });

      this.emit('tour-start', { tourId: this.config.id });
      
      await this.goToStep(this.state.currentStepIndex);
      
      return;
    } catch (error) {
      const errorObj = error as Error;
      console.error('Error in TourEngine.start():', errorObj);
      this.handleError(errorObj);
      
      this.setState({ 
        isRunning: false,
        isLoading: false 
      });
      
      throw errorObj;
    }
  }

  /**
   * Advances to the next step in the tour.
   */
  public async next(): Promise<void> {
    if (!this.state.isRunning) {
      return;
    }

    try {
      const currentStep = this.getCurrentStep();
      if (!currentStep) {
        throw new Error('No current step available for next operation');
      }

      if (currentStep.afterStep) {
        try {
          await currentStep.afterStep();
        } catch (hookError) {
          console.warn('Error in afterStep hook:', hookError);
        }
      }

      this.markStepCompleted(currentStep.id);

      if (this.state.currentStepIndex >= this.state.totalSteps - 1) {
        await this.complete();
        return;
      }

      const nextStepIndex = this.state.currentStepIndex + 1;
      await this.goToStep(nextStepIndex);
    } catch (error) {
      const errorObj = error as Error;
      console.error('Error in TourEngine.next():', errorObj);
      this.handleError(errorObj);
      throw errorObj;
    }
  }

  /**
   * Goes back to the previous step in the tour.
   */
  public async previous(): Promise<void> {
    if (!this.state.isRunning || this.state.currentStepIndex <= 0) return;

    try {
      await this.goToStep(this.state.currentStepIndex - 1);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Navigates to a specific step by index.
   */
  public async goToStep(index: number): Promise<void> {
    if (index < 0 || index >= this.state.totalSteps) {
      throw new Error(`Invalid step index: ${index}. Must be between 0 and ${this.state.totalSteps - 1}`);
    }

    try {
      this.setState({ isLoading: true });

      const step = this.config.steps[index];
      
      if (step.beforeStep) {
        try {
          await step.beforeStep();
        } catch (hookError) {
          console.warn('Error in beforeStep hook:', hookError);
        }
      }

      if (step.waitForElement && step.target) {
        try {
          await this.waitForElement(step.target, step.waitTimeout || 5000);
        } catch (waitError) {
          console.warn(`Element not found: ${step.target}. Continuing anyway.`);
        }
      }

      this.setState({
        currentStepIndex: index,
        currentStep: step,
        isLoading: false,
      });

      if (this.config.storage?.remember) {
        try {
          this.storage.saveState(this.state);
        } catch (storageError) {
          console.warn('Failed to save tour state:', storageError);
        }
      }

      this.emit('step-change', { step, index });
      
      if (this.config.onStepChange) {
        try {
          this.config.onStepChange(step, index);
        } catch (callbackError) {
          console.warn('Error in onStepChange callback:', callbackError);
        }
      }
    } catch (error) {
      this.setState({ isLoading: false });
      const errorObj = error as Error;
      this.handleError(errorObj);
      throw errorObj;
    }
  }

  /**
   * Skips the current tour and marks it as skipped.
   */
  public async skip(): Promise<void> {
    if (!this.state.isRunning) return;

    try {
      const currentStep = this.getCurrentStep();
      if (currentStep) {
        this.markStepSkipped(currentStep.id);
      }

      this.setState({ isSkipped: true });

      this.emit('tour-skip', { tourId: this.config.id, stepIndex: this.state.currentStepIndex });
      
      if (this.config.onSkip) {
        this.config.onSkip();
      }

      if (this.config.storage?.remember) {
        this.storage.saveSkip();
      }

      await this.stop();
    } catch (error) {
      console.error('Error in TourEngine.skip():', error);
      this.handleError(error as Error);
    }
  }

  /**
   * Completes the tour and marks it as finished.
   */
  public async complete(): Promise<void> {
    try {
      this.setState({ isRunning: false, isCompleted: true });

      this.emit('tour-complete', { tourId: this.config.id });
      
      if (this.config.onComplete) {
        this.config.onComplete();
      }

      if (this.config.storage?.remember) {
        this.storage.saveCompletion();
      }
    } catch (error) {
      console.error('Error in TourEngine.complete():', error);
      this.handleError(error as Error);
    }
  }

  public async stop(): Promise<void> {
    this.setState({ 
      isRunning: false,
      currentStep: null,
    });
  }

  public getCurrentStep(): TourStep | null {
    return this.state.currentStep;
  }

  public isFirstStep(): boolean {
    return this.state.currentStepIndex === 0;
  }

  public isLastStep(): boolean {
    return this.state.currentStepIndex === this.state.totalSteps - 1;
  }

  public canGoNext(): boolean {
    return this.state.isRunning && !this.isLastStep() && !this.state.isLoading;
  }

  public canGoPrevious(): boolean {
    return this.state.isRunning && !this.isFirstStep() && !this.state.isLoading;
  }

  /**
   * Determines if the tour should be shown based on completion/skip state.
   */
  public shouldShowTour(): boolean {
    if (!this.config.storage?.remember) return true;
    return !this.storage.isCompleted() && !this.storage.isSkipped();
  }

  /**
   * Resets tour state and clears localStorage.
   */
  public resetTourState(): void {
    if (this.config.storage?.remember) {
      this.storage.clearState();
    }
    this.state = this.initializeState();
  }

  private async waitForElement(selector: string, timeout: number): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });

      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element not found: ${selector}`));
      }, timeout);

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  private markStepCompleted(stepId: string): void {
    if (!this.state.completedSteps.includes(stepId)) {
      this.setState({
        completedSteps: [...this.state.completedSteps, stepId],
      });
    }
  }

  private markStepSkipped(stepId: string): void {
    if (!this.state.skippedSteps.includes(stepId)) {
      this.setState({
        skippedSteps: [...this.state.skippedSteps, stepId],
      });
    }
  }

  private handleError(error: Error): void {
    const errorMessage = error.message || 'Unknown error occurred';
    const currentStep = this.getCurrentStep();
    
    this.setState({ 
      error: errorMessage,
      isLoading: false,
    });
    
    this.emit('error', { 
      error, 
      step: currentStep || undefined,
      tourId: this.config.id,
      stepIndex: this.state.currentStepIndex,
      timestamp: new Date().toISOString()
    });
    
    console.error('TourEngine Error Details:', {
      message: errorMessage,
      stack: error.stack,
      tourId: this.config.id,
      currentStep: currentStep?.id,
      stepIndex: this.state.currentStepIndex,
      state: this.state
    });
  }

  private setState(updates: Partial<TourState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('state-change', this.state);
  }

  public on<K extends keyof TourEngineEvents>(
    event: K,
    callback: TourEventCallback<TourEngineEvents[K]>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as (data: unknown) => void);
  }

  public off<K extends keyof TourEngineEvents>(
    event: K,
    callback: TourEventCallback<TourEngineEvents[K]>
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as (data: unknown) => void);
    }
  }

  private emit<K extends keyof TourEngineEvents>(
    event: K,
    data: TourEngineEvents[K]
  ): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Subscribes to tour state changes.
   * Returns an unsubscribe function.
   */
  public subscribe(callback: (state: TourState) => void): () => void {
    const handler = () => callback(this.getState());
    
    this.on('step-change', handler);
    this.on('tour-start', handler);
    this.on('tour-complete', handler);
    this.on('tour-skip', handler);
    this.on('error', handler);
    this.on('state-change', handler);

    return () => {
      this.off('step-change', handler);
      this.off('tour-start', handler);
      this.off('tour-complete', handler);
      this.off('tour-skip', handler);
      this.off('error', handler);
      this.off('state-change', handler);
    };
  }
}
