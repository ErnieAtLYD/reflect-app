import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { mockAnimationsApi } from 'jsdom-testing-mocks'
import { afterEach, vi } from 'vitest'

// Mock animations API
mockAnimationsApi()

// Ensure DOM is cleaned between tests to avoid duplicate elements across renders
afterEach(() => {
  cleanup()
})

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

// Mock ResizeObserver
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

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    platform: 'MacIntel',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  writable: true,
})

// Mock document.documentElement for axe-core
Object.defineProperty(global.document, 'documentElement', {
  value: {
    ...global.document.documentElement,
    style: {
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(),
      removeProperty: vi.fn(),
    },
    scrollTop: 0,
    scrollLeft: 0,
    // Properties needed for axe-core
    lang: 'en',
    tagName: 'HTML',
  },
  writable: true,
})

// Mock Element properties needed for axe-core
if (typeof window !== 'undefined' && window.Element) {
  // Mock getAttribute for axe-core with null safety
  const originalGetAttribute = window.Element.prototype.getAttribute
  window.Element.prototype.getAttribute = function (name) {
    try {
      // Handle common attributes that axe-core checks
      if (name === 'lang' && this.tagName === 'HTML') {
        return 'en'
      }
      if (name === 'role' && this.hasAttribute && this.hasAttribute('role')) {
        const roleValue = originalGetAttribute.call(this, name)
        return roleValue || null
      }
      const result = originalGetAttribute.call(this, name)
      // Ensure we return a string or null for axe-core compatibility
      return result || null
    } catch {
      return null
    }
  }

  // DISABLED: These mocks were forcing all elements to be DIVs, breaking button testing
  // // Mock tagName for consistency with proper fallback
  // Object.defineProperty(window.Element.prototype, 'tagName', {
  //   get: function () {
  //     const nodeName = this.nodeName
  //     return nodeName && typeof nodeName === 'string'
  //       ? nodeName.toUpperCase()
  //       : 'DIV'
  //   },
  //   configurable: true,
  // })

  // // Mock nodeName for JSDOM elements that might not have it
  // Object.defineProperty(window.Element.prototype, 'nodeName', {
  //   get: function () {
  //     // Fallback to DIV if nodeName is not set
  //     return this._nodeName || 'DIV'
  //   },
  //   set: function (value) {
  //     this._nodeName = value
  //   },
  //   configurable: true,
  // })
}

// Mock additional DOM APIs
Object.defineProperty(global.document, 'activeElement', {
  value: null,
  writable: true,
})

// Mock HTMLElement dataset property
if (
  typeof window !== 'undefined' &&
  window.HTMLElement &&
  window.HTMLElement.prototype
) {
  Object.defineProperty(window.HTMLElement.prototype, 'dataset', {
    value: {},
    writable: true,
  })
}

// Basic JSDOM enhancements
if (typeof global.document !== 'undefined') {
  // Mock document.body with proper properties
  if (!global.document.body) {
    global.document.body = global.document.createElement('body')
    global.document.documentElement.appendChild(global.document.body)
  }

  // Ensure document.body has required properties
  Object.defineProperty(global.document.body, 'style', {
    value: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn(() => ''),
    },
    writable: true,
  })
}
