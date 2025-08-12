'use client'

import { forwardRef, type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export interface SkipLinkProps extends ComponentProps<'a'> {
  /** The target element ID to skip to */
  href: string
  /** The text content for the skip link */
  children: React.ReactNode
}

/**
 * Skip Link component for keyboard navigation accessibility
 *
 * Provides users with keyboard navigation shortcuts to important page sections.
 * Hidden by default, visible when focused. Meets WCAG 2.1 AA requirements.
 *
 * @example
 * ```tsx
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 * <SkipLink href="#navigation">Skip to navigation</SkipLink>
 * ```
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href, children, className, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()

      // Find the target element
      const targetId = href.replace('#', '')
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        // Scroll to the target element
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })

        // Focus the target element for screen readers
        // Add tabindex="-1" temporarily if it's not focusable
        const originalTabIndex = targetElement.getAttribute('tabindex')
        const isFocusable = targetElement.matches(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (!isFocusable) {
          targetElement.setAttribute('tabindex', '-1')
        }

        targetElement.focus({ preventScroll: true })

        // Restore original tabindex after a brief delay
        if (!isFocusable && originalTabIndex === null) {
          setTimeout(() => {
            targetElement.removeAttribute('tabindex')
          }, 100)
        } else if (!isFocusable && originalTabIndex !== null) {
          setTimeout(() => {
            targetElement.setAttribute('tabindex', originalTabIndex)
          }, 100)
        }
      }
    }

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        className={cn(
          // Screen reader only by default - completely hidden from visual users
          'sr-only',
          // When focused, become visible with high contrast styling
          'focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
          'focus:bg-primary focus:rounded-md focus:px-4 focus:py-2',
          'focus:text-primary-foreground focus:font-medium focus:no-underline',
          'focus:ring-primary-foreground/50 focus:shadow-lg focus:ring-2 focus:outline-none',
          // Smooth transitions
          'transition-all duration-150 ease-in-out',
          className
        )}
        data-testid="skip-link"
        {...props}
      >
        {children}
      </a>
    )
  }
)

SkipLink.displayName = 'SkipLink'

/**
 * Skip Navigation component that provides a collection of skip links
 *
 * Should be placed as the first elements in the page for proper tab order.
 *
 * @example
 * ```tsx
 * <SkipNavigation>
 *   <SkipLink href="#main-content">Skip to main content</SkipLink>
 *   <SkipLink href="#navigation">Skip to navigation</SkipLink>
 * </SkipNavigation>
 * ```
 */
export const SkipNavigation = ({
  children,
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <div
      className={cn(
        // Container for skip links - positioned at top of page
        'relative z-50',
        className
      )}
      role="navigation"
      aria-label="Skip navigation"
      data-testid="skip-navigation"
      {...props}
    >
      {children}
    </div>
  )
}
