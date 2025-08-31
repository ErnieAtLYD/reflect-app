'use client'

import { useCallback, useEffect } from 'react'

import { analytics, type EventType } from '@/lib/analytics'

/**
 * Custom hook for analytics tracking
 * Provides a clean interface for tracking events throughout the app
 */
export const useAnalytics = () => {
  const trackEvent = useCallback((eventType: EventType) => {
    // Only track if analytics is enabled
    if (analytics.isEnabled()) {
      analytics.trackEvent(eventType)
    }
  }, [])

  return {
    trackEvent,
    isEnabled: analytics.isEnabled(),
    setEnabled: analytics.setEnabled.bind(analytics),
    clearData: analytics.clearData.bind(analytics),
    getSummary: analytics.getSummary.bind(analytics),
  }
}

/**
 * Hook for automatic page view tracking
 * Tracks page views when component mounts
 */
export const usePageTracking = () => {
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    // Track page view on mount
    trackEvent('page_view')
  }, [trackEvent])
}
