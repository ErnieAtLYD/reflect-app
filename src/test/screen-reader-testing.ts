/**
 * Screen Reader Testing Utilities
 *
 * This module provides utilities for testing screen reader accessibility
 * in automated tests and development environments.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Common ARIA attributes to check for accessibility compliance
 */
export const ARIA_ATTRIBUTES = {
  // Widget roles
  roles: [
    'alert',
    'alertdialog',
    'button',
    'checkbox',
    'dialog',
    'gridcell',
    'link',
    'log',
    'marquee',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'progressbar',
    'radio',
    'scrollbar',
    'searchbox',
    'slider',
    'spinbutton',
    'status',
    'switch',
    'tab',
    'tabpanel',
    'textbox',
    'timer',
    'tooltip',
    'treeitem',
  ],

  // State properties
  states: [
    'aria-checked',
    'aria-disabled',
    'aria-expanded',
    'aria-hidden',
    'aria-invalid',
    'aria-pressed',
    'aria-readonly',
    'aria-selected',
  ],

  // Relationship properties
  relationships: [
    'aria-controls',
    'aria-describedby',
    'aria-flowto',
    'aria-labelledby',
    'aria-owns',
    'aria-posinset',
    'aria-setsize',
  ],

  // Live region properties
  liveRegion: ['aria-live', 'aria-relevant', 'aria-atomic', 'aria-busy'],

  // Global properties
  global: [
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'aria-details',
    'aria-keyshortcuts',
    'aria-roledescription',
  ],
}

/**
 * Screen reader announcement tracker for testing
 */
class AnnouncementTracker {
  private announcements: Array<{
    message: string
    priority: 'polite' | 'assertive'
    timestamp: number
  }> = []

  private observer?: MutationObserver

  startTracking(): void {
    this.announcements = []

    // Find existing live regions
    const liveRegions = document.querySelectorAll('[aria-live]')

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'childList' ||
          mutation.type === 'characterData'
        ) {
          const target = mutation.target as HTMLElement
          const liveRegion =
            target.closest('[aria-live]') ||
            (target.hasAttribute('aria-live') ? target : null)

          if (liveRegion && liveRegion.textContent?.trim()) {
            this.announcements.push({
              message: liveRegion.textContent.trim(),
              priority: liveRegion.getAttribute('aria-live') as
                | 'polite'
                | 'assertive',
              timestamp: Date.now(),
            })
          }
        }
      })
    })

    // Observe existing live regions
    liveRegions.forEach((region) => {
      this.observer!.observe(region, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    })

    // Also observe the document for new live regions
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-live'],
    })
  }

  stopTracking(): void {
    this.observer?.disconnect()
    this.observer = undefined
  }

  getAnnouncements(): typeof this.announcements {
    return [...this.announcements]
  }

  getLastAnnouncement(): (typeof this.announcements)[0] | undefined {
    return this.announcements[this.announcements.length - 1]
  }

  clear(): void {
    this.announcements = []
  }

  waitForAnnouncement(
    expectedMessage: string,
    timeout = 3000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now()

      const checkAnnouncements = () => {
        const found = this.announcements.some(
          (a) => a.message.includes(expectedMessage) && a.timestamp >= startTime
        )

        if (found) {
          resolve(true)
        } else if (Date.now() - startTime > timeout) {
          resolve(false)
        } else {
          setTimeout(checkAnnouncements, 100)
        }
      }

      checkAnnouncements()
    })
  }
}

export const announcementTracker = new AnnouncementTracker()

/**
 * Check if an element has proper screen reader support
 */
export function checkScreenReaderSupport(element: HTMLElement): {
  isAccessible: boolean
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []

  // Check for missing labels on interactive elements
  const interactiveElements = ['button', 'input', 'select', 'textarea', 'a']
  if (interactiveElements.includes(element.tagName.toLowerCase())) {
    const hasLabel =
      element.hasAttribute('aria-label') ||
      element.hasAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      ((element as HTMLInputElement).labels?.length ?? 0) > 0

    if (!hasLabel) {
      issues.push('Interactive element lacks accessible name')
      suggestions.push(
        'Add aria-label, aria-labelledby, or visible text content'
      )
    }
  }

  // Check for proper heading hierarchy
  if (element.tagName.match(/^H[1-6]$/)) {
    const level = parseInt(element.tagName[1])
    const previousHeading = element.ownerDocument?.querySelector(
      `h1, h2, h3, h4, h5, h6`
    )

    if (previousHeading && level > 1) {
      const prevLevel = parseInt(previousHeading.tagName[1])
      if (level - prevLevel > 1) {
        issues.push(`Heading level skips from h${prevLevel} to h${level}`)
        suggestions.push('Use sequential heading levels (h1, h2, h3, etc.)')
      }
    }
  }

  // Check for decorative images without alt=""
  if (element.tagName === 'IMG') {
    const img = element as HTMLImageElement
    if (!img.hasAttribute('alt')) {
      issues.push('Image missing alt attribute')
      suggestions.push(
        'Add alt="" for decorative images or descriptive alt text for meaningful images'
      )
    }
  }

  // Check for form validation
  if (element.tagName === 'INPUT' && element.hasAttribute('required')) {
    const hasValidation =
      element.hasAttribute('aria-describedby') ||
      element.hasAttribute('aria-invalid')

    if (!hasValidation) {
      suggestions.push(
        'Consider adding aria-describedby for validation messages'
      )
    }
  }

  // Check for live regions
  if (element.hasAttribute('aria-live')) {
    const liveValue = element.getAttribute('aria-live')
    if (!['polite', 'assertive', 'off'].includes(liveValue || '')) {
      issues.push('Invalid aria-live value')
      suggestions.push('Use aria-live="polite" or aria-live="assertive"')
    }
  }

  return {
    isAccessible: issues.length === 0,
    issues,
    suggestions,
  }
}

/**
 * Test screen reader announcements for a component
 */
export async function testScreenReaderAnnouncements(
  component: React.ReactElement,
  interactions: Array<{
    action: () => Promise<void>
    expectedAnnouncement: string
  }>
): Promise<{
  passed: boolean
  results: Array<{
    action: string
    expected: string
    actual: string | null
    passed: boolean
  }>
}> {
  const results: Array<{
    action: string
    expected: string
    actual: string | null
    passed: boolean
  }> = []

  // Render component and start tracking
  render(component)
  announcementTracker.startTracking()

  try {
    for (const { action, expectedAnnouncement } of interactions) {
      announcementTracker.clear()

      // Perform the action
      await action()

      // Wait for announcement
      const found =
        await announcementTracker.waitForAnnouncement(expectedAnnouncement)
      const lastAnnouncement = announcementTracker.getLastAnnouncement()

      results.push({
        action: action.toString(),
        expected: expectedAnnouncement,
        actual: lastAnnouncement?.message || null,
        passed: found,
      })
    }
  } finally {
    announcementTracker.stopTracking()
  }

  return {
    passed: results.every((r) => r.passed),
    results,
  }
}

/**
 * Test keyboard navigation for a component
 */
export async function testKeyboardNavigation(
  component: React.ReactElement,
  expectedFocusOrder: string[] // Array of test-ids or selectors
): Promise<{
  passed: boolean
  actualOrder: string[]
  issues: string[]
}> {
  const user = userEvent.setup()
  const issues: string[] = []
  const actualOrder: string[] = []

  render(component)

  // Start from the first focusable element
  const firstElement = screen.getByTestId(expectedFocusOrder[0])
  await user.tab() // Tab to first element

  if (document.activeElement !== firstElement) {
    issues.push(
      `First tab did not focus expected element: ${expectedFocusOrder[0]}`
    )
  } else {
    actualOrder.push(expectedFocusOrder[0])
  }

  // Tab through remaining elements
  for (let i = 1; i < expectedFocusOrder.length; i++) {
    await user.tab()

    try {
      const expectedElement = screen.getByTestId(expectedFocusOrder[i])
      if (document.activeElement === expectedElement) {
        actualOrder.push(expectedFocusOrder[i])
      } else {
        issues.push(
          `Tab ${i + 1} did not focus expected element: ${expectedFocusOrder[i]}`
        )
        // Record what was actually focused
        const actual =
          document.activeElement?.getAttribute('data-testid') ||
          document.activeElement?.tagName ||
          'unknown'
        actualOrder.push(actual)
      }
    } catch {
      issues.push(`Expected element not found: ${expectedFocusOrder[i]}`)
    }
  }

  return {
    passed: issues.length === 0,
    actualOrder,
    issues,
  }
}

/**
 * Generate an accessibility report for an element tree
 */
export function generateAccessibilityReport(container: HTMLElement): {
  summary: {
    totalElements: number
    accessibleElements: number
    issueCount: number
  }
  elements: Array<{
    element: string
    tagName: string
    role?: string
    issues: string[]
    suggestions: string[]
  }>
} {
  const allElements = container.querySelectorAll('*')
  const elementReports = Array.from(allElements).map((el) => {
    const report = checkScreenReaderSupport(el as HTMLElement)
    return {
      element: el.outerHTML.slice(0, 100) + '...',
      tagName: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || undefined,
      issues: report.issues,
      suggestions: report.suggestions,
    }
  })

  return {
    summary: {
      totalElements: elementReports.length,
      accessibleElements: elementReports.filter((r) => r.issues.length === 0)
        .length,
      issueCount: elementReports.reduce((sum, r) => sum + r.issues.length, 0),
    },
    elements: elementReports.filter(
      (r) => r.issues.length > 0 || r.suggestions.length > 0
    ),
  }
}
