import { TourConfig, TourStep, TourState, TourEngineEvents, TourEventCallback } from '../types';
import { TourStorage } from './TourStorage';

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

  public async start(): Promise<void> {
    try {
      this.setState({ 
        isRunning: true,
        isLoading: true,
        error: null 
      });

      this.emit('tour-start', { tourId: this.config.id });
      
      await this.goToStep(this.state.currentStepIndex);
      
      // STOP HERE - don't auto-advance
      return;
    } catch (error) {
      console.error('Error in TourEngine.start():', error);
      this.handleError(error as Error);
    }
  }

  public async next(): Promise<void> {
    if (!this.state.isRunning) {
      return;
    }

    try {
      const currentStep = this.getCurrentStep();
      if (!currentStep) {
        return;
      }

      // Execute after step hook
      if (currentStep.afterStep) {
        await currentStep.afterStep();
      }

      // Mark step as completed
      this.markStepCompleted(currentStep.id);

      // Check if this is the last step
      if (this.state.currentStepIndex >= this.state.totalSteps - 1) {
        await this.complete();
        return;
      }

      // Go to next step
      const nextStepIndex = this.state.currentStepIndex + 1;
      await this.goToStep(nextStepIndex);
    } catch (error) {
      console.error('Error in TourEngine.next():', error);
      this.handleError(error as Error);
    }
  }

  public async previous(): Promise<void> {
    if (!this.state.isRunning || this.state.currentStepIndex <= 0) return;

    try {
      await this.goToStep(this.state.currentStepIndex - 1);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public async goToStep(index: number): Promise<void> {
    if (index < 0 || index >= this.state.totalSteps) return;

    try {
      this.setState({ isLoading: true });

      const step = this.config.steps[index];
      
      // Execute before step hook
      if (step.beforeStep) {
        await step.beforeStep();
      }

      // Wait for element if specified
      if (step.waitForElement && step.target) {
        await this.waitForElement(step.target, step.waitTimeout || 5000);
      }

      this.setState({
        currentStepIndex: index,
        currentStep: step,
        isLoading: false,
      });


      // Save state if persistence is enabled
      if (this.config.storage?.remember) {
        this.storage.saveState(this.state);
      }

      // Emit step change event
      this.emit('step-change', { step, index });
      
      if (this.config.onStepChange) {
        this.config.onStepChange(step, index);
      }
    } catch (error) {
      this.setState({ isLoading: false });
      this.handleError(error as Error);
    }
  }

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

      // Save skip state to localStorage
      if (this.config.storage?.remember) {
        this.storage.saveSkip();
      }

      await this.stop();
    } catch (error) {
      console.error('Error in TourEngine.skip():', error);
      this.handleError(error as Error);
    }
  }

  public async complete(): Promise<void> {
    try {
      this.setState({ isRunning: false, isCompleted: true });

      this.emit('tour-complete', { tourId: this.config.id });
      
      if (this.config.onComplete) {
        this.config.onComplete();
      }

      // Save completion state to localStorage
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

  public shouldShowTour(): boolean {
    if (!this.config.storage?.remember) return true;
    return !this.storage.isCompleted() && !this.storage.isSkipped();
  }

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
    this.setState({ 
      error: error.message,
      isLoading: false,
    });
    
    this.emit('error', { error, step: this.getCurrentStep() || undefined });
  }

  private setState(updates: Partial<TourState>): void {
    this.state = { ...this.state, ...updates };
    // Emit state change event to notify subscribers
    this.emit('state-change', this.state);
  }

  // Event system
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

  public subscribe(callback: (state: TourState) => void): () => void {
    const handler = () => callback(this.getState());
    
    // Listen to all events that might change state
    this.on('step-change', handler);
    this.on('tour-start', handler);
    this.on('tour-complete', handler);
    this.on('tour-skip', handler);
    this.on('error', handler);
    this.on('state-change', handler);

    // Return unsubscribe function
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
