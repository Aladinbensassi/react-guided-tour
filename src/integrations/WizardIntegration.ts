import { Integration, TourAction } from '../types';

export class WizardIntegration implements Integration {
  name = 'wizard-integration';

  canHandle(action: TourAction): boolean {
    return action.type === 'wizard-step';
  }

  async execute(action: TourAction, element?: HTMLElement): Promise<void> {
    if (!action.target && !element) {
      throw new Error('Wizard integration requires either a target selector or element');
    }

    const targetElement = element || document.querySelector(action.target!) as HTMLElement;
    if (!targetElement) {
      throw new Error(`Wizard element not found: ${action.target}`);
    }

    const stepValue = typeof action.value === 'string' || typeof action.value === 'number' ? action.value : undefined;
    await this.handleWizardNavigation(targetElement, stepValue);
  }

  private async handleWizardNavigation(element: HTMLElement, stepValue?: string | number): Promise<void> {
    // Handle different wizard patterns
    
    // 1. Multi-step form wizards
    if (this.isFormWizard(element)) {
      await this.handleFormWizard(element, stepValue);
      return;
    }

    // 2. Stepper components (Material UI, Ant Design, etc.)
    if (this.isStepper(element)) {
      await this.handleStepper(element, stepValue);
      return;
    }

    // 3. Custom wizard with data attributes
    if (this.isCustomWizard(element)) {
      await this.handleCustomWizard(element, stepValue);
      return;
    }

    // 4. Generic next/previous buttons
    await this.handleGenericWizard(element);
  }

  private isFormWizard(element: HTMLElement): boolean {
    return element.closest('form') !== null ||
           element.closest('.wizard') !== null ||
           element.closest('.multi-step') !== null;
  }

  private async handleFormWizard(element: HTMLElement, stepValue?: string | number): Promise<void> {
    if (typeof stepValue === 'number') {
      // Navigate to specific step
      await this.navigateToStep(element, stepValue);
    } else if (this.isNextButton(element)) {
      // Click next button
      element.click();
      await this.waitForStepTransition();
    } else if (this.isPreviousButton(element)) {
      // Click previous button
      element.click();
      await this.waitForStepTransition();
    } else {
      // Generic click
      element.click();
      await this.waitForStepTransition();
    }
  }

  private isStepper(element: HTMLElement): boolean {
    return element.classList.contains('MuiStepper-root') ||
           element.classList.contains('ant-steps') ||
           element.closest('.stepper') !== null ||
           element.closest('[role="progressbar"]') !== null;
  }

  private async handleStepper(element: HTMLElement, stepValue?: string | number): Promise<void> {
    if (typeof stepValue === 'number') {
      // Find and click specific step
      const stepElement = this.findStepByIndex(element, stepValue);
      if (stepElement) {
        stepElement.click();
        await this.waitForStepTransition();
        return;
      }
    }

    // Click the provided element
    element.click();
    await this.waitForStepTransition();
  }

  private isCustomWizard(element: HTMLElement): boolean {
    return element.hasAttribute('data-wizard-step') ||
           element.hasAttribute('data-step') ||
           element.closest('[data-wizard]') !== null;
  }

  private async handleCustomWizard(element: HTMLElement, stepValue?: string | number): Promise<void> {
    const wizard = element.closest('[data-wizard]');
    
    if (stepValue && wizard) {
      // Try to find specific step
      const stepElement = wizard.querySelector(`[data-step="${stepValue}"], [data-wizard-step="${stepValue}"]`) as HTMLElement;
      if (stepElement) {
        stepElement.click();
        await this.waitForStepTransition();
        return;
      }
    }

    // Click the provided element
    element.click();
    await this.waitForStepTransition();
  }

  private async handleGenericWizard(element: HTMLElement): Promise<void> {
    element.click();
    await this.waitForStepTransition();
  }

  private isNextButton(element: HTMLElement): boolean {
    const text = element.textContent?.toLowerCase() || '';
    return text.includes('next') ||
           text.includes('continue') ||
           text.includes('proceed') ||
           element.classList.contains('next') ||
           element.hasAttribute('data-next');
  }

  private isPreviousButton(element: HTMLElement): boolean {
    const text = element.textContent?.toLowerCase() || '';
    return text.includes('previous') ||
           text.includes('back') ||
           element.classList.contains('previous') ||
           element.classList.contains('back') ||
           element.hasAttribute('data-previous');
  }

  private async navigateToStep(container: HTMLElement, stepIndex: number): Promise<void> {
    // Try different methods to navigate to a specific step
    
    // Method 1: Find step by index in stepper
    const stepElement = this.findStepByIndex(container, stepIndex);
    if (stepElement) {
      stepElement.click();
      await this.waitForStepTransition();
      return;
    }

    // Method 2: Use next/previous buttons to reach target step
    const currentStep = this.getCurrentStepIndex(container);
    if (currentStep !== null) {
      const diff = stepIndex - currentStep;
      if (diff > 0) {
        // Go forward
        for (let i = 0; i < diff; i++) {
          const nextButton = this.findNextButton(container);
          if (nextButton) {
            nextButton.click();
            await this.waitForStepTransition();
          }
        }
      } else if (diff < 0) {
        // Go backward
        for (let i = 0; i < Math.abs(diff); i++) {
          const prevButton = this.findPreviousButton(container);
          if (prevButton) {
            prevButton.click();
            await this.waitForStepTransition();
          }
        }
      }
    }
  }

  private findStepByIndex(container: HTMLElement, index: number): HTMLElement | null {
    // Try different selectors for step elements
    const selectors = [
      `.step:nth-child(${index + 1})`,
      `[data-step="${index}"]`,
      `[data-wizard-step="${index}"]`,
      `.MuiStep-root:nth-child(${index + 1})`,
      `.ant-steps-item:nth-child(${index + 1})`,
    ];

    for (const selector of selectors) {
      const element = container.querySelector(selector) as HTMLElement;
      if (element) return element;
    }

    return null;
  }

  private getCurrentStepIndex(container: HTMLElement): number | null {
    // Try to determine current step index
    const activeStep = container.querySelector('.active, .current, .MuiStep-active, .ant-steps-item-active') as HTMLElement;
    if (activeStep) {
      const steps = container.querySelectorAll('.step, .MuiStep-root, .ant-steps-item');
      return Array.from(steps).indexOf(activeStep);
    }

    return null;
  }

  private findNextButton(container: HTMLElement): HTMLElement | null {
    const selectors = [
      'button[data-next]',
      '.next-button',
      'button:contains("Next")',
      'button:contains("Continue")',
      '.wizard-next',
    ];

    for (const selector of selectors) {
      const element = container.querySelector(selector) as HTMLElement;
      if (element) return element;
    }

    // Fallback: find button with "next" text
    const buttons = container.querySelectorAll('button');
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('next') || text.includes('continue')) {
        return button;
      }
    }

    return null;
  }

  private findPreviousButton(container: HTMLElement): HTMLElement | null {
    const selectors = [
      'button[data-previous]',
      '.previous-button',
      '.back-button',
      'button:contains("Previous")',
      'button:contains("Back")',
      '.wizard-previous',
    ];

    for (const selector of selectors) {
      const element = container.querySelector(selector) as HTMLElement;
      if (element) return element;
    }

    // Fallback: find button with "previous" or "back" text
    const buttons = container.querySelectorAll('button');
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('previous') || text.includes('back')) {
        return button;
      }
    }

    return null;
  }

  private async waitForStepTransition(): Promise<void> {
    // Wait for step transition animation/content change
    return new Promise(resolve => {
      setTimeout(resolve, 400); // Allow time for transition
    });
  }
}
