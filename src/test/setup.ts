import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Setup axe-core for accessibility testing with error handling
if (typeof window !== 'undefined') {
  // Global flag to prevent multiple initialization attempts across all test files
  if (!(globalThis as { __axeInitialized?: boolean }).__axeInitialized) {
    ;(globalThis as { __axeInitialized?: boolean }).__axeInitialized = true

    // Use dynamic imports for browser-only packages with error handling
    void import('@axe-core/react')
      .then((axeModule) => {
        void Promise.all([import('react'), import('react-dom')])
          .then(([reactModule, reactDomModule]) => {
            try {
              // Only initialize if React.createElement hasn't been modified
              const React = reactModule.default || reactModule
              const originalDescriptor = Object.getOwnPropertyDescriptor(
                React,
                'createElement'
              )

              if (!originalDescriptor?.configurable) {
                // createElement is already non-configurable, skip axe initialization
                return
              }

              axeModule.default(reactModule, reactDomModule, 1000)
            } catch (error) {
              // Silently ignore createElement redefinition errors
              // This is expected when axe-core tries to instrument React
              if (!(error as Error)?.message?.includes('createElement')) {
                console.warn('axe-core initialization error:', error)
              }
            }
          })
          .catch(() => {
            // Silently ignore import errors in test environment
          })
      })
      .catch(() => {
        // Silently ignore @axe-core/react import errors
      })
  }
}

// Mock ResizeObserver for HeadlessUI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver if needed
global.IntersectionObserver = class MockIntersectionObserver {
  root = null
  rootMargin = ''
  thresholds: number[] = []

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
} as typeof IntersectionObserver
