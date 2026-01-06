import { ElementPosition, PopoverPosition } from '../types';

/**
 * Gets the absolute position of an element relative to the document.
 */
export function getElementPosition(element: HTMLElement): ElementPosition {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    width: rect.width,
    height: rect.height,
    right: rect.right + scrollLeft,
    bottom: rect.bottom + scrollTop,
  };
}

/**
 * Calculates the optimal position for a popover relative to a target element.
 * Falls back to alternative placements if the preferred placement doesn't fit.
 */
export function calculatePopoverPosition(
  targetElement: HTMLElement,
  popoverElement: HTMLElement,
  preferredPlacement: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'top'
): PopoverPosition {
  const targetPos = getElementPosition(targetElement);
  const popoverRect = popoverElement.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollTop: window.pageYOffset || document.documentElement.scrollTop,
    scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
  };

  const spacing = 12;
  const positions = {
    top: {
      top: targetPos.top - popoverRect.height - spacing,
      left: targetPos.left + (targetPos.width - popoverRect.width) / 2,
      placement: 'top' as const,
    },
    bottom: {
      top: targetPos.bottom + spacing,
      left: targetPos.left + (targetPos.width - popoverRect.width) / 2,
      placement: 'bottom' as const,
    },
    left: {
      top: targetPos.top + (targetPos.height - popoverRect.height) / 2,
      left: targetPos.left - popoverRect.width - spacing,
      placement: 'left' as const,
    },
    right: {
      top: targetPos.top + (targetPos.height - popoverRect.height) / 2,
      left: targetPos.right + spacing,
      placement: 'right' as const,
    },
    center: {
      top: viewport.scrollTop + (viewport.height - popoverRect.height) / 2,
      left: viewport.scrollLeft + (viewport.width - popoverRect.width) / 2,
      placement: 'center' as const,
    },
  };

  // Try preferred placement first
  const preferred = positions[preferredPlacement];
  if (isPositionInViewport(preferred, popoverRect, viewport)) {
    return preferred;
  }

  // Try fallback placements in order of preference
  const fallbackOrder: Array<keyof typeof positions> = ['bottom', 'top', 'right', 'left', 'center'];
  
  for (const placement of fallbackOrder) {
    if (placement === preferredPlacement) continue;
    
    const position = positions[placement];
    if (isPositionInViewport(position, popoverRect, viewport)) {
      return position;
    }
  }

  return positions.center;
}

function isPositionInViewport(
  position: { top: number; left: number },
  popoverRect: { width: number; height: number },
  viewport: { width: number; height: number; scrollTop: number; scrollLeft: number }
): boolean {
  const margin = 16;
  
  return (
    position.left >= viewport.scrollLeft + margin &&
    position.left + popoverRect.width <= viewport.scrollLeft + viewport.width - margin &&
    position.top >= viewport.scrollTop + margin &&
    position.top + popoverRect.height <= viewport.scrollTop + viewport.height - margin
  );
}

/**
 * Smoothly scrolls an element into view.
 */
export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
  element.scrollIntoView({
    behavior,
    block: 'center',
    inline: 'center',
  });
}

/**
 * Checks if an element is currently visible in the viewport.
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

export function getViewportCenter(): { x: number; y: number } {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}
