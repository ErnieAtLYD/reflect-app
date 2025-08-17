/**
 * Core analytics tests - focusing on essential functionality
 * Tests privacy-first analytics system with basic requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { analytics, type EventType, type AnalyticsEvent } from '@/lib/analytics'

import {
  setupAnalyticsMocks,
  createTestEvents,
  setTestEventsInStorage,
  createInvalidEvents,
  ANALYTICS_STORAGE_KEYS,
} from './analytics-test-utils'

describe('Analytics Core Tests', () => {
  let mocks: ReturnType<typeof setupAnalyticsMocks>

  beforeEach(() => {
    mocks = setupAnalyticsMocks()
  })

  afterEach(() => {
    mocks.cleanup()
  })

  it('should be disabled by default', () => {
    expect(analytics.isEnabled()).toBe(false)

    // Should not track events when disabled
    analytics.trackEvent('page_view')
    expect(analytics.getEvents()).toHaveLength(0)

    // Should return 'disabled' session ID
    expect(analytics.getSessionId()).toBe('disabled')
  })

  it('should not track events when disabled', () => {
    // Ensure analytics is disabled
    analytics.setEnabled(false)

    // Try to track various event types
    const eventTypes: EventType[] = [
      'page_view',
      'reflection_generated',
      'feedback_given',
      'history_toggled',
      'export_completed',
      'error_occurred',
    ]

    eventTypes.forEach((type) => {
      analytics.trackEvent(type)
    })

    // No events should be tracked
    expect(analytics.getEvents()).toHaveLength(0)
    expect(analytics.getEventCount()).toBe(0)

    // Summary should be empty
    const summary = analytics.getSummary()
    expect(summary.totalEvents).toBe(0)
    expect(summary.sessionCount).toBe(0)
  })

  it('should generate unique session IDs', () => {
    // Set up multiple unique UUIDs
    mocks.mockRandomUUID
      .mockReturnValueOnce('session-1')
      .mockReturnValueOnce('session-2')
      .mockReturnValueOnce('session-3')

    // First session
    analytics.setEnabled(true)
    const sessionId1 = analytics.getSessionId()
    expect(sessionId1).toBe('session-1')

    // Disable and re-enable for new session
    analytics.setEnabled(false)
    analytics.setEnabled(true)
    const sessionId2 = analytics.getSessionId()
    expect(sessionId2).toBe('session-2')

    // Generate new session explicitly
    analytics.generateNewSession()
    const sessionId3 = analytics.getSessionId()
    expect(sessionId3).toBe('session-3')

    // All session IDs should be unique
    expect(sessionId1).not.toBe(sessionId2)
    expect(sessionId2).not.toBe(sessionId3)
    expect(sessionId1).not.toBe(sessionId3)
  })

  it('should validate event data properly', () => {
    analytics.setEnabled(true)

    // Test valid events are stored
    analytics.trackEvent('page_view')
    analytics.trackEvent('reflection_generated')
    expect(analytics.getEvents()).toHaveLength(2)

    // Test invalid events are filtered out
    const invalidEventData = createInvalidEvents()

    invalidEventData.forEach(({ event }) => {
      setTestEventsInStorage(
        [event as unknown as AnalyticsEvent],
        mocks.mockLocalStorage
      )

      // Invalid events should be filtered out during getEvents()
      const events = analytics.getEvents()
      expect(events).toHaveLength(0)
    })

    // Test mixed valid/invalid events
    const validEvent = {
      id: 'valid-123',
      sessionId: 'session-123',
      type: 'page_view' as EventType,
      timestamp: Date.now(),
    }

    const invalidEvent = {
      id: '', // Invalid: empty ID
      sessionId: 'session-123',
      type: 'page_view' as EventType,
      timestamp: Date.now(),
    }

    setTestEventsInStorage([validEvent, invalidEvent], mocks.mockLocalStorage)

    const filteredEvents = analytics.getEvents()
    expect(filteredEvents).toHaveLength(1)
    expect(filteredEvents[0]).toEqual(validEvent)
  })

  it('should handle localStorage failures gracefully', () => {
    analytics.setEnabled(true)

    // Mock localStorage to throw errors
    mocks.mockLocalStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })

    mocks.mockLocalStorage.getItem = vi.fn(() => {
      throw new Error('Storage access denied')
    })

    mocks.mockLocalStorage.removeItem = vi.fn(() => {
      throw new Error('Storage error')
    })

    // Operations should not throw
    expect(() => analytics.trackEvent('page_view')).not.toThrow()
    expect(() => analytics.getEvents()).not.toThrow()
    expect(() => analytics.clearData()).not.toThrow()
    expect(() => analytics.setEnabled(false)).not.toThrow()

    // Should return empty/default values
    expect(analytics.getEvents()).toEqual([])
    expect(analytics.getEventCount()).toBe(0)

    // Should handle isEnabled check gracefully
    expect(analytics.isEnabled()).toBe(false) // Default when storage fails
  })

  it('should limit stored events to MAX_EVENTS', () => {
    analytics.setEnabled(true)

    // Pre-populate with events at the limit (1000)
    const existingEvents = createTestEvents(999)
    setTestEventsInStorage(existingEvents, mocks.mockLocalStorage)

    // Verify we have 999 events
    expect(analytics.getEvents()).toHaveLength(999)

    // Add one more event (should be exactly at limit)
    analytics.trackEvent('page_view')
    expect(analytics.getEvents()).toHaveLength(1000)

    // Add another event (should trigger cleanup)
    analytics.trackEvent('reflection_generated')

    const events = analytics.getEvents()
    expect(events).toHaveLength(1000) // Should not exceed 1000

    // Newest events should be at the beginning
    expect(events[0].type).toBe('reflection_generated')
    expect(events[1].type).toBe('page_view')

    // Add multiple events to test consistent limiting
    analytics.trackEvent('feedback_given')
    analytics.trackEvent('history_toggled')
    analytics.trackEvent('export_completed')

    const finalEvents = analytics.getEvents()
    expect(finalEvents).toHaveLength(1000)
    expect(finalEvents[0].type).toBe('export_completed')
    expect(finalEvents[1].type).toBe('history_toggled')
    expect(finalEvents[2].type).toBe('feedback_given')
  })

  it('should clear corrupted data automatically', () => {
    analytics.setEnabled(true)

    // Test corrupted JSON
    mocks.mockLocalStorage.setItem(
      ANALYTICS_STORAGE_KEYS.STORAGE,
      'invalid json data'
    )

    // Should clear corrupted data and return empty array
    expect(analytics.getEvents()).toEqual([])
    expect(
      mocks.mockLocalStorage.getItem(ANALYTICS_STORAGE_KEYS.STORAGE)
    ).toBeNull()

    // Test non-array data
    mocks.mockLocalStorage.setItem(
      ANALYTICS_STORAGE_KEYS.STORAGE,
      '{"not": "array"}'
    )

    // Should clear non-array data
    expect(analytics.getEvents()).toEqual([])
    expect(
      mocks.mockLocalStorage.getItem(ANALYTICS_STORAGE_KEYS.STORAGE)
    ).toBeNull()

    // Test array with all invalid events
    const allInvalidEvents = [
      {
        id: '',
        sessionId: 'test',
        type: 'page_view' as EventType,
        timestamp: Date.now(),
      },
      {
        id: 'test',
        sessionId: '',
        type: 'page_view' as EventType,
        timestamp: Date.now(),
      },
      {
        id: 'test',
        sessionId: 'test',
        type: 'invalid_type' as EventType,
        timestamp: Date.now(),
      },
    ]

    setTestEventsInStorage(
      allInvalidEvents as unknown as AnalyticsEvent[],
      mocks.mockLocalStorage
    )

    // Should clear all invalid events
    expect(analytics.getEvents()).toEqual([])
    expect(
      mocks.mockLocalStorage.getItem(ANALYTICS_STORAGE_KEYS.STORAGE)
    ).toBeNull()

    // Test partial corruption (mix of valid and invalid)
    const mixedEvents = [
      {
        id: 'valid',
        sessionId: 'session',
        type: 'page_view' as EventType,
        timestamp: Date.now(),
      },
      {
        id: '',
        sessionId: 'session',
        type: 'page_view' as EventType,
        timestamp: Date.now(),
      }, // Invalid
      {
        id: 'valid2',
        sessionId: 'session',
        type: 'reflection_generated' as EventType,
        timestamp: Date.now(),
      },
    ]

    setTestEventsInStorage(
      mixedEvents as unknown as AnalyticsEvent[],
      mocks.mockLocalStorage
    )

    const cleanedEvents = analytics.getEvents()
    expect(cleanedEvents).toHaveLength(2) // Only valid events
    expect(cleanedEvents[0].id).toBe('valid')
    expect(cleanedEvents[1].id).toBe('valid2')

    // Verify cleaned data was saved back
    const storedData = JSON.parse(
      mocks.mockLocalStorage.getItem(ANALYTICS_STORAGE_KEYS.STORAGE) || '[]'
    )
    expect(storedData).toHaveLength(2)
  })
})
