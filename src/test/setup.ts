import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { mockAnimationsApi } from 'jsdom-testing-mocks'
import { afterEach, vi } from 'vitest'

// Mock animations API for HeadlessUI components
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

// Mock navigator for HeadlessUI platform detection
Object.defineProperty(global, 'navigator', {
  value: {
    platform: 'MacIntel',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  writable: true,
})

// Mock document.documentElement for HeadlessUI and axe-core
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

  // Mock tagName for consistency with proper fallback
  Object.defineProperty(window.Element.prototype, 'tagName', {
    get: function () {
      const nodeName = this.nodeName
      return nodeName && typeof nodeName === 'string'
        ? nodeName.toUpperCase()
        : 'DIV'
    },
    configurable: true,
  })

  // Mock nodeName for JSDOM elements that might not have it
  Object.defineProperty(window.Element.prototype, 'nodeName', {
    get: function () {
      // Fallback to DIV if nodeName is not set
      return this._nodeName || 'DIV'
    },
    set: function (value) {
      this._nodeName = value
    },
    configurable: true,
  })
}

// Mock additional DOM APIs for HeadlessUI
Object.defineProperty(global.document, 'activeElement', {
  value: null,
  writable: true,
})

// Mock HTMLElement dataset property
Object.defineProperty(window.HTMLElement.prototype, 'dataset', {
  value: {},
  writable: true,
})

// Comprehensive HeadlessUI compatibility fixes for JSDOM
if (typeof global.document !== 'undefined') {
  // Mock document.body with proper properties
  if (!global.document.body) {
    global.document.body = global.document.createElement('body')
    global.document.documentElement.appendChild(global.document.body)
  }

  // Ensure document.body has required properties for HeadlessUI
  Object.defineProperty(global.document.body, 'style', {
    value: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn(() => ''),
    },
    writable: true,
  })

  // Mock Element properties that HeadlessUI's focus management needs
  const mockElementProps = (element: Element) => {
    if (!(element as HTMLElement).style) {
      Object.defineProperty(element, 'style', {
        value: {
          setProperty: vi.fn(),
          removeProperty: vi.fn(),
          getPropertyValue: vi.fn(() => ''),
        },
        writable: true,
      })
    }
  }

  // Override createElement to ensure all elements have required properties
  const originalCreateElement = global.document.createElement
  global.document.createElement = function (
    tagName: string,
    options?: ElementCreationOptions
  ) {
    const element = originalCreateElement.call(this, tagName, options)
    mockElementProps(element)
    return element
  }

  // Mock focus-related properties for HeadlessUI
  Object.defineProperty(global.document, 'activeElement', {
    value: global.document.body,
    writable: true,
    configurable: true,
  })

  // Mock tabIndex property for all elements
  Object.defineProperty(Element.prototype, 'tabIndex', {
    get: function () {
      const tabIndexAttr = this.getAttribute('tabindex')
      return tabIndexAttr ? parseInt(tabIndexAttr, 10) : -1
    },
    set: function (value: number) {
      this.setAttribute('tabindex', String(value))
    },
    configurable: true,
  })

  // Mock focus/blur methods with proper typing
  Object.defineProperty(Element.prototype, 'focus', {
    value: vi.fn(function (this: Element) {
      Object.defineProperty(global.document, 'activeElement', {
        value: this,
        writable: true,
        configurable: true,
      })
    }),
    writable: true,
    configurable: true,
  })

  Object.defineProperty(Element.prototype, 'blur', {
    value: vi.fn(function (this: Element) {
      const currentActiveElement = global.document.activeElement
      if (currentActiveElement === this) {
        Object.defineProperty(global.document, 'activeElement', {
          value: global.document.body,
          writable: true,
          configurable: true,
        })
      }
    }),
    writable: true,
    configurable: true,
  })

  // Fix HeadlessUI focus visibility tracking
  // HeadlessUI tries to set a 'headlessuiFocusVisible' property on elements
  const originalAddEventListener = Document.prototype.addEventListener
  Document.prototype.addEventListener = function (
    this: Document,
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    // Intercept HeadlessUI's focus management event listeners
    if (type === 'keydown' || type === 'pointerdown' || type === 'pointerup') {
      const wrappedListener = function (this: Document, event: Event) {
        try {
          // Ensure the event target has the properties HeadlessUI expects
          const target = event.target as Element & {
            headlessuiFocusVisible?: boolean
          }
          if (target && typeof target === 'object') {
            // Allow HeadlessUI to set the headlessuiFocusVisible property
            if (!target.hasOwnProperty('headlessuiFocusVisible')) {
              Object.defineProperty(target, 'headlessuiFocusVisible', {
                value: false,
                writable: true,
                configurable: true,
              })
            }
          }
          if (typeof listener === 'function') {
            listener.call(this, event)
          } else if (listener && typeof listener.handleEvent === 'function') {
            listener.handleEvent(event)
          }
        } catch (error) {
          // Silently ignore HeadlessUI focus management errors
          console.warn(
            'HeadlessUI focus management error (expected in JSDOM):',
            error
          )
        }
      }
      return originalAddEventListener.call(this, type, wrappedListener, options)
    }
    // Handle null listener case
    if (listener === null) {
      return
    }
    return originalAddEventListener.call(this, type, listener, options)
  }
}
