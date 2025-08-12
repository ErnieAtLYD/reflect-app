/**
 * ARIA Announcer Component
 *
 * A React component that provides screen reader announcements for dynamic
 * content changes and complex UI patterns.
 */

'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type AnnouncementType = 'polite' | 'assertive' | 'off'

interface AriaAnnouncerProps {
  /**
   * The message to announce to screen readers
   */
  message: string

  /**
   * The priority of the announcement
   * - 'polite': Wait for current speech to finish
   * - 'assertive': Interrupt current speech
   * - 'off': Don't announce
   */
  priority?: AnnouncementType

  /**
   * Whether the announcement should be atomic
   * When true, the entire region is announced, not just changes
   */
  atomic?: boolean

  /**
   * Auto-clear the message after a timeout (in milliseconds)
   * Set to 0 to disable auto-clear
   */
  clearAfter?: number

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Callback when the announcement is cleared
   */
  onClear?: () => void

  /**
   * Test ID for accessibility testing
   */
  'data-testid'?: string
}

/**
 * ARIA Announcer - Provides screen reader announcements for dynamic content
 *
 * This component creates a live region that can announce messages to screen readers
 * without disrupting the visual layout. It's useful for providing feedback about
 * dynamic content changes, form validation, loading states, etc.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AriaAnnouncer message="Form submitted successfully" priority="polite" />
 *
 * // With auto-clear
 * <AriaAnnouncer
 *   message="Loading complete"
 *   priority="assertive"
 *   clearAfter={3000}
 * />
 *
 * // For error announcements
 * <AriaAnnouncer
 *   message="Please correct the errors below"
 *   priority="assertive"
 *   atomic={true}
 * />
 * ```
 */
export const AriaAnnouncer: React.FC<AriaAnnouncerProps> = ({
  message,
  priority = 'polite',
  atomic = false,
  clearAfter = 0,
  className,
  onClear,
  'data-testid': dataTestId = 'aria-announcer',
}) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const [currentMessage, setCurrentMessage] = React.useState(message)

  // Update message when prop changes
  React.useEffect(() => {
    if (message !== currentMessage) {
      setCurrentMessage(message)
    }
  }, [message, currentMessage])

  // Handle auto-clear
  React.useEffect(() => {
    if (clearAfter > 0 && currentMessage) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setCurrentMessage('')
        onClear?.()
      }, clearAfter)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentMessage, clearAfter, onClear])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (priority === 'off' || !currentMessage.trim()) {
    return null
  }

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
      data-testid={dataTestId}
    >
      {currentMessage}
    </div>
  )
}

/**
 * Hook for managing ARIA announcements
 *
 * Provides a convenient way to manage announcements in React components
 * without having to manually manage the AriaAnnouncer component.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { announce, announcer } = useAriaAnnouncements()
 *
 *   const handleSubmit = () => {
 *     announce('Form submitted successfully', 'polite')
 *   }
 *
 *   return (
 *     <div>
 *       <form onSubmit={handleSubmit}>
 *         {/* form content *\/}
 *       </form>
 *       {announcer}
 *     </div>
 *   )
 * }
 * ```
 */
export const useAriaAnnouncements = (
  defaultPriority: AnnouncementType = 'polite'
) => {
  const [announcement, setAnnouncement] = React.useState<{
    message: string
    priority: AnnouncementType
    atomic?: boolean
    clearAfter?: number
  } | null>(null)

  const announce = React.useCallback(
    (
      message: string,
      priority: AnnouncementType = defaultPriority,
      options: { atomic?: boolean; clearAfter?: number } = {}
    ) => {
      setAnnouncement({
        message,
        priority,
        atomic: options.atomic,
        clearAfter: options.clearAfter ?? 3000,
      })
    },
    [defaultPriority]
  )

  const clear = React.useCallback(() => {
    setAnnouncement(null)
  }, [])

  const announcer = announcement ? (
    <AriaAnnouncer
      message={announcement.message}
      priority={announcement.priority}
      atomic={announcement.atomic}
      clearAfter={announcement.clearAfter}
      onClear={clear}
    />
  ) : null

  return {
    announce,
    clear,
    announcer,
    hasAnnouncement: !!announcement,
  }
}

/**
 * Status Announcer - Specialized announcer for status updates
 *
 * A pre-configured announcer specifically for status messages like
 * loading, success, error states.
 */
interface StatusAnnouncerProps {
  status: 'loading' | 'success' | 'error' | 'idle'
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  className?: string
}

export const StatusAnnouncer: React.FC<StatusAnnouncerProps> = ({
  status,
  loadingMessage = 'Loading...',
  successMessage = 'Operation completed successfully',
  errorMessage = 'An error occurred',
  className,
}) => {
  const getMessage = () => {
    switch (status) {
      case 'loading':
        return loadingMessage
      case 'success':
        return successMessage
      case 'error':
        return errorMessage
      default:
        return ''
    }
  }

  const getPriority = (): AnnouncementType => {
    switch (status) {
      case 'error':
        return 'assertive'
      case 'loading':
      case 'success':
        return 'polite'
      default:
        return 'off'
    }
  }

  return (
    <AriaAnnouncer
      message={getMessage()}
      priority={getPriority()}
      clearAfter={status === 'loading' ? 0 : 5000}
      className={className}
      data-testid={`status-announcer-${status}`}
    />
  )
}

/**
 * Form Validation Announcer - Specialized announcer for form validation
 *
 * Provides appropriate announcements for form validation states with
 * proper timing and priority.
 */
interface ValidationAnnouncerProps {
  isValid: boolean
  errorMessage?: string
  successMessage?: string
  showErrors: boolean
  className?: string
}

export const ValidationAnnouncer: React.FC<ValidationAnnouncerProps> = ({
  isValid,
  errorMessage = 'Please correct the errors in the form',
  successMessage = 'Form validation passed',
  showErrors,
  className,
}) => {
  const getMessage = () => {
    if (showErrors && !isValid && errorMessage) {
      return errorMessage
    }
    if (isValid && successMessage) {
      return successMessage
    }
    return ''
  }

  const priority: AnnouncementType =
    !isValid && showErrors ? 'assertive' : 'polite'

  return (
    <AriaAnnouncer
      message={getMessage()}
      priority={priority}
      atomic={true}
      clearAfter={!isValid ? 0 : 3000} // Keep error messages visible longer
      className={className}
      data-testid="validation-announcer"
    />
  )
}
