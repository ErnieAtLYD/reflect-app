/**
 * Test utilities for analytics testing
 * Provides mocks, fixtures, and helper functions for testing analytics functionality
 */

import { vi } from 'vitest'

import type { AnalyticsEvent, EventType } from '@/lib/analytics'

// Storage keys used by analytics
export const ANALYTICS_STORAGE_KEYS = {
  STORAGE: 'reflect-analytics',
  ENABLED: 'reflect-analytics-enabled',
  SESSION: 'reflect-analytics-session',
} as const

/**
 * Mock storage implementation for testing
 */
export class MockStorage implements Storage {
  private data: Map<string, string> = new Map()

  get length(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys())
    return keys[index] ?? null
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  // Test helper methods
  getData(): Map<string, string> {
    return new Map(this.data)
  }

  setData(data: Record<string, string>): void {
    this.data.clear()
    Object.entries(data).forEach(([key, value]) => {
      this.data.set(key, value)
    })
  }
}

/**
 * Setup analytics mocks for testing
 * @returns Object with mock instances and cleanup function
 */
export function setupAnalyticsMocks() {
  const mockLocalStorage = new MockStorage()
  const mockSessionStorage = new MockStorage()

  // Store original values
  const originalLocalStorage = global.localStorage
  const originalSessionStorage = global.sessionStorage
  const originalCrypto = global.crypto

  // Mock localStorage and sessionStorage
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })

  Object.defineProperty(global, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  })

  // Mock crypto.randomUUID
  const mockRandomUUID = vi.fn(() => 'test-uuid-123')
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: mockRandomUUID,
    },
    writable: true,
  })

  // Mock Date.now for consistent timestamps
  const mockDateNow = vi.fn(() => 1640995200000) // 2022-01-01T00:00:00.000Z
  vi.stubGlobal('Date', {
    ...Date,
    now: mockDateNow,
  })

  // Mock event listeners for custom events
  const eventListeners: Array<{ event: string; handler: EventListener }> = []
  const mockAddEventListener = vi.fn(
    (event: string, handler: EventListener) => {
      eventListeners.push({ event, handler })
    }
  )

  const mockRemoveEventListener = vi.fn(
    (event: string, handler: EventListener) => {
      const index = eventListeners.findIndex(
        (l) => l.event === event && l.handler === handler
      )
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  )

  const mockDispatchEvent = vi.fn((event: Event) => {
    eventListeners
      .filter((l) => l.event === event.type)
      .forEach((l) => l.handler(event))
    return true
  })

  Object.defineProperty(global, 'window', {
    value: {
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: mockDispatchEvent,
    },
    writable: true,
  })

  const cleanup = () => {
    // Restore original values
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
    Object.defineProperty(global, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    })
    Object.defineProperty(global, 'crypto', {
      value: originalCrypto,
      writable: true,
    })

    // Clear all mocks
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  }

  return {
    mockLocalStorage,
    mockSessionStorage,
    mockRandomUUID,
    mockDateNow,
    mockAddEventListener,
    mockRemoveEventListener,
    mockDispatchEvent,
    eventListeners,
    cleanup,
  }
}

/**
 * Create a valid analytics event for testing
 */
export function createTestEvent(
  overrides: Partial<AnalyticsEvent> = {}
): AnalyticsEvent {
  return {
    id: 'test-event-123',
    sessionId: 'test-session-456',
    type: 'page_view',
    timestamp: 1640995200000,
    ...overrides,
  }
}

/**
 * Create multiple test events
 */
export function createTestEvents(count: number): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = []
  const eventTypes: EventType[] = [
    'page_view',
    'reflection_generated',
    'feedback_given',
    'history_toggled',
    'export_completed',
    'error_occurred',
  ]

  for (let i = 0; i < count; i++) {
    events.push(
      createTestEvent({
        id: `test-event-${i}`,
        sessionId: `test-session-${Math.floor(i / 3)}`, // Multiple events per session
        type: eventTypes[i % eventTypes.length],
        timestamp: 1640995200000 + i * 1000, // Events 1 second apart
      })
    )
  }

  return events
}

/**
 * Set up localStorage with test events
 */
export function setTestEventsInStorage(
  events: AnalyticsEvent[],
  storage: Storage = localStorage
): void {
  storage.setItem(ANALYTICS_STORAGE_KEYS.STORAGE, JSON.stringify(events))
}

/**
 * Enable analytics in test storage
 */
export function enableAnalyticsInStorage(
  storage: Storage = localStorage
): void {
  storage.setItem(ANALYTICS_STORAGE_KEYS.ENABLED, 'true')
}

/**
 * Disable analytics in test storage
 */
export function disableAnalyticsInStorage(
  storage: Storage = localStorage
): void {
  storage.setItem(ANALYTICS_STORAGE_KEYS.ENABLED, 'false')
}

/**
 * Set session ID in test storage
 */
export function setSessionIdInStorage(
  sessionId: string,
  storage: Storage = sessionStorage
): void {
  storage.setItem(ANALYTICS_STORAGE_KEYS.SESSION, sessionId)
}

/**
 * Assert that an event matches expected properties
 */
export function assertEventMatches(
  actual: AnalyticsEvent,
  expected: Partial<AnalyticsEvent>
): void {
  if (expected.id !== undefined) {
    expect(actual.id).toBe(expected.id)
  }
  if (expected.sessionId !== undefined) {
    expect(actual.sessionId).toBe(expected.sessionId)
  }
  if (expected.type !== undefined) {
    expect(actual.type).toBe(expected.type)
  }
  if (expected.timestamp !== undefined) {
    expect(actual.timestamp).toBe(expected.timestamp)
  }
}

/**
 * Wait for a custom analytics event to be dispatched
 */
export async function waitForAnalyticsEvent(
  eventType: string,
  timeout = 1000
): Promise<CustomEvent> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener(eventType, handler)
      reject(
        new Error(
          `Analytics event ${eventType} not dispatched within ${timeout}ms`
        )
      )
    }, timeout)

    const handler = (event: Event) => {
      clearTimeout(timer)
      window.removeEventListener(eventType, handler)
      resolve(event as CustomEvent)
    }

    window.addEventListener(eventType, handler)
  })
}

/**
 * Create invalid events for testing validation
 */
export function createInvalidEvents(): Array<{
  event: unknown
  reason: string
}> {
  return [
    { event: null, reason: 'null event' },
    { event: undefined, reason: 'undefined event' },
    { event: 'string', reason: 'string instead of object' },
    { event: 123, reason: 'number instead of object' },
    { event: [], reason: 'array instead of object' },
    {
      event: {
        id: '',
        sessionId: 'test',
        type: 'page_view',
        timestamp: Date.now(),
      },
      reason: 'empty id',
    },
    {
      event: {
        id: 'test',
        sessionId: '',
        type: 'page_view',
        timestamp: Date.now(),
      },
      reason: 'empty sessionId',
    },
    {
      event: {
        id: 'test',
        sessionId: 'test',
        type: 'invalid_type',
        timestamp: Date.now(),
      },
      reason: 'invalid event type',
    },
    {
      event: {
        id: 'test',
        sessionId: 'test',
        type: 'page_view',
        timestamp: 'invalid',
      },
      reason: 'invalid timestamp type',
    },
    {
      event: {
        id: 'test',
        sessionId: 'test',
        type: 'page_view',
        timestamp: -1,
      },
      reason: 'negative timestamp',
    },
    {
      event: {
        id: 'test',
        sessionId: 'test',
        type: 'page_view',
        timestamp: Infinity,
      },
      reason: 'infinite timestamp',
    },
    {
      event: {
        id: 'test',
        sessionId: 'test',
        type: 'page_view',
        timestamp: Date.now() + 2 * 365 * 24 * 60 * 60 * 1000, // 2 years in future
      },
      reason: 'timestamp too far in future',
    },
    {
      event: {
        id: 'test',
        sessionId: 'test',
        type: 'page_view',
        timestamp: Date.now(),
        extraField: 'not allowed',
      },
      reason: 'unexpected properties',
    },
  ]
}

/**
 * Mock Math.random for deterministic UUID generation
 */
export function mockMathRandom(sequence: number[] = [0.5]): () => void {
  let index = 0
  const originalRandom = Math.random

  Math.random = vi.fn(() => {
    const value = sequence[index % sequence.length]
    index++
    return value
  })

  return () => {
    Math.random = originalRandom
  }
}
