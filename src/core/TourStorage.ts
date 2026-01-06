import { TourState } from '../types';

export class TourStorage {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  public saveState(state: TourState): void {
    try {
      const stateToSave = {
        currentStepIndex: state.currentStepIndex,
        completedSteps: state.completedSteps,
        skippedSteps: state.skippedSteps,
        isCompleted: false,
        isSkipped: false,
      };
      localStorage.setItem(this.key, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save tour state to localStorage:', error);
    }
  }

  public getState(): Partial<TourState> | null {
    try {
      const saved = localStorage.getItem(this.key);
      if (!saved) return null;
      
      return JSON.parse(saved);
    } catch (error) {
      console.warn('Failed to load tour state from localStorage:', error);
      return null;
    }
  }

  public clearState(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.warn('Failed to clear tour state from localStorage:', error);
    }
  }

  public hasState(): boolean {
    try {
      return localStorage.getItem(this.key) !== null;
    } catch (error) {
      return false;
    }
  }

  public saveCompletion(): void {
    try {
      const existing = this.getState() || {};
      const stateToSave = {
        ...existing,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.key, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save tour completion to localStorage:', error);
    }
  }

  public saveSkip(): void {
    try {
      const existing = this.getState() || {};
      const stateToSave = {
        ...existing,
        isSkipped: true,
        skippedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.key, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save tour skip to localStorage:', error);
    }
  }

  public isCompleted(): boolean {
    try {
      const saved = this.getState();
      return saved?.isCompleted === true;
    } catch (error) {
      return false;
    }
  }

  public isSkipped(): boolean {
    try {
      const saved = this.getState();
      return saved?.isSkipped === true;
    } catch (error) {
      return false;
    }
  }
}
