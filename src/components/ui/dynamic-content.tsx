/**
 * Dynamic Content Component
 *
 * A component that manages focus during dynamic content changes,
 * ensuring keyboard users are properly guided through content updates.
 */

'use client'

import * as React from 'react'

import {
  useDynamicFocus,
  useFocusAnnouncements,
} from '@/hooks/use-focus-management'
import { liveRegions } from '@/lib/live-regions'
import { cn } from '@/lib/utils'

interface DynamicContentProps {
  /**
   * The content to render
   */
  children: React.ReactNode

  /**
   * Whether to automatically focus new content
   */
  autoFocus?: boolean

  /**
   * Whether to announce content changes to screen readers
   */
  announceChanges?: boolean

  /**
   * Custom announcement message for content changes
   */
  changeAnnouncement?: string

  /**
   * Whether to select text in focused input elements
   */
  selectText?: boolean

  /**
   * Loading state content
   */
  loadingContent?: React.ReactNode

  /**
   * Error state content
   */
  errorContent?: React.ReactNode

  /**
   * Content state
   */
  state?: 'loading' | 'error' | 'success'

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for testing
   */
  'data-testid'?: string

  /**
   * Callback when content changes are detected
   */
  onContentChange?: (type: 'added' | 'removed' | 'updated') => void
}

/**
 * Dynamic Content - Manages focus during content changes
 *
 * This component automatically manages focus when content is dynamically
 * updated, ensuring keyboard users are properly notified and guided to
 * new content. It's particularly useful for loading states, form updates,
 * and dynamic content insertion.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DynamicContent autoFocus announceChanges>
 *   {dynamicContent}
 * </DynamicContent>
 *
 * // With loading states
 * <DynamicContent
 *   state="loading"
 *   loadingContent={<div>Loading...</div>}
 *   autoFocus
 * >
 *   {content}
 * </DynamicContent>
 *
 * // With custom announcements
 * <DynamicContent
 *   announceChanges
 *   changeAnnouncement="New search results loaded"
 * >
 *   {searchResults}
 * </DynamicContent>
 * ```
 */
export const DynamicContent: React.FC<DynamicContentProps> = ({
  children,
  autoFocus = false,
  announceChanges = true,
  changeAnnouncement,
  selectText = false,
  loadingContent,
  errorContent,
  state = 'success',
  className,
  'data-testid': dataTestId,
  onContentChange,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { focusNewContent, observeContentChanges } = useDynamicFocus()
  const { announce } = useFocusAnnouncements()
  const [hasRendered, setHasRendered] = React.useState(false)
  const prevChildrenRef = React.useRef<React.ReactNode>(null)

  // Observe content changes
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cleanup = observeContentChanges(
      container,
      (addedNodes, removedNodes) => {
        const hasAddedElements = addedNodes.some(
          (node) => node.nodeType === Node.ELEMENT_NODE
        )
        const hasRemovedElements = removedNodes.some(
          (node) => node.nodeType === Node.ELEMENT_NODE
        )

        let changeType: 'added' | 'removed' | 'updated' = 'updated'

        if (hasAddedElements && !hasRemovedElements) {
          changeType = 'added'
        } else if (!hasAddedElements && hasRemovedElements) {
          changeType = 'removed'
        }

        onContentChange?.(changeType)

        // Auto-focus new content if enabled
        if (autoFocus && hasAddedElements && hasRendered) {
          setTimeout(() => {
            focusNewContent(container, {
              announceToScreenReader: announceChanges,
              selectText,
            })
          }, 100)
        }

        // Announce changes if enabled
        if (announceChanges && hasRendered) {
          const message =
            changeAnnouncement || getDefaultAnnouncement(changeType)
          if (message) {
            announce(message, 'polite')
          }
        }
      }
    )

    return cleanup
  }, [
    autoFocus,
    announceChanges,
    changeAnnouncement,
    selectText,
    hasRendered,
    focusNewContent,
    observeContentChanges,
    announce,
    onContentChange,
  ])

  // Track when component has initially rendered
  React.useEffect(() => {
    setHasRendered(true)
  }, [])

  // Detect children changes
  React.useEffect(() => {
    if (prevChildrenRef.current !== children && hasRendered) {
      // Content has changed, handle accordingly
      if (announceChanges) {
        const message = changeAnnouncement || 'Content updated'
        liveRegions.announce(message, { priority: 'polite' })
      }
    }
    prevChildrenRef.current = children
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRendered, announceChanges, changeAnnouncement])

  // Handle state-specific content and announcements
  React.useEffect(() => {
    if (!hasRendered) return

    switch (state) {
      case 'loading':
        if (announceChanges) {
          liveRegions.announceLoading('Content is loading...')
        }
        break
      case 'error':
        if (announceChanges) {
          liveRegions.announceError('An error occurred while loading content')
        }
        break
      case 'success':
        if (announceChanges && prevChildrenRef.current !== children) {
          liveRegions.announceLoading('', false) // Clear loading message
        }
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, hasRendered, announceChanges])

  // Render appropriate content based on state
  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          loadingContent || (
            <div
              className="flex items-center justify-center p-4"
              role="status"
              aria-label="Loading content"
              data-testid="dynamic-content-loading"
            >
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              <span className="sr-only">Loading...</span>
            </div>
          )
        )
      case 'error':
        return (
          errorContent || (
            <div
              className="text-destructive flex items-center justify-center p-4"
              role="alert"
              aria-label="Content error"
              data-testid="dynamic-content-error"
            >
              <span>Failed to load content</span>
            </div>
          )
        )
      case 'success':
        return children
      default:
        return children
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('focus-within:outline-none', className)}
      data-testid={dataTestId || 'dynamic-content'}
      data-state={state}
    >
      {renderContent()}
    </div>
  )
}

/**
 * Get default announcement message for content change type
 */
function getDefaultAnnouncement(
  changeType: 'added' | 'removed' | 'updated'
): string {
  switch (changeType) {
    case 'added':
      return 'New content added'
    case 'removed':
      return 'Content removed'
    case 'updated':
      return 'Content updated'
    default:
      return 'Content changed'
  }
}

/**
 * Loading Content Component
 *
 * A specialized loading component with proper accessibility attributes
 */
interface LoadingContentProps {
  /**
   * Loading message
   */
  message?: string

  /**
   * Size of the loading spinner
   */
  size?: 'sm' | 'default' | 'lg'

  /**
   * Additional CSS classes
   */
  className?: string
}

export const LoadingContent: React.FC<LoadingContentProps> = ({
  message = 'Loading...',
  size = 'default',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn('flex items-center justify-center gap-3 p-4', className)}
      role="status"
      aria-label={message}
      data-testid="loading-content"
    >
      <div
        className={cn(
          'border-primary animate-spin rounded-full border-2 border-t-transparent',
          sizeClasses[size]
        )}
      />
      <span className="text-muted-foreground text-sm">{message}</span>
      <span className="sr-only">{message}</span>
    </div>
  )
}

/**
 * Error Content Component
 *
 * A specialized error component with proper accessibility attributes
 */
interface ErrorContentProps {
  /**
   * Error message
   */
  message?: string

  /**
   * Whether to show retry button
   */
  showRetry?: boolean

  /**
   * Retry callback
   */
  onRetry?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

export const ErrorContent: React.FC<ErrorContentProps> = ({
  message = 'An error occurred',
  showRetry = false,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'text-destructive flex flex-col items-center justify-center gap-3 p-4',
        className
      )}
      role="alert"
      aria-label="Content error"
      data-testid="error-content"
    >
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="text-primary hover:text-primary/80 text-sm underline underline-offset-4"
          data-testid="error-retry-button"
        >
          Try again
        </button>
      )}
    </div>
  )
}
