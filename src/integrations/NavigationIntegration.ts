import { Integration, TourAction } from '../types';

interface NavigationOptions {
  replace?: boolean;
  state?: Record<string, unknown>;
  timeout?: number;
  [key: string]: unknown;
}

export class NavigationIntegration implements Integration {
  name = 'navigation-integration';

  canHandle(action: TourAction): boolean {
    return action.type === 'navigate';
  }

  async execute(action: TourAction, _element?: HTMLElement): Promise<void> {
    if (!action.target) {
      throw new Error('Navigation integration requires a target URL or path');
    }

    const options = typeof action.value === 'object' && action.value !== null ? action.value as NavigationOptions : undefined;
    await this.handleNavigation(action.target, options);
  }

  private async handleNavigation(target: string, options?: NavigationOptions): Promise<void> {
    // Handle different navigation patterns
    
    // 1. Hash navigation (same page)
    if (target.startsWith('#')) {
      await this.handleHashNavigation(target);
      return;
    }

    // 2. Relative path navigation
    if (target.startsWith('/')) {
      await this.handlePathNavigation(target, options);
      return;
    }

    // 3. Query parameter navigation
    if (target.includes('?') || target.includes('&')) {
      await this.handleQueryNavigation(target, options);
      return;
    }

    // 4. Full URL navigation
    if (target.startsWith('http')) {
      await this.handleUrlNavigation(target, options);
      return;
    }

    // 5. Router navigation (for SPAs)
    await this.handleRouterNavigation(target, options);
  }

  private async handleHashNavigation(hash: string): Promise<void> {
    // Update hash without page reload
    window.location.hash = hash;
    
    // Wait for potential scroll or content change
    await this.waitForNavigation(200);
    
    // Try to scroll to element if it exists
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private async handlePathNavigation(path: string, options?: NavigationOptions): Promise<void> {
    // Check if we're in a SPA with router
    if (this.isSPA()) {
      await this.handleSPANavigation(path, options);
    } else {
      // Traditional navigation
      if (options?.replace) {
        window.location.replace(path);
      } else {
        window.location.href = path;
      }
    }
  }

  private async handleQueryNavigation(target: string, options?: NavigationOptions): Promise<void> {
    const url = new URL(window.location.href);
    
    // Parse query parameters from target
    if (target.startsWith('?')) {
      // Replace entire query string
      url.search = target;
    } else if (target.startsWith('&')) {
      // Append to existing query string
      url.search += target;
    } else {
      // Parse key=value pairs
      const params = new URLSearchParams(target);
      params.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
    }

    // Update URL
    if (options?.replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }

    // Trigger popstate event for SPAs
    window.dispatchEvent(new PopStateEvent('popstate'));
    await this.waitForNavigation(300);
  }

  private async handleUrlNavigation(url: string, options?: NavigationOptions): Promise<void> {
    if (options?.newTab) {
      window.open(url, '_blank');
    } else if (options?.replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  }

  private async handleRouterNavigation(path: string, options?: NavigationOptions): Promise<void> {
    // Try different router patterns
    
    // 1. React Router
    if (this.hasReactRouter()) {
      await this.handleReactRouter(path, options);
      return;
    }

    // 2. Vue Router
    if (this.hasVueRouter()) {
      await this.handleVueRouter(path, options);
      return;
    }

    // 3. Next.js Router
    if (this.hasNextRouter()) {
      await this.handleNextRouter(path, options);
      return;
    }

    // 4. Generic SPA navigation
    await this.handleSPANavigation(path, options);
  }

  private async handleSPANavigation(path: string, options?: NavigationOptions): Promise<void> {
    // Generic SPA navigation using History API
    const url = new URL(path, window.location.origin);
    
    if (options?.replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }

    // Trigger popstate event
    window.dispatchEvent(new PopStateEvent('popstate'));
    await this.waitForNavigation(500);
  }

  private isSPA(): boolean {
    // Detect if we're in a Single Page Application
    return !!(
      window.history &&
      (this.hasReactRouter() || this.hasVueRouter() || this.hasNextRouter() || this.hasGenericSPA())
    );
  }

  private hasReactRouter(): boolean {
    // Check for React Router presence
    return !!(
      (window as unknown as Record<string, unknown>).__reactRouter ||
      document.querySelector('[data-reactroot]') ||
      document.querySelector('#root') ||
      document.querySelector('#__next')
    );
  }

  private hasVueRouter(): boolean {
    // Check for Vue Router presence
    return !!(
      (window as unknown as Record<string, unknown>).Vue ||
      document.querySelector('[data-v-]') ||
      document.querySelector('#app')
    );
  }

  private hasNextRouter(): boolean {
    // Check for Next.js presence
    return !!(
      (window as unknown as Record<string, unknown>).__NEXT_DATA__ ||
      document.querySelector('#__next')
    );
  }

  private hasGenericSPA(): boolean {
    // Check for generic SPA indicators
    return !!(
      document.querySelector('[data-spa]') ||
      document.querySelector('[data-router]') ||
      window.location.pathname !== '/' && !window.location.pathname.includes('.')
    );
  }

  private async detectAndCallRouter(path: string, options?: NavigationOptions): Promise<boolean> {
    const router: unknown = (window as unknown as Record<string, unknown>).router || (window as unknown as Record<string, unknown>).__ROUTER__ || null;
    const method: 'push' | 'replace' = options?.replace ? 'replace' : 'push';
    if (router && typeof router === 'object' && router !== null && method in router && typeof (router as Record<string, unknown>)[method] === 'function') {
      await ((router as Record<string, unknown>)[method] as (path: string, options?: NavigationOptions) => Promise<void>)(path, options);
      return true;
    }
    return false;
  }

  private async handleReactRouter(path: string, options?: NavigationOptions): Promise<void> {
    // Try to use React Router's navigate function if available
    const navigate: unknown = (window as unknown as Record<string, unknown>).__reactRouterNavigate;
    if (navigate) {
      await (navigate as (path: string, options?: NavigationOptions) => Promise<void>)(path, options);
    } else {
      // Fallback to history API
      await this.handleSPANavigation(path, options);
    }
  }

  private async handleVueRouter(path: string, options?: NavigationOptions): Promise<void> {
    // Try to use Vue Router's push/replace methods
    const vueRouter: unknown = (window as unknown as Record<string, unknown>).router || (window as unknown as Record<string, unknown>).__ROUTER__ || null;
    if (vueRouter && typeof vueRouter === 'object' && vueRouter !== null) {
      const router = vueRouter as Record<string, unknown>;
      if (options?.replace && typeof router.replace === 'function') {
        await (router.replace as (path: string) => Promise<void>)(path);
      } else if (typeof router.push === 'function') {
        await (router.push as (path: string) => Promise<void>)(path);
      }
    } else {
      // Fallback to history API
      await this.handleSPANavigation(path, options);
    }
  }

  private async handleNextRouter(path: string, options?: NavigationOptions): Promise<void> {
    // Try to use Next.js router
    const nextRouter: unknown = (window as unknown as Record<string, unknown>).__nextRouter;
    if (nextRouter && typeof nextRouter === 'object' && nextRouter !== null) {
      const router = nextRouter as Record<string, unknown>;
      if (options?.replace && typeof router.replace === 'function') {
        await (router.replace as (path: string) => Promise<void>)(path);
      } else if (typeof router.push === 'function') {
        await (router.push as (path: string) => Promise<void>)(path);
      }
    } else {
      // Fallback to history API
      await this.handleSPANavigation(path, options);
    }
  }

  private async waitForNavigation(delay: number = 300): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, delay);
    });
  }
}
