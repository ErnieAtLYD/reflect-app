/**
 * Live Regions Utility for Screen Reader Announcements
 *
 * This utility provides a centralized way to announce dynamic content changes
 * to screen readers using ARIA live regions. It handles different announcement
 * priorities and ensures proper cleanup.
 */

export type AnnouncementPriority = 'polite' | 'assertive' | 'off'

interface LiveRegionConfig {
  priority: AnnouncementPriority
  timeout?: number
  clearPrevious?: boolean
}

class LiveRegionManager {
  private regions = new Map<AnnouncementPriority, HTMLElement>()
  private timeouts = new Map<AnnouncementPriority, number>()

  private ensureRegion(priority: AnnouncementPriority): HTMLElement {
    if (!this.regions.has(priority)) {
      const region = document.createElement('div')
      region.setAttribute('aria-live', priority)
      region.setAttribute('aria-atomic', 'true')
      region.setAttribute('role', 'status')
      region.className = 'sr-only'
      region.id = `live-region-${priority}`

      // Add to the document
      document.body.appendChild(region)
      this.regions.set(priority, region)
    }

    return this.regions.get(priority)!
  }

  private clearTimeout(priority: AnnouncementPriority): void {
    const timeoutId = this.timeouts.get(priority)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      this.timeouts.delete(priority)
    }
  }

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param config - Configuration for the announcement
   */
  announce(
    message: string,
    config: LiveRegionConfig = { priority: 'polite' }
  ): void {
    if (!message.trim()) return

    const { priority, timeout = 1000, clearPrevious = true } = config

    // Clear any existing timeout for this priority
    this.clearTimeout(priority)

    // Get or create the live region
    const region = this.ensureRegion(priority)

    // Clear previous content if requested
    if (clearPrevious) {
      region.textContent = ''

      // Force a reflow to ensure the clear is processed
      void region.offsetHeight
    }

    // Set the new message
    region.textContent = message

    // Auto-clear the message after timeout to prevent accumulation
    if (timeout > 0) {
      const timeoutId = window.setTimeout(() => {
        region.textContent = ''
        this.timeouts.delete(priority)
      }, timeout)

      this.timeouts.set(priority, timeoutId)
    }
  }

  /**
   * Announce form validation errors
   * @param message - The error message
   * @param fieldName - Optional field name for context
   */
  announceError(message: string, fieldName?: string): void {
    const fullMessage = fieldName ? `${fieldName}: ${message}` : message

    this.announce(fullMessage, {
      priority: 'assertive',
      timeout: 5000,
      clearPrevious: true,
    })
  }

  /**
   * Announce successful form submissions or actions
   * @param message - The success message
   */
  announceSuccess(message: string): void {
    this.announce(message, {
      priority: 'polite',
      timeout: 3000,
      clearPrevious: true,
    })
  }

  /**
   * Announce loading states
   * @param message - The loading message
   * @param isLoading - Whether currently loading
   */
  announceLoading(message: string, isLoading = true): void {
    if (isLoading) {
      this.announce(message, {
        priority: 'polite',
        timeout: 0, // Don't auto-clear loading messages
        clearPrevious: true,
      })
    } else {
      // Clear the loading message
      const region = this.regions.get('polite')
      if (region) {
        region.textContent = ''
      }
    }
  }

  /**
   * Announce navigation changes
   * @param message - The navigation message
   */
  announceNavigation(message: string): void {
    this.announce(message, {
      priority: 'polite',
      timeout: 2000,
      clearPrevious: true,
    })
  }

  /**
   * Clear all announcements
   */
  clearAll(): void {
    this.regions.forEach((region) => {
      region.textContent = ''
    })

    this.timeouts.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })
    this.timeouts.clear()
  }

  /**
   * Cleanup all live regions (useful for SSR/testing)
   */
  cleanup(): void {
    this.clearAll()

    this.regions.forEach((region) => {
      region.remove()
    })

    this.regions.clear()
  }
}

// Create a singleton instance
export const liveRegions = new LiveRegionManager()

/**
 * React hook for using live regions in components
 */
export function useLiveRegions() {
  return {
    announce: liveRegions.announce.bind(liveRegions),
    announceError: liveRegions.announceError.bind(liveRegions),
    announceSuccess: liveRegions.announceSuccess.bind(liveRegions),
    announceLoading: liveRegions.announceLoading.bind(liveRegions),
    announceNavigation: liveRegions.announceNavigation.bind(liveRegions),
    clearAll: liveRegions.clearAll.bind(liveRegions),
  }
}

/**
 * Helper function to announce messages with proper formatting
 * for different types of content updates
 */
export const announceContentUpdate = (
  type: 'added' | 'removed' | 'updated' | 'loaded' | 'error',
  itemName: string,
  details?: string
) => {
  const messages = {
    added: `${itemName} added${details ? `. ${details}` : ''}`,
    removed: `${itemName} removed${details ? `. ${details}` : ''}`,
    updated: `${itemName} updated${details ? `. ${details}` : ''}`,
    loaded: `${itemName} loaded${details ? `. ${details}` : ''}`,
    error: `Error with ${itemName}${details ? `: ${details}` : ''}`,
  }

  const priority = type === 'error' ? 'assertive' : 'polite'
  liveRegions.announce(messages[type], { priority })
}
