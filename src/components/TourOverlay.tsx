import React, { useMemo, useCallback } from 'react';
import { useTour } from './TourProvider';
import { useTourHighlight } from '../hooks/useTourHighlight';

export interface TourOverlayProps {
  className?: string;
}

export const TourOverlay = React.memo(function TourOverlay({ className }: TourOverlayProps) {
  const { state, theme, stop } = useTour();
  const { targetElement, highlightStyle, isVisible } = useTourHighlight(state.currentStep);

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

  const handleOverlayClick = useCallback(() => {
    if (state.currentStep?.canSkip !== false) {
      stop();
    }
  }, [state.currentStep?.canSkip, stop]);

  if (!state.isRunning || !state.currentStep) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div 
        style={overlayStyle}
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
      `}</style>
    </>
  );
});
