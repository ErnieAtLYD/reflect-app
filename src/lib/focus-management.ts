/**
 * Focus Management Utilities
 *
 * This module provides comprehensive focus management utilities including
 * focus trapping, restoration, and management during dynamic content changes.
 */

export interface FocusableElement extends HTMLElement {
  focus(): void
}

/**
 * Selector for all focusable elements
 */
const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'details',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]',
].join(', ')

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(
  container: HTMLElement
): FocusableElement[] {
  const elements = Array.from(
    container.querySelectorAll<FocusableElement>(FOCUSABLE_SELECTOR)
  )

  return elements.filter((element) => {
    // Check if element is not disabled
    if (
      element.hasAttribute('disabled') ||
      element.getAttribute('aria-disabled') === 'true'
    ) {
      return false
    }

    // In test environments, we may not have proper layout calculation
    // so we'll be more lenient with visibility checks
    const style = getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false
    }

    // For test environments or when offsetParent is not reliable,
    // check if element is connected to document
    if (element.offsetParent === null) {
      // Element might still be focusable if it's just not positioned
      return element.isConnected && !element.hidden
    }

    return true
  })
}

/**
 * Get the first focusable element within a container
 */
export function getFirstFocusableElement(
  container: HTMLElement
): FocusableElement | null {
  const elements = getFocusableElements(container)
  return elements[0] || null
}

/**
 * Get the last focusable element within a container
 */
export function getLastFocusableElement(
  container: HTMLElement
): FocusableElement | null {
  const elements = getFocusableElements(container)
  return elements[elements.length - 1] || null
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableElements = getFocusableElements(
    element.parentElement || document.body
  )
  return focusableElements.includes(element as FocusableElement)
}

/**
 * Focus trap manager for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement
  private firstFocusable: FocusableElement | null = null
  private lastFocusable: FocusableElement | null = null
  private previousActiveElement: Element | null = null
  private isActive = false
  private handleKeyDown = this.onKeyDown.bind(this)

  constructor(container: HTMLElement) {
    this.container = container
    this.updateFocusableElements()
  }

  /**
   * Update the list of focusable elements
   */
  private updateFocusableElements(): void {
    this.firstFocusable = getFirstFocusableElement(this.container)
    this.lastFocusable = getLastFocusableElement(this.container)
  }

  /**
   * Handle keydown events for focus trapping
   */
  private onKeyDown(event: KeyboardEvent): void {
    if (!this.isActive || event.key !== 'Tab') return

    this.updateFocusableElements()

    if (!this.firstFocusable) {
      event.preventDefault()
      return
    }

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault()
        this.lastFocusable?.focus()
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault()
        this.firstFocusable?.focus()
      }
    }
  }

  /**
   * Activate the focus trap
   */
  activate(focusFirst = true): void {
    if (this.isActive) return

    this.previousActiveElement = document.activeElement
    this.isActive = true

    document.addEventListener('keydown', this.handleKeyDown)

    if (focusFirst) {
      this.updateFocusableElements()
      if (this.firstFocusable) {
        this.firstFocusable.focus()
      }
    }
  }

  /**
   * Deactivate the focus trap and restore previous focus
   */
  deactivate(restoreFocus = true): void {
    if (!this.isActive) return

    this.isActive = false
    document.removeEventListener('keydown', this.handleKeyDown)

    if (restoreFocus && this.previousActiveElement) {
      // Use setTimeout to ensure the element is focusable
      setTimeout(() => {
        if (
          this.previousActiveElement &&
          'focus' in this.previousActiveElement
        ) {
          ;(this.previousActiveElement as HTMLElement).focus()
        }
      }, 0)
    }
  }

  /**
   * Check if the focus trap is currently active
   */
  get active(): boolean {
    return this.isActive
  }
}

/**
 * Focus restoration manager
 */
export class FocusRestoration {
  private focusHistory: Element[] = []
  private maxHistoryLength = 10

  /**
   * Save the current focus to history
   */
  save(): void {
    const activeElement = document.activeElement
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement)

      // Limit history length
      if (this.focusHistory.length > this.maxHistoryLength) {
        this.focusHistory.shift()
      }
    }
  }

  /**
   * Restore focus to the most recent saved element
   */
  restore(): boolean {
    const lastFocusedElement = this.focusHistory.pop()

    if (lastFocusedElement && 'focus' in lastFocusedElement) {
      try {
        ;(lastFocusedElement as HTMLElement).focus()
        return true
      } catch {
        // Element might no longer be in DOM, try previous element
        return this.restore()
      }
    }

    return false
  }

  /**
   * Clear focus history
   */
  clear(): void {
    this.focusHistory = []
  }

  /**
   * Get the current focus history length
   */
  get historyLength(): number {
    return this.focusHistory.length
  }
}

/**
 * Create a global focus restoration instance
 */
export const focusRestoration = new FocusRestoration()

/**
 * Focus manager for dynamic content changes
 */
export class DynamicFocusManager {
  private observers = new Set<MutationObserver>()

  /**
   * Focus the first element in newly added content
   */
  focusNewContent(
    container: HTMLElement,
    options: {
      announceToScreenReader?: boolean
      selectText?: boolean
    } = {}
  ): boolean {
    const { announceToScreenReader = false, selectText = false } = options

    const firstFocusable = getFirstFocusableElement(container)

    if (firstFocusable) {
      firstFocusable.focus()

      if (
        selectText &&
        (firstFocusable instanceof HTMLInputElement ||
          firstFocusable instanceof HTMLTextAreaElement)
      ) {
        firstFocusable.select()
      }

      if (announceToScreenReader) {
        // Use live region to announce the focus change
        const announcement = `New content loaded. Focus moved to ${
          firstFocusable.getAttribute('aria-label') ||
          firstFocusable.textContent?.trim() ||
          firstFocusable.tagName.toLowerCase()
        }`

        this.announceToScreenReader(announcement)
      }

      return true
    }

    return false
  }

  /**
   * Watch for dynamic content changes and manage focus
   */
  observeContentChanges(
    container: HTMLElement,
    callback: (addedNodes: Node[], removedNodes: Node[]) => void
  ): () => void {
    const observer = new MutationObserver((mutations) => {
      const addedNodes: Node[] = []
      const removedNodes: Node[] = []

      mutations.forEach((mutation) => {
        addedNodes.push(...Array.from(mutation.addedNodes))
        removedNodes.push(...Array.from(mutation.removedNodes))
      })

      if (addedNodes.length > 0 || removedNodes.length > 0) {
        callback(addedNodes, removedNodes)
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
    })

    this.observers.add(observer)

    return () => {
      observer.disconnect()
      this.observers.delete(observer)
    }
  }

  /**
   * Announce message to screen readers
   */
  private announceToScreenReader(message: string): void {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message

    document.body.appendChild(announcer)

    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }

  /**
   * Cleanup all observers
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
  }
}

/**
 * Manage focus for roving tabindex pattern
 */
export class RovingTabindexManager {
  private container: HTMLElement
  private items: HTMLElement[] = []
  private currentIndex = 0
  private orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal'
  private handleKeyDown = this.onKeyDown.bind(this)

  constructor(
    container: HTMLElement,
    orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal'
  ) {
    this.container = container
    this.orientation = orientation
    this.updateItems()
    this.setupEventListeners()
  }

  /**
   * Update the list of managed items
   */
  private updateItems(): void {
    this.items = Array.from(
      this.container.querySelectorAll<HTMLElement>(
        '[role="button"], [role="tab"], [role="menuitem"]'
      )
    )

    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1')
    })
  }

  /**
   * Setup keyboard event listeners
   */
  private setupEventListeners(): void {
    this.container.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Handle keyboard navigation
   */
  private onKeyDown(event: KeyboardEvent): void {
    const { key } = event
    let handled = false

    switch (key) {
      case 'ArrowRight':
        if (this.orientation === 'horizontal' || this.orientation === 'both') {
          this.moveToNext()
          handled = true
        }
        break
      case 'ArrowLeft':
        if (this.orientation === 'horizontal' || this.orientation === 'both') {
          this.moveToPrevious()
          handled = true
        }
        break
      case 'ArrowDown':
        if (this.orientation === 'vertical' || this.orientation === 'both') {
          this.moveToNext()
          handled = true
        }
        break
      case 'ArrowUp':
        if (this.orientation === 'vertical' || this.orientation === 'both') {
          this.moveToPrevious()
          handled = true
        }
        break
      case 'Home':
        this.moveToFirst()
        handled = true
        break
      case 'End':
        this.moveToLast()
        handled = true
        break
    }

    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  /**
   * Move focus to next item
   */
  private moveToNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.items.length
    this.updateFocus()
  }

  /**
   * Move focus to previous item
   */
  private moveToPrevious(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.items.length) % this.items.length
    this.updateFocus()
  }

  /**
   * Move focus to first item
   */
  private moveToFirst(): void {
    this.currentIndex = 0
    this.updateFocus()
  }

  /**
   * Move focus to last item
   */
  private moveToLast(): void {
    this.currentIndex = this.items.length - 1
    this.updateFocus()
  }

  /**
   * Update focus and tabindex attributes
   */
  private updateFocus(): void {
    this.items.forEach((item, index) => {
      const isCurrent = index === this.currentIndex
      item.setAttribute('tabindex', isCurrent ? '0' : '-1')

      if (isCurrent) {
        item.focus()
      }
    })
  }

  /**
   * Cleanup event listeners
   */
  cleanup(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown)
  }
}
