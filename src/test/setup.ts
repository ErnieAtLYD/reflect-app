import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { mockAnimationsApi } from 'jsdom-testing-mocks'
import { afterEach, vi } from 'vitest'

// Mock animations API for HeadlessUI components
mockAnimationsApi()

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

// Mock MutationObserver for HeadlessUI components
global.MutationObserver = class MutationObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
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

// Ensure window exists and is properly mocked for all timer functions
if (typeof window === 'undefined') {
  // Create a minimal window object if it doesn't exist
  Object.defineProperty(globalThis, 'window', {
    writable: true,
    value: {},
  })
}

// Mock window.setTimeout and related timer functions for CI environment
// jsdom sometimes doesn't properly provide these in CI
Object.defineProperty(window, 'setTimeout', {
  writable: true,
  value: global.setTimeout,
})

Object.defineProperty(window, 'clearTimeout', {
  writable: true,
  value: global.clearTimeout,
})

Object.defineProperty(window, 'setInterval', {
  writable: true,
  value: global.setInterval,
})

Object.defineProperty(window, 'clearInterval', {
  writable: true,
  value: global.clearInterval,
})

// Mock navigator.platform for HeadlessUI
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'navigator', {
    writable: true,
    value: {
      ...window.navigator,
      platform: 'MacIntel',
      userAgent: 'test-user-agent',
      vendor: 'test-vendor',
    },
  })
}

// Ensure proper DOM structure for testing
if (typeof document !== 'undefined') {
  // Ensure document.documentElement exists
  if (!document.documentElement) {
    const html = document.createElement('html')
    document.appendChild(html)
  }

  // Ensure document.head exists
  if (!document.head) {
    const head = document.createElement('head')
    document.documentElement.appendChild(head)
  }

  // Ensure document.body exists
  if (!document.body) {
    const body = document.createElement('body')
    document.documentElement.appendChild(body)
  }
}

// Mock requestAnimationFrame and cancelAnimationFrame
if (typeof window !== 'undefined') {
  if (!window.requestAnimationFrame) {
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: (fn: FrameRequestCallback) => setTimeout(fn, 16),
    })
  }

  if (!window.cancelAnimationFrame) {
    Object.defineProperty(window, 'cancelAnimationFrame', {
      writable: true,
      value: (id: number) => clearTimeout(id),
    })
  }
}

// Mock getComputedStyle for HeadlessUI
if (typeof window !== 'undefined' && !window.getComputedStyle) {
  Object.defineProperty(window, 'getComputedStyle', {
    writable: true,
    value: () => ({
      getPropertyValue: () => '',
      setProperty: () => {},
      removeProperty: () => '',
      cssFloat: '',
      length: 0,
      parentRule: null,
      getPropertyPriority: () => '',
      item: () => '',
      [Symbol.iterator]: function* () {},
    }),
  })
}

// Mock scrollTo for potential HeadlessUI usage
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: () => {},
  })

  Object.defineProperty(window, 'scroll', {
    writable: true,
    value: () => {},
  })
}

// Mock screen for responsive testing
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'screen', {
    writable: true,
    value: {
      width: 1024,
      height: 768,
      availWidth: 1024,
      availHeight: 768,
      colorDepth: 24,
      pixelDepth: 24,
    },
  })
}

// Global cleanup tracking - use any to avoid Node.js type conflicts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeTimeouts = new Set<any>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeIntervals = new Set<any>()

// Track timeouts and intervals for cleanup
const originalSetTimeout = global.setTimeout
const originalSetInterval = global.setInterval
const originalClearTimeout = global.clearTimeout
const originalClearInterval = global.clearInterval

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.setTimeout = ((fn: any, delay?: any, ...args: any[]) => {
  const id = originalSetTimeout(fn, delay, ...args)
  activeTimeouts.add(id)
  return id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.setInterval = ((fn: any, delay?: any, ...args: any[]) => {
  const id = originalSetInterval(fn, delay, ...args)
  activeIntervals.add(id)
  return id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.clearTimeout = ((id: any) => {
  activeTimeouts.delete(id)
  return originalClearTimeout(id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.clearInterval = ((id: any) => {
  activeIntervals.delete(id)
  return originalClearInterval(id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

// Clean up after each test
afterEach(() => {
  // Clear all active timers before cleanup to prevent post-teardown state updates
  activeTimeouts.forEach((id) => {
    try {
      originalClearTimeout(id)
    } catch {
      // Ignore errors
    }
  })
  activeIntervals.forEach((id) => {
    try {
      originalClearInterval(id)
    } catch {
      // Ignore errors
    }
  })
  activeTimeouts.clear()
  activeIntervals.clear()

  cleanup()

  // Clean up any live regions that might have been created by the live regions service
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { liveRegions } = require('@/lib/live-regions')
      liveRegions?.cleanup?.()
    } catch {
      // Ignore cleanup errors
    }
  }
})
