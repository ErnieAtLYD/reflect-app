/**
 * Integration tests for analytics system
 * Tests real-world usage scenarios and system integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { analytics, ANALYTICS_EVENTS } from '@/lib/analytics'

import { setupAnalyticsMocks } from './analytics-test-utils'

describe('Analytics Integration Tests', () => {
  let mocks: ReturnType<typeof setupAnalyticsMocks>

  beforeEach(() => {
    mocks = setupAnalyticsMocks()
  })

  afterEach(() => {
    mocks.cleanup()
  })

  it('should handle complete user workflow', () => {
    // User starts with analytics disabled
    expect(analytics.isEnabled()).toBe(false)
    expect(analytics.getEventCount()).toBe(0)

    // User enables analytics
    analytics.setEnabled(true)
    expect(analytics.isEnabled()).toBe(true)

    // User performs various actions
    analytics.trackEvent('page_view')
    analytics.trackEvent('reflection_generated')
    analytics.trackEvent('feedback_given')

    // Verify events are tracked
    const events = analytics.getEvents()
    expect(events).toHaveLength(3)

    // All events should have same session ID
    const sessionIds = events.map((e) => e.sessionId)
    const uniqueSessionIds = new Set(sessionIds)
    expect(uniqueSessionIds.size).toBe(1)

    // Check summary statistics
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBe(3)
    expect(summary.sessionCount).toBe(1)
    expect(summary.eventTypes.page_view).toBe(1)
    expect(summary.eventTypes.reflection_generated).toBe(1)
    expect(summary.eventTypes.feedback_given).toBe(1)

    // User clears data
    analytics.clearData()
    expect(analytics.getEventCount()).toBe(0)
    expect(analytics.getEvents()).toHaveLength(0)

    // User disables analytics
    analytics.setEnabled(false)
    expect(analytics.isEnabled()).toBe(false)

    // Further events should not be tracked
    analytics.trackEvent('page_view')
    expect(analytics.getEventCount()).toBe(0)
  })

  it('should maintain data integrity across sessions', () => {
    // Session 1
    analytics.setEnabled(true)
    analytics.trackEvent('page_view')
    analytics.trackEvent('reflection_generated')

    const session1Events = analytics.getEvents()
    expect(session1Events).toHaveLength(2)
    const session1Id = session1Events[0].sessionId

    // Simulate new session (disable/enable)
    mocks.mockRandomUUID.mockReturnValueOnce('new-session-id')
    analytics.setEnabled(false)
    analytics.setEnabled(true)

    // Add events in new session
    analytics.trackEvent('feedback_given')
    analytics.trackEvent('history_toggled')

    const allEvents = analytics.getEvents()
    expect(allEvents).toHaveLength(4)

    // Check session distribution
    const sessionGroups = allEvents.reduce(
      (acc, event) => {
        acc[event.sessionId] = (acc[event.sessionId] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    expect(Object.keys(sessionGroups)).toHaveLength(2)
    expect(sessionGroups[session1Id]).toBe(2)
    expect(sessionGroups['new-session-id']).toBe(2)
  })

  it('should dispatch events for external listeners', () => {
    const eventLog: Array<{ type: string; detail: unknown }> = []

    // Set up event listeners
    const enabledHandler = (event: Event) => {
      eventLog.push({ type: 'enabled', detail: (event as CustomEvent).detail })
    }
    const trackedHandler = (event: Event) => {
      eventLog.push({ type: 'tracked', detail: (event as CustomEvent).detail })
    }
    const clearedHandler = (event: Event) => {
      eventLog.push({ type: 'cleared', detail: (event as CustomEvent).detail })
    }

    window.addEventListener(ANALYTICS_EVENTS.ENABLED_CHANGED, enabledHandler)
    window.addEventListener(ANALYTICS_EVENTS.EVENT_TRACKED, trackedHandler)
    window.addEventListener(ANALYTICS_EVENTS.DATA_CLEARED, clearedHandler)

    // Perform operations
    analytics.setEnabled(true)
    analytics.trackEvent('page_view')
    analytics.trackEvent('reflection_generated')
    analytics.clearData()
    analytics.setEnabled(false)

    // Clean up listeners
    window.removeEventListener(ANALYTICS_EVENTS.ENABLED_CHANGED, enabledHandler)
    window.removeEventListener(ANALYTICS_EVENTS.EVENT_TRACKED, trackedHandler)
    window.removeEventListener(ANALYTICS_EVENTS.DATA_CLEARED, clearedHandler)

    // Verify events were dispatched
    expect(eventLog).toHaveLength(5)

    expect(eventLog[0]).toEqual({ type: 'enabled', detail: { enabled: true } })
    expect(eventLog[1]).toEqual({
      type: 'tracked',
      detail: {
        event: expect.objectContaining({ type: 'page_view' }),
        totalEvents: 1,
      },
    })
    expect(eventLog[2]).toEqual({
      type: 'tracked',
      detail: {
        event: expect.objectContaining({ type: 'reflection_generated' }),
        totalEvents: 2,
      },
    })
    expect(eventLog[3]).toEqual({ type: 'cleared', detail: {} })
    expect(eventLog[4]).toEqual({ type: 'enabled', detail: { enabled: false } })
  })

  it('should recover from system failures', () => {
    analytics.setEnabled(true)

    // Track some events successfully
    analytics.trackEvent('page_view')
    analytics.trackEvent('reflection_generated')
    expect(analytics.getEventCount()).toBe(2)

    // Simulate storage failure
    const originalSetItem = mocks.mockLocalStorage.setItem
    mocks.mockLocalStorage.setItem = () => {
      throw new Error('Storage quota exceeded')
    }

    // These operations should fail silently
    analytics.trackEvent('feedback_given')
    analytics.trackEvent('history_toggled')

    // Original events should still be accessible
    expect(analytics.getEventCount()).toBe(2)

    // Restore storage functionality
    mocks.mockLocalStorage.setItem = originalSetItem

    // System should continue working
    analytics.trackEvent('export_completed')
    expect(analytics.getEventCount()).toBe(3)

    const events = analytics.getEvents()
    expect(events[0].type).toBe('export_completed')
    expect(events[1].type).toBe('reflection_generated')
    expect(events[2].type).toBe('page_view')
  })

  it('should handle rapid event tracking efficiently', () => {
    analytics.setEnabled(true)

    const startTime = performance.now()

    // Track many events rapidly
    for (let i = 0; i < 50; i++) {
      analytics.trackEvent('page_view')
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // Should complete quickly
    expect(duration).toBeLessThan(50) // Under 50ms
    expect(analytics.getEventCount()).toBe(50)

    // Events should all have proper structure
    const events = analytics.getEvents()
    events.forEach((event) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('sessionId')
      expect(event).toHaveProperty('type')
      expect(event).toHaveProperty('timestamp')
      expect(event.type).toBe('page_view')
    })
  })

  it('should maintain privacy compliance', () => {
    // Analytics starts disabled
    expect(analytics.isEnabled()).toBe(false)
    expect(analytics.getSessionId()).toBe('disabled')

    // Enable analytics
    analytics.setEnabled(true)
    const sessionId = analytics.getSessionId()
    expect(sessionId).not.toBe('disabled')
    expect(typeof sessionId).toBe('string')
    expect(sessionId.length).toBeGreaterThan(0)

    // Track events
    analytics.trackEvent('page_view')
    analytics.trackEvent('reflection_generated')

    const events = analytics.getEvents()

    // Verify only required properties are stored
    events.forEach((event) => {
      const keys = Object.keys(event)
      expect(keys).toHaveLength(4)
      expect(keys).toContain('id')
      expect(keys).toContain('sessionId')
      expect(keys).toContain('type')
      expect(keys).toContain('timestamp')

      // Verify no PII or unexpected data
      expect(keys).not.toContain('content')
      expect(keys).not.toContain('userAgent')
      expect(keys).not.toContain('ip')
      expect(keys).not.toContain('userId')
    })

    // Disable analytics should stop tracking
    analytics.setEnabled(false)
    analytics.trackEvent('feedback_given')

    // No new events should be added
    expect(analytics.getEvents()).toHaveLength(0) // getEvents returns empty when disabled
  })
})
