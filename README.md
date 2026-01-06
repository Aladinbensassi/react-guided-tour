# React Guided Tour

A modern, flexible React TypeScript tour guide library with advanced highlighting and interaction capabilities. Built for React 19 with a clean, modular architecture that supports complex user onboarding flows.

## ✨ Features

- 🎯 **Smart Element Targeting** - Flexible element selection with CSS selectors or direct element references
- 🎨 **Modern UI Design** - Beautiful, customizable popover with smooth animations
- 🔧 **Pluggable Architecture** - Extensible integration system for tabs, wizards, and navigation
- 📱 **Responsive Positioning** - Intelligent popover placement that adapts to viewport constraints
- 🎭 **Theme Support** - Comprehensive theming with light/dark mode compatibility
- 💾 **State Persistence** - localStorage integration to remember tour completion and progress
- ⚡ **Performance Optimized** - Framework-agnostic core with efficient React integration
- 🎪 **Action System** - Automated interactions (clicks, navigation, tab switching)
- 🔄 **Event System** - Rich event hooks for tour lifecycle management
- 🎯 **TypeScript First** - Full type safety with comprehensive type definitions

## 🚀 Quick Start

### Installation

```bash
npm install react-guided-tour
# or
yarn add react-guided-tour
```

### Running the Example

To see the tour library in action with a complete demo:

```bash
# Clone or navigate to the project
cd react-guided-tour

# Install dependencies for the main library
npm install

# Build the library
npm run build

# Navigate to the example directory
cd example

# Install example dependencies
npm install

# Start the development server
npm run dev
```

The example will be available at `http://localhost:3000` and includes:
- Interactive tour with multiple steps
- Tab switching demonstrations
- Wizard navigation examples
- Sidebar interactions
- Modern UI showcase

### Basic Usage

```tsx
import React from 'react';
import { TourProvider, TourRunner, TourConfig } from 'react-guided-tour';

const tourConfig: TourConfig = {
  id: 'welcome-tour',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome!',
      content: 'Let\'s take a quick tour of the application.',
      placement: 'center',
    },
    {
      id: 'header',
      title: 'Navigation',
      content: 'This is the main navigation header.',
      target: '[data-tour="header"]',
      placement: 'bottom',
    },
    {
      id: 'sidebar',
      title: 'Sidebar Menu',
      content: 'Access different sections from here.',
      target: '.sidebar',
      placement: 'right',
      action: {
        type: 'click',
        target: '.sidebar-toggle',
      },
    },
  ],
};

function App() {
  return (
    <TourProvider config={tourConfig}>
      <div className="app">
        <header data-tour="header">My App</header>
        <aside className="sidebar">...</aside>
        <main>...</main>
        
        {/* Tour UI */}
        <TourRunner />
      </div>
    </TourProvider>
  );
}
```

### Starting a Tour

```tsx
import { useTour } from 'react-guided-tour';

function StartTourButton() {
  const { start, state } = useTour();
  
  return (
    <button onClick={start} disabled={state.isRunning}>
      Start Tour
    </button>
  );
}
```

## 📖 API Reference

### TourConfig

The main configuration object for defining your tour:

```tsx
interface TourConfig {
  id: string;                    // Unique tour identifier
  steps: TourStep[];            // Array of tour steps
  theme?: TourTheme;            // Custom theme configuration
  onStart?: () => void;         // Called when tour starts
  onComplete?: () => void;      // Called when tour completes
  onSkip?: () => void;          // Called when tour is skipped
  onStepChange?: (step: TourStep, index: number) => void;
  allowKeyboardNavigation?: boolean;  // Enable keyboard controls
  allowClickOutside?: boolean;        // Allow clicking outside to close
  showProgress?: boolean;             // Show step progress indicator
  storage?: {
    key?: string;               // localStorage key (default: 'tour-{id}')
    remember?: boolean;         // Persist tour progress and completion state
  };
}
```

### TourStep

Individual step configuration:

```tsx
interface TourStep {
  id: string;                   // Unique step identifier
  title: string;                // Step title
  content: string;              // Step description
  target?: string;              // CSS selector for target element
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: TourAction;          // Automated action to perform
  highlight?: HighlightConfig;  // Custom highlight styling
  popover?: PopoverConfig;      // Custom popover configuration
  beforeStep?: () => Promise<void> | void;  // Pre-step hook
  afterStep?: () => Promise<void> | void;   // Post-step hook
  canSkip?: boolean;            // Allow skipping this step
  waitForElement?: boolean;     // Wait for target element to appear
  waitTimeout?: number;         // Timeout for element waiting (ms)
}
```

### TourAction

Automated actions that can be performed during tour steps:

```tsx
interface TourAction {
  type: 'click' | 'navigate' | 'highlight' | 'tab-switch' | 'wizard-step' | 'custom';
  target?: string;              // Target selector or URL
  value?: any;                  // Action-specific value
  handler?: () => Promise<void> | void;  // Custom action handler
  delay?: number;               // Delay before action (ms)
}
```

### TourTheme

Comprehensive theming options:

```tsx
interface TourTheme {
  primaryColor?: string;        // Primary brand color
  backgroundColor?: string;     // Popover background
  textColor?: string;          // Text color
  borderRadius?: string;       // Border radius
  fontFamily?: string;         // Font family
  fontSize?: string;           // Font size
  zIndex?: number;             // Z-index for tour elements
  overlay?: {
    backgroundColor?: string;   // Overlay background
    opacity?: number;          // Overlay opacity
  };
  highlight?: {
    borderColor?: string;      // Highlight border color
    borderWidth?: string;      // Highlight border width
    glowColor?: string;        // Highlight glow color
    animation?: string;        // Highlight animation
  };
  popover?: {
    backgroundColor?: string;   // Popover background
    borderColor?: string;      // Popover border
    shadow?: string;           // Popover shadow
    maxWidth?: string;         // Maximum width
  };
}
```

## 🎯 Advanced Usage

### Custom Actions

Create custom actions for complex interactions:

```tsx
const tourConfig: TourConfig = {
  id: 'advanced-tour',
  steps: [
    {
      id: 'custom-action',
      title: 'Custom Action',
      content: 'This step performs a custom action.',
      action: {
        type: 'custom',
        handler: async () => {
          // Custom logic here
          await someAsyncOperation();
          updateApplicationState();
        },
      },
    },
  ],
};
```

### Tab Integration

Automatically switch between tabs:

```tsx
{
  id: 'tab-demo',
  title: 'Switch Tabs',
  content: 'Watch as we switch to the Projects tab.',
  target: '[data-tab="projects"]',
  action: {
    type: 'tab-switch',
    target: '[data-tab="projects"]',
  },
}
```

### Wizard Integration

Navigate through multi-step wizards:

```tsx
{
  id: 'wizard-step',
  title: 'Wizard Navigation',
  content: 'Navigate to step 2 of the wizard.',
  target: '.wizard',
  action: {
    type: 'wizard-step',
    target: '.wizard',
    value: 2, // Step index
  },
}
```

### Custom Integrations

Extend the tour system with custom integrations:

```tsx
import { Integration, TourAction } from 'react-guided-tour';

class CustomIntegration implements Integration {
  name = 'custom-integration';

  canHandle(action: TourAction): boolean {
    return action.type === 'my-custom-action';
  }

  async execute(action: TourAction, element?: HTMLElement): Promise<void> {
    // Custom integration logic
  }
}

// Register the integration
const { engine } = useTourEngine(config);
engine.actions.registerIntegration(new CustomIntegration());
```

### State Persistence with localStorage

The tour system automatically saves completion and progress state to localStorage when enabled:

```tsx
const tourConfig: TourConfig = {
  id: 'my-app-tour',
  storage: {
    remember: true,                    // Enable localStorage persistence
    key: 'my-custom-tour-key',        // Optional custom key
  },
  steps: [
    // ... your steps
  ],
};
```

**What gets saved:**
- Tour completion status (`isCompleted: true`)
- Tour skip status (`isSkipped: true`) 
- Completion/skip timestamps
- Current step progress
- Completed and skipped step IDs

**Checking tour state:**
```tsx
function MyComponent() {
  const { engine, state } = useTour();
  
  // Check if user has completed or skipped the tour
  const shouldShowTour = engine.shouldShowTour();
  const isCompleted = state.isCompleted;
  const isSkipped = state.isSkipped;
  
  return (
    <div>
      {shouldShowTour ? (
        <button onClick={() => engine.start()}>
          Start Tour
        </button>
      ) : (
        <div>
          {isCompleted && <span>✓ Tour Completed</span>}
          {isSkipped && <span>Tour Skipped</span>}
          <button onClick={() => engine.resetTourState()}>
            Reset Tour
          </button>
        </div>
      )}
    </div>
  );
}
```

**Resetting tour state:**
```tsx
// Clear localStorage and reset tour state
engine.resetTourState();

// Or manually clear just the localStorage
engine.storage.clearState();
```

### Event Handling

Listen to tour events:

```tsx
function MyTourComponent() {
  const { engine } = useTour();

  useEffect(() => {
    const handleStepChange = (data: { step: TourStep; index: number }) => {
      console.log('Step changed:', data.step.id);
      // Analytics tracking
      analytics.track('tour_step_viewed', {
        step_id: data.step.id,
        step_index: data.index,
      });
    };

    engine.on('step-change', handleStepChange);
    
    return () => {
      engine.off('step-change', handleStepChange);
    };
  }, [engine]);

  return <TourRunner />;
}
```

### Conditional Steps

Show steps based on conditions:

```tsx
const tourConfig: TourConfig = {
  id: 'conditional-tour',
  steps: [
    {
      id: 'conditional-step',
      title: 'Conditional Step',
      content: 'This step only shows if condition is met.',
      target: '.feature',
      beforeStep: async () => {
        const hasFeature = await checkFeatureAvailability();
        if (!hasFeature) {
          throw new Error('Feature not available'); // Skip step
        }
      },
    },
  ],
};
```

## 🎨 Styling

### CSS Custom Properties

The tour system uses CSS custom properties for easy theming:

```css
:root {
  --tour-primary-color: #3b82f6;
  --tour-background-color: #ffffff;
  --tour-text-color: #1f2937;
  --tour-border-radius: 12px;
  --tour-highlight-color: #3b82f6;
  --tour-overlay-color: rgba(0, 0, 0, 0.5);
  --tour-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Custom CSS Classes

Add custom styling with CSS classes:

```css
.tour-popover {
  /* Custom popover styles */
}

.tour-popover[data-placement="top"] {
  /* Top placement specific styles */
}

.tour-highlight {
  /* Custom highlight styles */
}

@keyframes custom-highlight-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 🔧 Integration Examples

### React Router Integration

```tsx
import { useNavigate } from 'react-router-dom';

const tourConfig: TourConfig = {
  steps: [
    {
      id: 'navigate-to-page',
      title: 'Navigation',
      content: 'Let\'s go to the dashboard.',
      action: {
        type: 'navigate',
        target: '/dashboard',
      },
    },
  ],
};
```

### Material-UI Integration

```tsx
// Works automatically with Material-UI components
{
  id: 'mui-tab',
  title: 'Material-UI Tab',
  content: 'Switch to the second tab.',
  target: '.MuiTab-root[aria-selected="false"]',
  action: {
    type: 'tab-switch',
    target: '.MuiTab-root[aria-selected="false"]',
  },
}
```

### Ant Design Integration

```tsx
// Works with Ant Design components
{
  id: 'antd-step',
  title: 'Ant Design Stepper',
  content: 'Navigate through the steps.',
  target: '.ant-steps-item',
  action: {
    type: 'wizard-step',
    target: '.ant-steps',
    value: 1,
  },
}
```

## 📱 Responsive Design

The tour system automatically adapts to different screen sizes:

- **Mobile**: Popovers adjust to smaller screens
- **Tablet**: Optimized touch interactions
- **Desktop**: Full feature set with keyboard navigation

## ♿ Accessibility

Built with accessibility in mind:

- **Keyboard Navigation**: Arrow keys, Enter, Escape
- **Screen Reader Support**: ARIA labels and descriptions
- **Focus Management**: Proper focus trapping and restoration
- **High Contrast**: Respects user color preferences

## 🔍 Troubleshooting

### Common Issues

**Tour doesn't start:**
- Ensure `TourProvider` wraps your app
- Check that `TourRunner` is rendered
- Verify tour configuration is valid

**Elements not highlighting:**
- Check CSS selectors are correct
- Ensure target elements exist in DOM
- Use `waitForElement: true` for dynamic content

**Actions not working:**
- Verify action type is supported
- Check target selectors
- Register custom integrations if needed

### Debug Mode

Enable debug logging:

```tsx
const tourConfig: TourConfig = {
  // ... other config
  debug: true, // Enable debug logging
};
```

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding new features, improving documentation, or helping with testing, your contributions are valuable.

### Quick Start for Contributors

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Build the library**: `npm run build`
4. **Run the example**: `npm run example`
5. **Make your changes** and test thoroughly
6. **Submit a pull request**

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
# react-guided-tour
