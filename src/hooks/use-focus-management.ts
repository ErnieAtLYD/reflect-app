/**
 * React Hooks for Focus Management
 *
 * This module provides React hooks for managing focus in components,
 * including focus trapping, restoration, and dynamic content focus.
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

import {
  DynamicFocusManager,
  focusRestoration,
  FocusTrap,
  getFocusableElements,
  getFirstFocusableElement,
  RovingTabindexManager,
} from '@/lib/focus-management'

/**
 * Hook for managing focus traps in modals and dialogs
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean = false
) {
  const containerRef = useRef<T>(null)
  const focusTrapRef = useRef<FocusTrap | null>(null)

  const activate = useCallback((focusFirst = true) => {
    if (containerRef.current && !focusTrapRef.current?.active) {
      if (!focusTrapRef.current) {
        focusTrapRef.current = new FocusTrap(containerRef.current)
      }
      focusTrapRef.current.activate(focusFirst)
    }
  }, [])

  const deactivate = useCallback((restoreFocus = true) => {
    if (focusTrapRef.current?.active) {
      focusTrapRef.current.deactivate(restoreFocus)
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      activate()
    } else {
      deactivate()
    }

    return () => {
      if (focusTrapRef.current?.active) {
        focusTrapRef.current.deactivate()
      }
    }
  }, [isActive, activate, deactivate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (focusTrapRef.current?.active) {
        focusTrapRef.current.deactivate()
      }
    }
  }, [])

  return {
    containerRef,
    activate,
    deactivate,
    isActive: focusTrapRef.current?.active ?? false,
  }
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestoration() {
  const saveFocus = useCallback(() => {
    focusRestoration.save()
  }, [])

  const restoreFocus = useCallback(() => {
    return focusRestoration.restore()
  }, [])

  const clearHistory = useCallback(() => {
    focusRestoration.clear()
  }, [])

  return {
    saveFocus,
    restoreFocus,
    clearHistory,
    historyLength: focusRestoration.historyLength,
  }
}

/**
 * Hook for managing focus on dynamic content changes
 */
export function useDynamicFocus() {
  const managerRef = useRef<DynamicFocusManager | null>(null)

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new DynamicFocusManager()
    }

    return () => {
      managerRef.current?.cleanup()
    }
  }, [])

  const focusNewContent = useCallback(
    (
      container: HTMLElement,
      options?: {
        announceToScreenReader?: boolean
        selectText?: boolean
      }
    ) => {
      return managerRef.current?.focusNewContent(container, options) ?? false
    },
    []
  )

  const observeContentChanges = useCallback(
    (
      container: HTMLElement,
      callback: (addedNodes: Node[], removedNodes: Node[]) => void
    ) => {
      return (
        managerRef.current?.observeContentChanges(container, callback) ??
        (() => {})
      )
    },
    []
  )

  return {
    focusNewContent,
    observeContentChanges,
  }
}

/**
 * Hook for managing roving tabindex pattern
 */
export function useRovingTabindex(
  orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal'
) {
  const containerRef = useRef<HTMLElement>(null)
  const managerRef = useRef<RovingTabindexManager | null>(null)

  useEffect(() => {
    if (containerRef.current && !managerRef.current) {
      managerRef.current = new RovingTabindexManager(
        containerRef.current,
        orientation
      )
    }

    return () => {
      managerRef.current?.cleanup()
      managerRef.current = null
    }
  }, [orientation])

  return {
    containerRef,
  }
}

/**
 * Hook for managing focus on mount/unmount
 */
export function useAutoFocus<T extends HTMLElement = HTMLElement>(
  options: {
    enabled?: boolean
    selectText?: boolean
    delay?: number
  } = {}
) {
  const { enabled = true, selectText = false, delay = 0 } = options
  const elementRef = useRef<T>(null)

  useEffect(() => {
    if (!enabled || !elementRef.current) return

    const focusElement = () => {
      if (elementRef.current) {
        elementRef.current.focus()

        if (
          selectText &&
          (elementRef.current instanceof HTMLInputElement ||
            elementRef.current instanceof HTMLTextAreaElement)
        ) {
          elementRef.current.select()
        }
      }
    }

    if (delay > 0) {
      const timeoutId = setTimeout(focusElement, delay)
      return () => clearTimeout(timeoutId)
    } else {
      focusElement()
    }
  }, [enabled, selectText, delay])

  return elementRef
}

/**
 * Hook for managing focus visible state
 */
export function useFocusVisible() {
  const elementRef = useRef<HTMLElement>(null)
  const wasKeyboardRef = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseDown = () => {
      wasKeyboardRef.current = false
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') {
        wasKeyboardRef.current = true
      }
    }

    const handleFocus = () => {
      if (wasKeyboardRef.current) {
        element.setAttribute('data-focus-visible', 'true')
      }
    }

    const handleBlur = () => {
      element.removeAttribute('data-focus-visible')
    }

    element.addEventListener('mousedown', handleMouseDown)
    element.addEventListener('keydown', handleKeyDown)
    element.addEventListener('focus', handleFocus)
    element.addEventListener('blur', handleBlur)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('keydown', handleKeyDown)
      element.removeEventListener('focus', handleFocus)
      element.removeEventListener('blur', handleBlur)
    }
  }, [])

  return elementRef
}

/**
 * Hook for managing focus within a container
 */
export function useContainerFocus() {
  const containerRef = useRef<HTMLElement>(null)

  const focusFirst = useCallback(() => {
    if (containerRef.current) {
      const firstFocusable = getFirstFocusableElement(containerRef.current)
      if (firstFocusable) {
        firstFocusable.focus()
        return true
      }
    }
    return false
  }, [])

  const focusLast = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current)
      const lastFocusable = focusableElements[focusableElements.length - 1]
      if (lastFocusable) {
        lastFocusable.focus()
        return true
      }
    }
    return false
  }, [])

  const focusNext = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current)
      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      )

      if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus()
        return true
      } else if (focusableElements.length > 0) {
        // Wrap to first
        focusableElements[0].focus()
        return true
      }
    }
    return false
  }, [])

  const focusPrevious = useCallback(() => {
    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current)
      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      )

      if (currentIndex > 0) {
        focusableElements[currentIndex - 1].focus()
        return true
      } else if (focusableElements.length > 0) {
        // Wrap to last
        focusableElements[focusableElements.length - 1].focus()
        return true
      }
    }
    return false
  }, [])

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
  }
}

/**
 * Hook for managing focus announcements to screen readers
 */
export function useFocusAnnouncements() {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', priority)
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.textContent = message

      document.body.appendChild(announcer)

      setTimeout(() => {
        if (document.body.contains(announcer)) {
          document.body.removeChild(announcer)
        }
      }, 1000)
    },
    []
  )

  const announceFocusChange = useCallback(
    (elementDescription: string) => {
      announce(`Focus moved to ${elementDescription}`, 'polite')
    },
    [announce]
  )

  const announceNavigation = useCallback(
    (destination: string) => {
      announce(`Navigated to ${destination}`, 'polite')
    },
    [announce]
  )

  return {
    announce,
    announceFocusChange,
    announceNavigation,
  }
}
