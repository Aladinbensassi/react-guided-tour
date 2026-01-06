import { Integration, TourAction } from '../types';

export class TabIntegration implements Integration {
  name = 'tab-integration';

  canHandle(action: TourAction): boolean {
    return action.type === 'tab-switch';
  }

  async execute(action: TourAction, element?: HTMLElement): Promise<void> {
    if (!action.target && !element) {
      throw new Error('Tab integration requires either a target selector or element');
    }

    const targetElement = element || document.querySelector(action.target!) as HTMLElement;
    if (!targetElement) {
      throw new Error(`Tab element not found: ${action.target}`);
    }

    // Handle different tab implementations
    const tabValue = typeof action.value === 'string' ? action.value : undefined;
    await this.handleTabClick(targetElement, tabValue);
  }

  private async handleTabClick(tabElement: HTMLElement, tabValue?: string): Promise<void> {
    // Check for common tab patterns
    
    // 1. Radix UI Tabs
    if (this.isRadixTab(tabElement)) {
      await this.handleRadixTab(tabElement);
      return;
    }

    // 2. Material UI Tabs
    if (this.isMaterialUITab(tabElement)) {
      await this.handleMaterialUITab(tabElement);
      return;
    }

    // 3. React Router tabs (links)
    if (this.isRouterTab(tabElement)) {
      await this.handleRouterTab(tabElement);
      return;
    }

    // 4. Custom tabs with data attributes
    if (this.isCustomTab(tabElement)) {
      await this.handleCustomTab(tabElement, tabValue);
      return;
    }

    // 5. Generic button/clickable tab
    await this.handleGenericTab(tabElement);
  }

  private isRadixTab(element: HTMLElement): boolean {
    return element.hasAttribute('data-radix-collection-item') ||
           element.getAttribute('role') === 'tab' ||
           element.closest('[data-radix-tabs-root]') !== null;
  }

  private async handleRadixTab(element: HTMLElement): Promise<void> {
    // Radix tabs use standard click events
    element.click();
    await this.waitForTabChange();
  }

  private isMaterialUITab(element: HTMLElement): boolean {
    return element.classList.contains('MuiTab-root') ||
           element.closest('.MuiTabs-root') !== null;
  }

  private async handleMaterialUITab(element: HTMLElement): Promise<void> {
    // Material UI tabs use click events
    element.click();
    await this.waitForTabChange();
  }

  private isRouterTab(element: HTMLElement): boolean {
    return element.tagName === 'A' ||
           element.hasAttribute('href') ||
           element.closest('a[href]') !== null;
  }

  private async handleRouterTab(element: HTMLElement): Promise<void> {
    const linkElement = element.tagName === 'A' ? element : element.closest('a') as HTMLAnchorElement;
    if (linkElement) {
      linkElement.click();
      await this.waitForNavigation();
    }
  }

  private isCustomTab(element: HTMLElement): boolean {
    return element.hasAttribute('data-tab') ||
           element.hasAttribute('data-tab-id') ||
           element.hasAttribute('data-value');
  }

  private async handleCustomTab(element: HTMLElement, tabValue?: string): Promise<void> {
    // Try to find and activate the correct tab
    if (tabValue) {
      const tabContainer = element.closest('[role="tablist"]') || 
                          element.closest('.tabs') ||
                          element.parentElement;
      
      if (tabContainer) {
        const targetTab = tabContainer.querySelector(`[data-tab="${tabValue}"], [data-tab-id="${tabValue}"], [data-value="${tabValue}"]`) as HTMLElement;
        if (targetTab) {
          targetTab.click();
          await this.waitForTabChange();
          return;
        }
      }
    }

    // Fallback to clicking the provided element
    element.click();
    await this.waitForTabChange();
  }

  private async handleGenericTab(element: HTMLElement): Promise<void> {
    // Generic click handling
    element.click();
    await this.waitForTabChange();
  }

  private async waitForTabChange(): Promise<void> {
    // Wait for tab content to change
    return new Promise(resolve => {
      setTimeout(resolve, 300); // Allow time for tab transition
    });
  }

  private async waitForNavigation(): Promise<void> {
    // Wait for potential page navigation
    return new Promise(resolve => {
      setTimeout(resolve, 500); // Allow time for navigation
    });
  }
}
