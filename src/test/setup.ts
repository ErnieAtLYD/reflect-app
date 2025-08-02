import '@testing-library/jest-dom'

// Setup axe-core for accessibility testing
if (typeof window !== 'undefined') {
  // Use dynamic imports for browser-only packages
  void import('@axe-core/react').then((axeModule) => {
    void Promise.all([import('react'), import('react-dom')]).then(
      ([reactModule, reactDomModule]) => {
        axeModule.default(reactModule, reactDomModule, 1000)
      }
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
