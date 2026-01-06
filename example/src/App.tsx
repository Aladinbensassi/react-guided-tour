import React, { useState } from "react";
import {
  TourProvider,
  TourRunner,
  TourConfig,
  useTour,
} from "@aladinbs/react-guided-tour";

const tourConfig: TourConfig = {
  id: "comprehensive-showcase",
  steps: [
    {
      id: "welcome",
      title: "React Guided Tour - Complete Feature Demo",
      content:
        "Experience every feature of our modern tour library. This comprehensive demo shows smart targeting, automated actions, theming, and more!",
      placement: "center",
    },
    {
      id: "installation",
      title: "1. Installation & Setup",
      content:
        "Start here - copy the installation command and see how easy it is to get started.",
      target: '[data-tour="install"]',
      placement: "bottom",
    },
    {
      id: "basic-example",
      title: "2. Basic Usage Example",
      content:
        "This shows the minimal code needed to create your first tour. Notice the clean API design.",
      target: '[data-tour="basic-code"]',
      placement: "right",
    },
    {
      id: "smart-targeting",
      title: "3. Smart Element Targeting",
      content:
        "Watch how the tour intelligently finds and highlights elements using CSS selectors.",
      target: '[data-tour="targeting-demo"]',
      placement: "top",
      highlight: {
        padding: 8,
        borderRadius: 12,
        animate: true,
      },
    },
    {
      id: "automated-actions",
      title: "4. Automated Actions",
      content:
        "The tour can perform actions automatically - like clicking this button for you!",
      target: '[data-tour="action-demo"]',
      placement: "left",
    },
    {
      id: "theme-customization",
      title: "5. Theme Customization",
      content:
        "Every aspect is customizable - colors, borders, animations, and positioning.",
      target: '[data-tour="theme-demo"]',
      placement: "bottom",
    },
    {
      id: "responsive-design",
      title: "6. Responsive & Accessible",
      content:
        "Works perfectly on all devices with full keyboard navigation and screen reader support.",
      target: '[data-tour="responsive-demo"]',
      placement: "top",
    },
    {
      id: "advanced-features",
      title: "7. Advanced Features",
      content:
        "State persistence, event hooks, conditional steps, custom integrations, and more!",
      target: '[data-tour="advanced-demo"]',
      placement: "right",
    },
    {
      id: "playground",
      title: "8. Interactive Playground",
      content:
        "Try different configurations and see the results instantly in our live playground.",
      target: '[data-tour="playground"]',
      placement: "top",
    },
    {
      id: "completion",
      title: "Ready to Build Amazing Tours?",
      content:
        "You've seen everything React Guided Tour can do. Start creating engaging user experiences today!",
      placement: "center",
      popover: {
        finishLabel: "Get Started Now",
      },
    },
  ],
  theme: {
    primaryColor: "#0ea5e9",
    borderRadius: "8px",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    highlight: {
      borderColor: "#0ea5e9",
      borderWidth: "2px",
      glowColor: "rgba(14, 165, 233, 0.25)",
    },
    popover: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      maxWidth: "420px",
    },
  },
  onComplete: () => {
    const install = "npm install @aladinbs/react-guided-tour";
    navigator.clipboard?.writeText(install);
  },
  onSkip: () => {},
  storage: {
    remember: true,
    key: "react-guided-tour-demo",
  },
};

function App() {
  const [actionDemoClicked, setActionDemoClicked] = useState(false);
  const [playgroundConfig, setPlaygroundConfig] = useState({
    placement: "top",
    themeColor: "#0ea5e9",
    animation: true,
  });

  return (
    <TourProvider config={tourConfig}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 32 32"
                      fill="none"
                      className="text-white"
                    >
                      {/* Tour guide icon - path/route */}
                      <path d="M8 12 L16 8 L24 12 L20 20 L12 20 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      
                      {/* Dots representing tour steps */}
                      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
                      <circle cx="16" cy="13" r="1.5" fill="currentColor"/>
                      <circle cx="20" cy="16" r="1.5" fill="currentColor"/>
                      
                      {/* Arrow indicating direction */}
                      <path d="M14 22 L16 24 L18 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    React Guided Tour
                  </h1>
                  <p className="text-sm text-slate-500 hidden sm:block">
                    Interactive user onboarding made simple
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <TourButton />
                <a
                  href="https://github.com/Aladinbensassi/react-guided-tour"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/@aladinbs/react-guided-tour"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
                >
                  npm
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                React 19 support
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Build amazing
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  guided tours
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Create interactive user onboarding experiences with smart
                targeting, automated actions, and beautiful UI components.
                TypeScript-first with zero dependencies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <TourButton />
                <div className="flex items-center space-x-4">
                  <a
                    href="#"
                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    View on GitHub
                  </a>
                  <span className="text-slate-300">•</span>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    npm package
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 -z-10"></div>
        </section>

        {/* Installation */}
        <section className="py-16 bg-slate-50" data-tour="install">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Get started in seconds
              </h2>
              <p className="text-lg text-slate-600">
                Install the package and start building tours immediately
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-slate-400 text-sm font-mono">
                  Terminal
                </span>
              </div>
              <div className="p-6 bg-slate-900">
                <div className="flex items-center justify-between">
                  <code className="text-green-400 font-mono text-lg">
                    npm install @aladinbs/react-guided-tour
                  </code>
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        "npm install @aladinbs/react-guided-tour"
                      )
                    }
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-20 bg-white" data-tour="basic-code">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Quick Start
              </h2>
              <p className="text-xl text-slate-600">
                Get up and running with just a few lines of code
              </p>
            </div>
            <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
              <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-300 font-medium text-sm">
                    Basic Usage
                  </span>
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-mono rounded">
                    tsx
                  </span>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <pre className="p-6 text-slate-100 font-mono text-sm leading-relaxed overflow-x-auto">
                <code>{`import { TourProvider, TourRunner, TourConfig } from '@aladinbs/react-guided-tour';

const tourConfig: TourConfig = {
  id: 'welcome-tour',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome!',
      content: 'Let\\'s take a quick tour of the app.',
      placement: 'center',
    },
    {
      id: 'header',
      title: 'Navigation',
      content: 'This is the main navigation header.',
      target: '.header',
      placement: 'bottom',
    },
  ],
};

function App() {
  return (
    <TourProvider config={tourConfig}>
      <YourApp />
      <TourRunner />
    </TourProvider>
  );
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-slate-50" data-tour="targeting-demo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-slate-600">
                Everything you need to create engaging user experiences
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  🎯
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Smart Targeting
                </h3>
                <p className="text-slate-600">
                  Flexible CSS selectors with automatic waiting for dynamic
                  content
                </p>
              </div>
              <div
                className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-tour="action-demo"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  ⚡
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Automated Actions
                </h3>
                <p className="text-slate-600 mb-4">
                  Click buttons, navigate pages, and interact with elements
                  automatically
                </p>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  onClick={() => setActionDemoClicked(!actionDemoClicked)}
                >
                  {actionDemoClicked ? "✅ Clicked!" : "Click Me"}
                </button>
              </div>
              <div
                className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-tour="theme-demo"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  🎨
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Theme Customization
                </h3>
                <p className="text-slate-600 mb-4">
                  Customize colors, borders, animations, and positioning
                </p>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-md"></div>
                </div>
              </div>
              <div
                className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                data-tour="responsive-demo"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  📱
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Responsive & Accessible
                </h3>
                <p className="text-slate-600">
                  Works on all devices with keyboard navigation and screen
                  reader support
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-20 bg-white" data-tour="advanced-demo">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Advanced Features
              </h2>
              <p className="text-xl text-slate-600">
                Powerful capabilities for complex user onboarding scenarios
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  💾
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  State Persistence
                </h3>
                <p className="text-slate-600 mb-4">
                  Remember tour progress across sessions and page reloads
                </p>
                <code className="text-xs bg-slate-800 text-green-400 px-3 py-2 rounded font-mono">
                  storage: &#123; remember: true &#125;
                </code>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  🔗
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Event Hooks
                </h3>
                <p className="text-slate-600 mb-4">
                  React to tour events for analytics and customization
                </p>
                <code className="text-xs bg-slate-800 text-green-400 px-3 py-2 rounded font-mono">
                  onComplete: function() &#123; &#125;
                </code>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  🔀
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Conditional Steps
                </h3>
                <p className="text-slate-600 mb-4">
                  Show/hide steps based on application state
                </p>
                <code className="text-xs bg-slate-800 text-green-400 px-3 py-2 rounded font-mono">
                  beforeStep: function() &#123; &#125;
                </code>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-slate-200">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  🔧
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Custom Integrations
                </h3>
                <p className="text-slate-600 mb-4">
                  Extend with custom action handlers and integrations
                </p>
                <code className="text-xs bg-slate-800 text-green-400 px-3 py-2 rounded font-mono">
                  registerIntegration(custom)
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Playground */}
        <section className="py-20 bg-slate-50" data-tour="playground">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Interactive Playground
              </h2>
              <p className="text-xl text-slate-600">
                Try different configurations and see results instantly
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-slate-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Placement
                      </label>
                      <select
                        value={playgroundConfig.placement}
                        onChange={(e) =>
                          setPlaygroundConfig((prev) => ({
                            ...prev,
                            placement: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="center">Center</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Theme Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={playgroundConfig.themeColor}
                          onChange={(e) =>
                            setPlaygroundConfig((prev) => ({
                              ...prev,
                              themeColor: e.target.value,
                            }))
                          }
                          className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
                        />
                        <span className="text-sm text-slate-600 font-mono">
                          {playgroundConfig.themeColor}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={playgroundConfig.animation}
                        onChange={(e) =>
                          setPlaygroundConfig((prev) => ({
                            ...prev,
                            animation: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-slate-700">
                        Enable animations
                      </label>
                    </div>
                    <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">
                        Generated Config:
                      </h4>
                      <pre className="text-xs text-slate-700 font-mono overflow-x-auto">
                        {`{
  placement: '${playgroundConfig.placement}',
  theme: {
    primaryColor: '${playgroundConfig.themeColor}',
    animate: ${playgroundConfig.animation}
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Live Preview
                  </h3>
                  <div className="relative min-h-[300px] flex items-center justify-center">
                    <div className="w-24 h-16 bg-slate-100 border border-slate-300 rounded-lg relative">
                      <div
                        className={`absolute -inset-1 border-2 rounded-lg ${
                          playgroundConfig.animation ? "animate-pulse" : ""
                        }`}
                        style={{ borderColor: playgroundConfig.themeColor }}
                      ></div>
                    </div>
                    <div
                      className={`absolute bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-72 transition-all duration-300 ${
                        playgroundConfig.placement === "top"
                          ? "bottom-full mb-2"
                          : playgroundConfig.placement === "bottom"
                          ? "top-full mt-2"
                          : playgroundConfig.placement === "left"
                          ? "right-full mr-2"
                          : playgroundConfig.placement === "right"
                          ? "left-full ml-2"
                          : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">
                          Step 1 of 3
                        </span>
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          ×
                        </button>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Example Tour Step
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">
                        This preview updates in real-time as you change the
                        configuration options.
                      </p>
                      <div className="flex justify-between">
                        <button className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                          Skip
                        </button>
                        <button
                          className="px-4 py-1 text-white text-sm rounded-md transition-colors"
                          style={{
                            backgroundColor: playgroundConfig.themeColor,
                          }}
                        >
                          Next
                        </button>
                      </div>
                      {playgroundConfig.placement !== "center" && (
                        <div
                          className={`absolute w-3 h-3 transform rotate-45 border ${
                            playgroundConfig.placement === "top"
                              ? "top-full -mt-2 left-1/2 -ml-1.5 border-t-0 border-l-0"
                              : playgroundConfig.placement === "bottom"
                              ? "bottom-full -mb-2 left-1/2 -ml-1.5 border-b-0 border-r-0"
                              : playgroundConfig.placement === "left"
                              ? "left-full -ml-2 top-1/2 -mt-1.5 border-l-0 border-b-0"
                              : "right-full -mr-2 top-1/2 -mt-1.5 border-r-0 border-t-0"
                          }`}
                          style={{
                            backgroundColor: "white",
                            borderColor: "#e2e8f0",
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tour Runner */}
        <TourRunner />
      </div>
    </TourProvider>
  );
}

function TourButton() {
  const { start, state, engine } = useTour();

  const handleStartClick = async () => {
    try {
      await start();
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  };

  const handleResetClick = () => {
    engine.resetTourState();
    // Force a re-render by updating the page
    window.location.reload();
  };

  const isCompleted = state.isCompleted;
  const isSkipped = state.isSkipped;

  return (
    <div className="flex items-center gap-3">
      <button
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={handleStartClick}
        disabled={state.isRunning}
      >
        {state.isRunning ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Tour Running...
          </span>
        ) : (
          <span className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {isCompleted
              ? "Tour Completed ✓"
              : isSkipped
              ? "Tour Skipped"
              : "Start Interactive Tour"}
          </span>
        )}
      </button>

      {(isCompleted || isSkipped) && (
        <button
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          onClick={handleResetClick}
          title="Reset tour state and clear localStorage"
        >
          Reset Tour
        </button>
      )}
    </div>
  );
}

export default App;
