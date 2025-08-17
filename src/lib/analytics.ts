/**
 * Privacy-first analytics system
 *
 * This module provides client-side analytics tracking with:
 * - Anonymous session IDs that reset on each visit
 * - Opt-in only (disabled by default)
 * - No PII collection
 * - All data stored locally in browser
 * - No external tracking services
 */

export type EventType =
  | 'page_view'
  | 'reflection_generated'
  | 'feedback_given'
  | 'history_toggled'
  | 'export_completed'
  | 'error_occurred'

export interface AnalyticsEvent {
  id: string
  sessionId: string
  type: EventType
  timestamp: number
}

const STORAGE_KEY = 'reflect-analytics'
const ENABLED_KEY = 'reflect-analytics-enabled'
const SESSION_KEY = 'reflect-analytics-session'
const MAX_EVENTS = 1000

// Custom event types for analytics changes
export const ANALYTICS_EVENTS = {
  ENABLED_CHANGED: 'reflect-analytics-enabled-changed',
  EVENT_TRACKED: 'reflect-analytics-event-tracked',
  DATA_CLEARED: 'reflect-analytics-data-cleared',
} as const

/**
 * Dispatch a custom event for analytics state changes
 * @param eventType - The type of event to dispatch
 * @param data - The data to include in the event
 */
const dispatchAnalyticsEvent = (
  eventType: string,
  data?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }))
  }
}

/**
 * Validate an analytics event
 * @param event - The event to validate
 * @returns True if the event is valid, false otherwise
 */
const validateAnalyticsEvent = (event: unknown): event is AnalyticsEvent => {
  if (typeof event !== 'object' || event === null) {
    return false
  }

  const obj = event as Record<string, unknown>

  // Validate required id field - must be non-empty string
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    return false
  }

  // Validate sessionId - must be non-empty string
  if (typeof obj.sessionId !== 'string' || obj.sessionId.length === 0) {
    return false
  }

  // Validate event type - must be one of the allowed types
  const validTypes: EventType[] = [
    'page_view',
    'reflection_generated',
    'feedback_given',
    'history_toggled',
    'export_completed',
    'error_occurred',
  ]
  if (!validTypes.includes(obj.type as EventType)) {
    return false
  }

  // Validate timestamp - must be a finite number and reasonable
  if (
    typeof obj.timestamp !== 'number' ||
    !Number.isFinite(obj.timestamp) ||
    obj.timestamp < 0
  ) {
    return false
  }

  // Additional timestamp validation - should not be too far in the future
  const now = Date.now()
  const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000
  if (obj.timestamp > oneYearFromNow) {
    return false
  }

  // Ensure no unexpected properties (security measure)
  const allowedKeys = new Set(['id', 'sessionId', 'type', 'timestamp'])
  const objKeys = Object.keys(obj)

  for (const key of objKeys) {
    if (!allowedKeys.has(key)) {
      return false
    }
  }

  return true
}

/**
 * Generate a random UUID for session tracking
 * @returns A random UUID string
 */
const generateSessionId = (): string => {
  try {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
  } catch {
    // Fall through to manual generation
  }

  // Fallback for older browsers - generate random UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Privacy-first analytics system
 * @returns An object with analytics tracking methods
 */
export const analytics = {
  /**
   * Check if analytics is enabled
   * @returns True if analytics is enabled, false otherwise
   */
  isEnabled(): boolean {
    try {
      return localStorage.getItem(ENABLED_KEY) === 'true'
    } catch {
      return false
    }
  },

  /**
   * Enable or disable analytics tracking
   * @param enabled - Whether to enable or disable analytics
   */
  setEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(ENABLED_KEY, enabled.toString())

      if (enabled) {
        // Generate new session when enabling analytics
        this.generateNewSession()
      } else {
        // Clear session when disabling
        localStorage.removeItem(SESSION_KEY)
      }

      dispatchAnalyticsEvent(ANALYTICS_EVENTS.ENABLED_CHANGED, { enabled })
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  /**
   * Get the current session ID, generating one if needed
   * @returns The current session ID
   */
  getSessionId(): string {
    if (!this.isEnabled()) {
      return 'disabled'
    }

    try {
      let sessionId = sessionStorage.getItem(SESSION_KEY)
      if (!sessionId) {
        sessionId = generateSessionId()
        sessionStorage.setItem(SESSION_KEY, sessionId)
      }
      return sessionId
    } catch {
      // If sessionStorage fails, generate a temporary ID
      return generateSessionId()
    }
  },

  /**
   * Generate a new session ID (resets session)
   */
  generateNewSession(): void {
    if (!this.isEnabled()) return

    try {
      const newSessionId = generateSessionId()
      sessionStorage.setItem(SESSION_KEY, newSessionId)
    } catch {
      // Fail silently if sessionStorage is not available
    }
  },

  /**
   * Track an analytics event
   * @param type - The type of event to track
   */
  trackEvent(type: EventType): void {
    if (!this.isEnabled()) return

    try {
      const events = this.getEvents()
      const newEvent: AnalyticsEvent = {
        id: generateSessionId(), // Use same UUID generation for event IDs
        sessionId: this.getSessionId(),
        type,
        timestamp: Date.now(),
      }

      // Add new event to the beginning
      events.unshift(newEvent)

      // Keep only the last MAX_EVENTS to prevent storage bloat
      if (events.length > MAX_EVENTS) {
        events.splice(MAX_EVENTS)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
      dispatchAnalyticsEvent(ANALYTICS_EVENTS.EVENT_TRACKED, {
        event: newEvent,
        totalEvents: events.length,
      })
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  /**
   * Get all analytics events
   * @returns An array of AnalyticsEvent objects
   */
  getEvents(): AnalyticsEvent[] {
    if (!this.isEnabled()) return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        // Invalid data format, clear corrupted storage
        localStorage.removeItem(STORAGE_KEY)
        return []
      }

      // Filter out invalid events and keep only valid ones
      const validEvents = parsed.filter(validateAnalyticsEvent)

      // If we had to filter out invalid events, save the cleaned data
      if (validEvents.length !== parsed.length && validEvents.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validEvents))
      } else if (validEvents.length === 0 && parsed.length > 0) {
        // All events were invalid, clear storage
        localStorage.removeItem(STORAGE_KEY)
      }

      return validEvents
    } catch {
      // JSON parsing failed or other error, clear corrupted storage
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore if we can't clear storage
      }
      return []
    }
  },

  /**
   * Clear all analytics data
   */
  clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      dispatchAnalyticsEvent(ANALYTICS_EVENTS.DATA_CLEARED, {})
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  /**
   * Get analytics summary statistics
   * @returns Object with basic analytics metrics
   */
  getSummary(): {
    totalEvents: number
    sessionCount: number
    eventTypes: Record<EventType, number>
    dateRange: { earliest?: number; latest?: number }
  } {
    const events = this.getEvents()

    const summary = {
      totalEvents: events.length,
      sessionCount: new Set(events.map((e) => e.sessionId)).size,
      eventTypes: {} as Record<EventType, number>,
      dateRange: {} as { earliest?: number; latest?: number },
    }

    // Count event types
    const validTypes: EventType[] = [
      'page_view',
      'reflection_generated',
      'feedback_given',
      'history_toggled',
      'export_completed',
      'error_occurred',
    ]

    for (const type of validTypes) {
      summary.eventTypes[type] = events.filter((e) => e.type === type).length
    }

    // Calculate date range
    if (events.length > 0) {
      const timestamps = events.map((e) => e.timestamp).sort((a, b) => a - b)
      summary.dateRange.earliest = timestamps[0]
      summary.dateRange.latest = timestamps[timestamps.length - 1]
    }

    return summary
  },

  /**
   * Get the number of events stored
   * @returns The number of events in storage
   */
  getEventCount(): number {
    return this.getEvents().length
  },
}
