import React from 'react';
import { TourOverlay } from './TourOverlay';
import { TourPopover } from './TourPopover';
import { useTour } from './TourProvider';
import { ErrorBoundary } from './ErrorBoundary';

export interface TourRunnerProps {
  className?: string;
}

export const TourRunner = React.memo(function TourRunner({ className }: TourRunnerProps) {
  const { state } = useTour();

  if (!state.isRunning) {
    return null;
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('TourRunner error:', error, errorInfo);
      }}
    >
      <TourOverlay className={className} />
      <TourPopover className={className} />
    </ErrorBoundary>
  );
});
