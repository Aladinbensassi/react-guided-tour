import { TourAction, Integration } from '../types';

/**
 * Manages and executes tour actions with pluggable integration support.
 * Handles clicks, navigation, and custom actions through registered integrations.
 */
export class TourActions {
  private integrations: Map<string, Integration> = new Map();

  public registerIntegration(integration: Integration): void {
    this.integrations.set(integration.name, integration);
  }

  public unregisterIntegration(name: string): void {
    this.integrations.delete(name);
  }

  /**
   * Executes a tour action using the appropriate integration or default handler.
   */
  public async execute(action: TourAction, element?: HTMLElement): Promise<void> {
    const integration = this.findIntegration(action);
    
    if (!integration) {
      await this.executeDefault(action, element);
      return;
    }

    try {
      await integration.execute(action, element);
    } catch (error) {
      console.error(`Integration ${integration.name} failed to execute action:`, error);
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

  /**
   * Default action handler for built-in action types.
   */
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

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    await this.sleep(300);

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

    if (action.target.startsWith('#')) {
      window.location.hash = action.target;
      return;
    }

    if (action.target.startsWith('/')) {
      window.location.pathname = action.target;
      return;
    }

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
