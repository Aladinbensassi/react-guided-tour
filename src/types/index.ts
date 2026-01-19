export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: TourAction;
  highlight?: HighlightConfig;
  popover?: PopoverConfig;
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  canSkip?: boolean;
  waitForElement?: boolean;
  waitTimeout?: number;
  blockInteractions?: boolean;
  clickToAdvance?: boolean;
  previousButton?: PreviousButtonConfig;
}

export interface TourAction {
  type: 'click' | 'navigate' | 'highlight' | 'tab-switch' | 'wizard-step' | 'custom';
  target?: string;
  value?: string | number | Record<string, string | number | boolean>;
  handler?: () => Promise<void> | void;
  delay?: number;
}

export interface PreviousButtonConfig {
  show?: boolean;
  label?: string;
  handler?: () => Promise<void> | void;
}

export interface HighlightConfig {
  selector?: string;
  element?: HTMLElement;
  padding?: number;
  borderRadius?: number;
  borderWidth?: number;
  animate?: boolean;
  className?: string;
}

export interface PopoverConfig {
  title?: string;
  content?: string;
  showProgress?: boolean;
  showSkip?: boolean;
  nextLabel?: string;
  skipLabel?: string;
  finishLabel?: string;
  className?: string;
}

export interface TourConfig {
  id: string;
  steps: TourStep[];
  theme?: TourTheme;
  onStart?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (step: TourStep, index: number) => void;
  allowKeyboardNavigation?: boolean;
  allowClickOutside?: boolean;
  blockInteractions?: boolean;
  clickToAdvance?: boolean;
  showProgress?: boolean;
  storage?: {
    key?: string;
    remember?: boolean;
  };
}

export interface TourTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  zIndex?: number;
  overlay?: {
    backgroundColor?: string;
    opacity?: number;
  };
  highlight?: {
    borderColor?: string;
    borderWidth?: string;
    glowColor?: string;
    animation?: string;
  };
  popover?: {
    backgroundColor?: string;
    borderColor?: string;
    shadow?: string;
    maxWidth?: string;
  };
}

export interface TourState {
  isRunning: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  isLoading: boolean;
  error: string | null;
  completedSteps: string[];
  skippedSteps: string[];
  isCompleted?: boolean;
  isSkipped?: boolean;
  completedAt?: string;
  skippedAt?: string;
}

export interface Integration {
  name: string;
  canHandle: (action: TourAction) => boolean;
  execute: (action: TourAction, element?: HTMLElement) => Promise<void>;
}

export interface TourEngineEvents {
  'step-change': { step: TourStep; index: number };
  'tour-start': { tourId: string };
  'tour-complete': { tourId: string };
  'tour-skip': { tourId: string; stepIndex: number };
  'error': { error: Error; step?: TourStep; tourId?: string; stepIndex?: number; timestamp?: string };
  'state-change': TourState;
}

export type TourEventCallback<T = unknown> = (data: T) => void;

export interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export interface PopoverPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
