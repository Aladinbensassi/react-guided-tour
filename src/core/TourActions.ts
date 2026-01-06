import { TourAction, Integration } from '../types';

export class TourActions {
  private integrations: Map<string, Integration> = new Map();

  public registerIntegration(integration: Integration): void {
    this.integrations.set(integration.name, integration);
  }

  public unregisterIntegration(name: string): void {
    this.integrations.delete(name);
  }

  public async execute(action: TourAction, element?: HTMLElement): Promise<void> {
    // Find the appropriate integration for this action
    const integration = this.findIntegration(action);
    
    if (!integration) {
      // Fallback to default action handling
      await this.executeDefault(action, element);
      return;
    }

    try {
      await integration.execute(action, element);
    } catch (error) {
      console.error(`Integration ${integration.name} failed to execute action:`, error);
      // Fallback to default action handling
      await this.executeDefault(action, element);
    }
  }

  private findIntegration(action: TourAction): Integration | null {
    for (const integration of this.integrations.values()) {
      if (integration.canHandle(action)) {
        return integration;
      }
    }
    return null;
  }

  private async executeDefault(action: TourAction, element?: HTMLElement): Promise<void> {
    const delay = action.delay || 0;
    
    if (delay > 0) {
      await this.sleep(delay);
    }

    switch (action.type) {
      case 'click':
        await this.handleClick(action, element);
        break;
      case 'navigate':
        await this.handleNavigate(action);
        break;
      case 'highlight':
        // Highlighting is handled by the UI components
        break;
      case 'custom':
        if (action.handler) {
          await action.handler();
        }
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async handleClick(action: TourAction, element?: HTMLElement): Promise<void> {
    let targetElement = element;
    
    if (!targetElement && action.target) {
      targetElement = document.querySelector(action.target) as HTMLElement;
    }

    if (!targetElement) {
      throw new Error(`Click target not found: ${action.target}`);
    }

    // Ensure element is visible and clickable
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Wait a bit for scroll to complete
    await this.sleep(300);

    // Dispatch click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    
    targetElement.dispatchEvent(clickEvent);
  }

  private async handleNavigate(action: TourAction): Promise<void> {
    if (!action.target) {
      throw new Error('Navigate action requires a target URL');
    }

    // Check if it's a hash navigation (same page)
    if (action.target.startsWith('#')) {
      window.location.hash = action.target;
      return;
    }

    // Check if it's a relative path
    if (action.target.startsWith('/')) {
      window.location.pathname = action.target;
      return;
    }

    // Full URL navigation
    window.location.href = action.target;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getRegisteredIntegrations(): string[] {
    return Array.from(this.integrations.keys());
  }

  public hasIntegration(name: string): boolean {
    return this.integrations.has(name);
  }
}
