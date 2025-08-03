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
  // Flag to prevent multiple initialization attempts
  let axeCoreInitialized = false

  // Use dynamic imports for browser-only packages with error handling
  void import('@axe-core/react')
    .then((axeModule) => {
      if (axeCoreInitialized) {
        return
      }

      void Promise.all([import('react'), import('react-dom')])
        .then(([reactModule, reactDomModule]) => {
          try {
            // Check if React.createElement is already redefined
            const originalCreateElement = reactModule.createElement
            if (
              originalCreateElement &&
              typeof originalCreateElement === 'function'
            ) {
              axeModule.default(reactModule, reactDomModule, 1000)
              axeCoreInitialized = true
            }
          } catch (error) {
            // Silently handle the createElement redefinition error
            // This allows tests to continue running without the axe-core React integration
            console.warn(
              'axe-core React integration could not be initialized:',
              error instanceof Error ? error.message : String(error)
            )
            axeCoreInitialized = true // Mark as initialized to prevent retries
          }
        })
        .catch((error) => {
          console.warn(
            'Failed to load React modules for axe-core:',
            error instanceof Error ? error.message : String(error)
          )
        })
    })
    .catch((error) => {
      console.warn(
        'Failed to load @axe-core/react:',
        error instanceof Error ? error.message : String(error)
      )
    })
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
