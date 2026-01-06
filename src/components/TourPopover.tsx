import React, { useRef, useEffect, useState } from 'react';
import { useTour } from './TourProvider';
import { useTourHighlight } from '../hooks/useTourHighlight';
import { calculatePopoverPosition } from '../utils/positioning';
import { PopoverPosition } from '../types';
import clsx from 'clsx';

export interface TourPopoverProps {
  className?: string;
}

export function TourPopover({ className }: TourPopoverProps) {
  const { state, theme, next, previous, skip, stop, isFirstStep, isLastStep, canGoNext, canGoPrevious } = useTour();
  const { targetElement } = useTourHighlight(state.currentStep);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, placement: 'top' });

  useEffect(() => {
    if (!popoverRef.current || !targetElement || !state.currentStep) return;

    const updatePosition = () => {
      const newPosition = calculatePopoverPosition(
        targetElement,
        popoverRef.current!,
        state.currentStep!.placement || 'top'
      );
      setPosition(newPosition);
    };

    updatePosition();

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [targetElement, state.currentStep]);

  if (!state.isRunning || !state.currentStep) {
    return null;
  }

  const step = state.currentStep;
  const popoverConfig = step.popover || {};

  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    maxWidth: theme.popover?.maxWidth || '384px',
    backgroundColor: theme.popover?.backgroundColor || theme.backgroundColor || '#ffffff',
    borderTopWidth: '1px',
    borderRightWidth: '1px', 
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid', 
    borderLeftStyle: 'solid',
    borderTopColor: theme.popover?.borderColor || '#e5e7eb',
    borderRightColor: theme.popover?.borderColor || '#e5e7eb',
    borderBottomColor: theme.popover?.borderColor || '#e5e7eb',
    borderLeftColor: theme.popover?.borderColor || '#e5e7eb',
    borderRadius: theme.borderRadius || '12px',
    boxShadow: theme.popover?.shadow || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fontFamily: theme.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: theme.fontSize || '14px',
    color: theme.textColor || '#1f2937',
    zIndex: theme.zIndex || 9999,
    animation: 'tour-fade-in 0.3s ease-out',
  };

  const handleNext = async () => {
    if (canGoNext || isLastStep) {
      await next();
    }
  };

  const handlePrevious = async () => {
    if (canGoPrevious) {
      await previous();
    }
  };

  const handleSkip = async () => {
    await skip();
  };

  const handleClose = async () => {
    await stop();
  };


  return (
    <div
      ref={popoverRef}
      style={{
        ...popoverStyle,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
      className={clsx('tour-popover', className, popoverConfig.className)}
      data-tour-popover
      data-placement={position.placement}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 20px 0 20px'
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            borderTopWidth: '0',
            borderRightWidth: '0',
            borderBottomWidth: '0',
            borderLeftWidth: '0',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
          }}
          aria-label="Close tour"
        >
          ×
        </button>

        {/* Progress indicator */}
        {(popoverConfig.showProgress !== false && state.totalSteps > 1) && (
          <div style={{
            backgroundColor: theme.primaryColor || '#3b82f6',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
          }}>
            {state.currentStepIndex + 1} of {state.totalSteps}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px' }}>
        {/* Title */}
        {(popoverConfig.title || step.title) && (
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: theme.textColor || '#1f2937',
          }}>
            {popoverConfig.title || step.title}
          </h3>
        )}

        {/* Content */}
        <div style={{
          margin: '0 0 16px 0',
          lineHeight: '1.5',
          color: theme.textColor || '#374151',
        }}>
          {popoverConfig.content || step.content}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px 20px 20px',
        gap: '12px',
      }}>
        {/* Skip button */}
        {(popoverConfig.showSkip !== false && step.canSkip !== false) && (
          <button
            onClick={(_e) => {
              handleSkip();
            }}
            style={{
              background: 'none',
              borderTopWidth: '0',
              borderRightWidth: '0',
              borderBottomWidth: '0',
              borderLeftWidth: '0',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 99999,
            }}
          >
            {popoverConfig.skipLabel || 'Skip Tour'}
          </button>
        )}

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {/* Previous button */}
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              style={{
                backgroundColor: 'transparent',
                borderTopWidth: '1px',
                borderRightWidth: '1px',
                borderBottomWidth: '1px', 
                borderLeftWidth: '1px',
                borderTopStyle: 'solid',
                borderRightStyle: 'solid',
                borderBottomStyle: 'solid',
                borderLeftStyle: 'solid',
                borderTopColor: theme.primaryColor || '#3b82f6',
                borderRightColor: theme.primaryColor || '#3b82f6',
                borderBottomColor: theme.primaryColor || '#3b82f6',
                borderLeftColor: theme.primaryColor || '#3b82f6',
                color: theme.primaryColor || '#3b82f6',
                cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                opacity: canGoPrevious ? 1 : 0.5,
                transition: 'all 0.2s ease',
              }}
            >
              Previous
            </button>
          )}

          {/* Next/Finish button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            disabled={false}
            style={{
              backgroundColor: theme.primaryColor || '#3b82f6',
              borderTopWidth: '0',
              borderRightWidth: '0',
              borderBottomWidth: '0',
              borderLeftWidth: '0',
              color: 'white',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              opacity: 1,
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 99999,
            }}
          >
            {isLastStep 
              ? (popoverConfig.finishLabel || 'Finish')
              : (popoverConfig.nextLabel || 'Next')
            }
          </button>
        </div>
      </div>

      {/* Arrow indicator */}
      {position.placement !== 'center' && (
        <div
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            backgroundColor: theme.popover?.backgroundColor || theme.backgroundColor || '#ffffff',
            borderTopWidth: '1px',
            borderRightWidth: '1px',
            borderBottomWidth: '1px',
            borderLeftWidth: '1px',
            borderTopStyle: 'solid',
            borderRightStyle: 'solid',
            borderBottomStyle: 'solid',
            borderLeftStyle: 'solid',
            borderTopColor: theme.popover?.borderColor || '#e5e7eb',
            borderRightColor: theme.popover?.borderColor || '#e5e7eb',
            borderBottomColor: theme.popover?.borderColor || '#e5e7eb',
            borderLeftColor: theme.popover?.borderColor || '#e5e7eb',
            transform: 'rotate(45deg)',
            ...getArrowPosition(position.placement),
          }}
          data-tour-arrow
        />
      )}
    </div>
  );
}

function getArrowPosition(placement: 'top' | 'bottom' | 'left' | 'right' | 'center') {
  switch (placement) {
    case 'top':
      return {
        bottom: '-6px',
        left: '50%',
        marginLeft: '-6px',
        borderTopWidth: '0',
        borderLeftWidth: '0',
      };
    case 'bottom':
      return {
        top: '-6px',
        left: '50%',
        marginLeft: '-6px',
        borderBottomWidth: '0',
        borderRightWidth: '0',
      };
    case 'left':
      return {
        right: '-6px',
        top: '50%',
        marginTop: '-6px',
        borderTopWidth: '0',
        borderLeftWidth: '0',
      };
    case 'right':
      return {
        left: '-6px',
        top: '50%',
        marginTop: '-6px',
        borderBottomWidth: '0',
        borderRightWidth: '0',
      };
    default:
      return {};
  }
}
