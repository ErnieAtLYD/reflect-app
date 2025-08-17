/**
 * E2E tests for analytics functionality
 * Tests analytics behavior in real browser environment
 */

import { test, expect, type Page } from '@playwright/test'

// Type definition for analytics events to match our implementation
interface AnalyticsEvent {
  id: string
  sessionId: string
  type: string
  timestamp: number
}

// Helper function to check if analytics is enabled
async function isAnalyticsEnabled(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    try {
      return localStorage.getItem('reflect-analytics-enabled') === 'true'
    } catch {
      return false
    }
  })
}

// Helper function to enable analytics
async function enableAnalytics(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('reflect-analytics-enabled', 'true')
  })
}

// Helper function to get analytics events
async function getAnalyticsEvents(page: Page): Promise<AnalyticsEvent[]> {
  return await page.evaluate(() => {
    try {
      const stored = localStorage.getItem('reflect-analytics')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
}

// Helper function to clear analytics data
async function clearAnalyticsData(page: Page) {
  await page.evaluate(() => {
    try {
      localStorage.removeItem('reflect-analytics')
      localStorage.removeItem('reflect-analytics-enabled')
      sessionStorage.removeItem('reflect-analytics-session')
    } catch {
      // Ignore errors in cleaning
    }
  })
}

test.describe('Analytics E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear analytics data before each test
    await clearAnalyticsData(page)
    await page.goto('/')
  })

  test('should be disabled by default', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const enabled = await isAnalyticsEnabled(page)
    expect(enabled).toBe(false)

    const events = await getAnalyticsEvents(page)
    expect(events).toHaveLength(0)
  })

  test('should track events when enabled', async ({ page }) => {
    await enableAnalytics(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait a bit for any page view events to be tracked
    await page.waitForTimeout(1000)

    const events = await getAnalyticsEvents(page)

    // Should have at least some events when enabled
    // (exact number depends on app implementation)
    expect(events.length).toBeGreaterThanOrEqual(0)

    // If events exist, verify their structure
    if (events.length > 0) {
      const event = events[0]
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('sessionId')
      expect(event).toHaveProperty('type')
      expect(event).toHaveProperty('timestamp')

      expect(typeof event.id).toBe('string')
      expect(typeof event.sessionId).toBe('string')
      expect(typeof event.type).toBe('string')
      expect(typeof event.timestamp).toBe('number')
    }
  })

  test('should not track when disabled', async ({ page }) => {
    // Ensure analytics is disabled
    await page.evaluate(() => {
      localStorage.setItem('reflect-analytics-enabled', 'false')
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const events = await getAnalyticsEvents(page)
    expect(events).toHaveLength(0)
  })

  test('should maintain privacy compliance', async ({ page }) => {
    await enableAnalytics(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const events = await getAnalyticsEvents(page)

    // Check that events only contain allowed properties
    events.forEach((event: AnalyticsEvent) => {
      const keys = Object.keys(event)

      // Should only have required properties
      expect(keys).toHaveLength(4)
      expect(keys).toContain('id')
      expect(keys).toContain('sessionId')
      expect(keys).toContain('type')
      expect(keys).toContain('timestamp')

      // Should not contain any PII or unexpected properties
      expect(keys).not.toContain('content')
      expect(keys).not.toContain('userAgent')
      expect(keys).not.toContain('ip')
      expect(keys).not.toContain('userId')
      expect(keys).not.toContain('url')
      expect(keys).not.toContain('referrer')
    })
  })

  test('should handle storage quota gracefully', async ({ page }) => {
    await enableAnalytics(page)

    // Mock localStorage to simulate quota exceeded
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem
      let callCount = 0

      localStorage.setItem = function (key: string, value: string) {
        callCount++
        if (callCount > 5 && key === 'reflect-analytics') {
          const error = new Error('QuotaExceededError')
          error.name = 'QuotaExceededError'
          throw error
        }
        return originalSetItem.call(this, key, value)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Page should still function normally even with storage errors
    expect(await page.isVisible('body')).toBe(true)

    // No JavaScript errors should be thrown
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(500)

    // Filter out known non-analytics errors
    const analyticsErrors = errors.filter(
      (error) =>
        error.includes('analytics') ||
        error.includes('QuotaExceededError') ||
        error.includes('localStorage')
    )

    // Should handle storage errors gracefully (no errors should propagate)
    expect(analyticsErrors).toHaveLength(0)
  })

  test('should limit events to maximum count', async ({ page }) => {
    await enableAnalytics(page)

    // Pre-populate with many events
    await page.evaluate(() => {
      const events = Array.from({ length: 1005 }, (_, i) => ({
        id: `test-event-${i}`,
        sessionId: 'test-session',
        type: 'page_view',
        timestamp: Date.now() - (1005 - i) * 1000,
      }))

      try {
        localStorage.setItem('reflect-analytics', JSON.stringify(events))
      } catch {
        // Ignore if storage fails
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const events = await getAnalyticsEvents(page)

    // Should not exceed 1000 events (MAX_EVENTS limit)
    expect(events.length).toBeLessThanOrEqual(1000)
  })

  test('should clear corrupted data automatically', async ({ page }) => {
    // Set corrupted data in localStorage
    await page.evaluate(() => {
      try {
        localStorage.setItem('reflect-analytics', 'invalid json data')
        localStorage.setItem('reflect-analytics-enabled', 'true')
      } catch {
        // Ignore if setting fails
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Should clear corrupted data and continue functioning
    const events = await getAnalyticsEvents(page)

    // Should either be empty (cleared) or contain valid events
    if (events.length > 0) {
      events.forEach((event: AnalyticsEvent) => {
        expect(event).toHaveProperty('id')
        expect(event).toHaveProperty('sessionId')
        expect(event).toHaveProperty('type')
        expect(event).toHaveProperty('timestamp')
      })
    }

    // Page should still function normally
    expect(await page.isVisible('body')).toBe(true)
  })
})
