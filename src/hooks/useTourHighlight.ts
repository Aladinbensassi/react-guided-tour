import { useState, useEffect, useRef } from 'react';
import { TourStep, HighlightConfig } from '../types';
import { getElementPosition, scrollToElement, isElementInViewport } from '../utils/positioning';

export interface UseTourHighlightReturn {
  targetElement: HTMLElement | null;
  highlightStyle: React.CSSProperties;
  isVisible: boolean;
}

export function useTourHighlight(step: TourStep | null): UseTourHighlightReturn {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (!step?.target) {
      setTargetElement(null);
      setIsVisible(false);
      return;
    }

    const findAndHighlightElement = () => {
      const element = step.highlight?.element || 
                    document.querySelector(step.target!) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        updateHighlightStyle(element, step.highlight);
        setIsVisible(true);

        // Scroll to element if not in viewport
        if (!isElementInViewport(element)) {
          scrollToElement(element);
        }
      } else {
        setTargetElement(null);
        setIsVisible(false);
      }
    };

    // Initial attempt to find element
    findAndHighlightElement();

    // Set up mutation observer to watch for DOM changes
    if (!targetElement && step.waitForElement !== false) {
      observerRef.current = new MutationObserver(() => {
        findAndHighlightElement();
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id', 'data-tour'],
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [step?.target, step?.highlight, step?.waitForElement, targetElement]);

  // Update highlight position when element moves (e.g., during animations)
  useEffect(() => {
    if (!targetElement || !isVisible) return;

    const updatePosition = () => {
      updateHighlightStyle(targetElement, step?.highlight);
    };

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Use ResizeObserver to watch for element size changes
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(targetElement);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [targetElement, isVisible, step?.highlight]);

  const updateHighlightStyle = (element: HTMLElement, config?: HighlightConfig) => {
    const position = getElementPosition(element);
    const padding = config?.padding || 4;
    const borderRadius = config?.borderRadius || 8;
    const borderWidth = config?.borderWidth || 4;

    setHighlightStyle({
      position: 'absolute',
      top: position.top - padding,
      left: position.left - padding,
      width: position.width + (padding * 2),
      height: position.height + (padding * 2),
      border: `${borderWidth}px solid var(--tour-highlight-color, #3b82f6)`,
      borderRadius: `${borderRadius}px`,
      boxShadow: config?.animate !== false 
        ? '0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.3)'
        : '0 0 0 4px rgba(59, 130, 246, 0.2)',
      pointerEvents: 'none',
      zIndex: 9998,
      transition: config?.animate !== false 
        ? 'all 0.3s ease-in-out'
        : 'none',
      animation: config?.animate !== false 
        ? 'tour-highlight-pulse 2s infinite'
        : 'none',
    });
  };

  return {
    targetElement,
    highlightStyle,
    isVisible,
  };
}
