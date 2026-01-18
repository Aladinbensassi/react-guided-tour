import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useTour } from './TourProvider';
import { useTourHighlight } from '../hooks/useTourHighlight';

export interface TourOverlayProps {
  className?: string;
}

export const TourOverlay = React.memo(function TourOverlay({ className }: TourOverlayProps) {
  const { state, theme, stop, config, next } = useTour();
  const { targetElement, highlightStyle, isVisible } = useTourHighlight(state.currentStep);
  const [scrollTrigger, setScrollTrigger] = useState(0);

  // Determine if interactions should be blocked
  const shouldBlockInteractions = useMemo(() => {
    const stepBlocking = state.currentStep?.blockInteractions;
    const globalBlocking = config.blockInteractions;
    return stepBlocking !== undefined ? stepBlocking : globalBlocking;
  }, [state.currentStep?.blockInteractions, config.blockInteractions]);

  // Determine if click-to-advance is enabled
  const shouldClickToAdvance = useMemo(() => {
    const stepClickToAdvance = state.currentStep?.clickToAdvance;
    const globalClickToAdvance = config.clickToAdvance;
    return stepClickToAdvance !== undefined ? stepClickToAdvance : globalClickToAdvance;
  }, [state.currentStep?.clickToAdvance, config.clickToAdvance]);

  const overlayStyle: React.CSSProperties = useMemo(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme.overlay?.backgroundColor || '#000000',
    opacity: theme.overlay?.opacity || 0.5,
    zIndex: (theme.zIndex || 9999) - 1,
    pointerEvents: 'auto',
  }), [theme.overlay?.backgroundColor, theme.overlay?.opacity, theme.zIndex]);

  // Create cutout style for the highlighted element
  const cutoutOverlayStyle: React.CSSProperties = useMemo(() => {
    if ((!shouldBlockInteractions && !shouldClickToAdvance) || !targetElement || !isVisible) {
      return overlayStyle;
    }

    // Use getBoundingClientRect for viewport-relative coordinates (perfect for fixed overlay)
    const rect = targetElement.getBoundingClientRect();
    const padding = state.currentStep?.highlight?.padding || 8;
    
    // Ensure coordinates are within viewport bounds
    const left = Math.max(0, rect.left - padding);
    const top = Math.max(0, rect.top - padding);
    const right = Math.min(window.innerWidth, rect.right + padding);
    const bottom = Math.min(window.innerHeight, rect.bottom + padding);
    
    return {
      ...overlayStyle,
      clipPath: `polygon(
        0% 0%, 
        0% 100%, 
        ${left}px 100%, 
        ${left}px ${top}px, 
        ${right}px ${top}px, 
        ${right}px ${bottom}px, 
        ${left}px ${bottom}px, 
        ${left}px 100%, 
        100% 100%, 
        100% 0%
      )`,
    };
  }, [overlayStyle, shouldBlockInteractions, shouldClickToAdvance, targetElement, isVisible, state.currentStep?.highlight?.padding, scrollTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Force re-render of cutout overlay on scroll to maintain proper positioning
  useEffect(() => {
    if (!shouldBlockInteractions && !shouldClickToAdvance) {
      return;
    }

    const handleScroll = () => {
      // Force recalculation by updating scroll trigger
      setScrollTrigger(prev => prev + 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [shouldBlockInteractions, shouldClickToAdvance]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // If interactions are blocked, prevent the click from propagating
    if (shouldBlockInteractions) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Allow clicking outside to close tour if not blocking interactions
    if (config.allowClickOutside !== false && state.currentStep?.canSkip !== false) {
      stop();
    }
  }, [shouldBlockInteractions, config.allowClickOutside, state.currentStep?.canSkip, stop]);

  // Handle click-to-advance functionality
  useEffect(() => {
    if (!shouldClickToAdvance || !targetElement || !state.isRunning) {
      return;
    }

    // Ensure target element is above the overlay when click-to-advance is enabled
    const originalZIndex = targetElement.style.zIndex;
    const originalPosition = targetElement.style.position;
    
    targetElement.style.position = targetElement.style.position || 'relative';
    targetElement.style.zIndex = String((theme.zIndex || 9999) + 1);

    const handleTargetClick = (_e: Event) => {
      // Don't prevent default or stop propagation - let the element's normal behavior work
      // Just advance the tour after a small delay to allow the click to be processed
      setTimeout(() => {
        next();
      }, 100);
    };

    targetElement.addEventListener('click', handleTargetClick, true);

    return () => {
      targetElement.removeEventListener('click', handleTargetClick, true);
      // Restore original styles
      targetElement.style.zIndex = originalZIndex;
      targetElement.style.position = originalPosition;
    };
  }, [shouldClickToAdvance, targetElement, state.isRunning, next, theme.zIndex]);

  // Block interactions on the entire page when blocking is enabled
  useEffect(() => {
    if (!shouldBlockInteractions || !state.isRunning) {
      return;
    }

    const handleGlobalClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Allow clicks on the tour target element and its children
      if (targetElement && (targetElement.contains(target) || targetElement === target)) {
        // If click-to-advance is enabled, let the target click handler deal with it
        if (shouldClickToAdvance) {
          return;
        }
        return;
      }

      // Allow clicks on tour UI elements (popover, buttons, etc.)
      if (target.closest('[data-tour-popover]') || 
          target.closest('[data-tour-highlight]') || 
          target.closest('[data-tour-overlay]')) {
        return;
      }

      // Block all other clicks
      e.preventDefault();
      e.stopPropagation();
    };

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Allow tour navigation keys
      if (['Escape', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space'].includes(e.key)) {
        return;
      }

      // Block other keyboard interactions
      e.preventDefault();
      e.stopPropagation();
    };

    // Add event listeners to capture phase to block interactions early
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('keydown', handleGlobalKeydown, true);
    document.addEventListener('mousedown', handleGlobalClick, true);
    document.addEventListener('touchstart', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('keydown', handleGlobalKeydown, true);
      document.removeEventListener('mousedown', handleGlobalClick, true);
      document.removeEventListener('touchstart', handleGlobalClick, true);
    };
  }, [shouldBlockInteractions, state.isRunning, targetElement, shouldClickToAdvance]);

  if (!state.isRunning || !state.currentStep) {
    return null;
  }

  return (
    <>
      {/* Overlay with optional cutout */}
      <div 
        style={(shouldBlockInteractions || shouldClickToAdvance) ? cutoutOverlayStyle : overlayStyle}
        onClick={handleOverlayClick}
        className={className}
        data-tour-overlay
      />
      
      {/* Highlight */}
      {isVisible && targetElement && (
        <div
          style={highlightStyle}
          data-tour-highlight
        />
      )}
      
      {/* Interaction blocking indicator */}
      {shouldBlockInteractions && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: (theme.zIndex || 9999) + 1,
            pointerEvents: 'none',
            animation: 'tour-fade-in 0.3s ease-out',
          }}
          data-tour-blocking-indicator
        >
          🔒 Interactions blocked
        </div>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes tour-highlight-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
          }
        }
        
        @keyframes tour-fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        [data-tour-overlay] {
          animation: tour-fade-in 0.2s ease-out;
        }
        
        [data-tour-highlight] {
          animation: tour-fade-in 0.3s ease-out;
        }
        
        [data-tour-blocking-indicator] {
          animation: tour-fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
});
