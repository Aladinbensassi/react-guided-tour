import React from 'react';
import { TourOverlay } from './TourOverlay';
import { TourPopover } from './TourPopover';
import { useTour } from './TourProvider';

export interface TourRunnerProps {
  className?: string;
}

export function TourRunner({ className }: TourRunnerProps) {
  const { state } = useTour();

  if (!state.isRunning) {
    return null;
  }

  return (
    <>
      <TourOverlay className={className} />
      <TourPopover className={className} />
    </>
  );
}
