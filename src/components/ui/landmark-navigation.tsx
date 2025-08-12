/**
 * Landmark Navigation Component
 *
 * Provides accessible navigation landmarks and skip links for better
 * screen reader navigation throughout the application.
 */

'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface LandmarkNavigationProps {
  /**
   * Whether to show the visual skip links (useful for testing)
   */
  showVisually?: boolean

  /**
   * Custom landmarks to include in navigation
   */
  landmarks?: Array<{
    id: string
    label: string
    href: string
  }>

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Landmark Navigation - Provides accessible navigation landmarks
 *
 * This component creates skip links and landmark navigation to help
 * screen reader users quickly navigate to different sections of the page.
 *
 * @example
 * ```tsx
 * // Basic usage (invisible skip links)
 * <LandmarkNavigation />
 *
 * // With custom landmarks
 * <LandmarkNavigation landmarks={[
 *   { id: 'custom-section', label: 'Custom Section', href: '#custom-section' }
 * ]} />
 *
 * // Visible for testing
 * <LandmarkNavigation showVisually={true} />
 * ```
 */
export const LandmarkNavigation: React.FC<LandmarkNavigationProps> = ({
  showVisually = false,
  landmarks = [],
  className,
}) => {
  const defaultLandmarks = [
    {
      id: 'main-content',
      label: 'Skip to main content',
      href: '#main-content',
    },
    {
      id: 'main-navigation',
      label: 'Skip to navigation',
      href: '#main-navigation',
    },
  ]

  const allLandmarks = [...defaultLandmarks, ...landmarks]

  const skipLinkClasses = cn(
    'absolute left-2 top-2 z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground',
    'font-semibold shadow-lg transition-transform focus:translate-y-0 focus:scale-100',
    showVisually
      ? 'translate-y-0 scale-100'
      : '-translate-y-full scale-0 focus:translate-y-0 focus:scale-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  )

  return (
    <nav
      role="navigation"
      aria-label="Skip links and landmarks"
      className={cn('sr-only-focusable', className)}
      data-testid="landmark-navigation"
    >
      {allLandmarks.map((landmark) => (
        <a
          key={landmark.id}
          href={landmark.href}
          className={skipLinkClasses}
          data-testid={`skip-link-${landmark.id}`}
          onClick={(e) => {
            // Ensure the target element gets focus after clicking
            const target = document.querySelector(landmark.href)
            if (target) {
              e.preventDefault()
              target.scrollIntoView({ behavior: 'smooth' })

              // Set focus to the target element
              const focusableTarget = target as HTMLElement
              if (
                focusableTarget.tabIndex === undefined ||
                focusableTarget.tabIndex < 0
              ) {
                focusableTarget.tabIndex = -1
              }
              focusableTarget.focus()
            }
          }}
        >
          {landmark.label}
        </a>
      ))}
    </nav>
  )
}

/**
 * Page Landmarks Provider - Adds proper landmark roles to page sections
 *
 * This component provides a structured way to define page landmarks with
 * proper ARIA roles and labels.
 */
interface PageLandmarksProviderProps {
  children: React.ReactNode
  /**
   * Page title for the main heading
   */
  pageTitle?: string
  /**
   * Whether to include banner role on header
   */
  includeBanner?: boolean
  /**
   * Whether to include contentinfo role on footer
   */
  includeContentinfo?: boolean
}

export const PageLandmarksProvider: React.FC<PageLandmarksProviderProps> = ({
  children,
  pageTitle,
  includeBanner = true,
  includeContentinfo = true,
}) => {
  return (
    <div className="min-h-screen">
      <LandmarkNavigation />

      {includeBanner && (
        <header
          role="banner"
          id="main-navigation"
          className="relative"
          aria-label="Site header and navigation"
        >
          {pageTitle && (
            <h1 className="sr-only" id="page-title">
              {pageTitle}
            </h1>
          )}
        </header>
      )}

      <main
        role="main"
        id="main-content"
        aria-labelledby={pageTitle ? 'page-title' : undefined}
        className="relative"
      >
        {children}
      </main>

      {includeContentinfo && (
        <footer
          role="contentinfo"
          id="page-footer"
          aria-label="Site footer"
          className="relative"
        >
          {/* Footer content would go here */}
        </footer>
      )}
    </div>
  )
}

/**
 * Section Landmark - Creates accessible sections with proper headings
 *
 * Provides a structured way to create page sections with proper heading
 * hierarchy and landmark roles.
 */
interface SectionLandmarkProps {
  /**
   * The heading text for this section
   */
  heading: string

  /**
   * The heading level (1-6)
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6

  /**
   * ARIA role for the section
   */
  role?: 'region' | 'section' | 'complementary' | 'aside' | 'navigation'

  /**
   * Unique ID for the section
   */
  id?: string

  /**
   * Whether the heading should be visually hidden
   */
  hideHeading?: boolean

  /**
   * Additional CSS classes for the section
   */
  className?: string

  /**
   * Additional CSS classes for the heading
   */
  headingClassName?: string

  /**
   * Section content
   */
  children: React.ReactNode
}

export const SectionLandmark: React.FC<SectionLandmarkProps> = ({
  heading,
  level = 2,
  role = 'section',
  id,
  hideHeading = false,
  className,
  headingClassName,
  children,
}) => {
  const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements
  const generatedId = React.useId()
  const sectionId = id || `section-${generatedId}`
  const headingId = `${sectionId}-heading`

  return (
    <section
      role={role}
      id={sectionId}
      aria-labelledby={headingId}
      className={className}
      data-testid={`section-${sectionId}`}
    >
      <HeadingTag
        id={headingId}
        className={cn(hideHeading && 'sr-only', headingClassName)}
        data-testid={`heading-${headingId}`}
      >
        {heading}
      </HeadingTag>
      {children}
    </section>
  )
}

/**
 * Navigation Landmark - Creates accessible navigation sections
 *
 * Provides a structured way to create navigation sections with proper
 * ARIA labels and roles.
 */
interface NavigationLandmarkProps {
  /**
   * Accessible label for the navigation
   */
  ariaLabel: string

  /**
   * Unique ID for the navigation
   */
  id?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Navigation content
   */
  children: React.ReactNode
}

export const NavigationLandmark: React.FC<NavigationLandmarkProps> = ({
  ariaLabel,
  id,
  className,
  children,
}) => {
  const generatedId = React.useId()
  const navId = id || `nav-${generatedId}`

  return (
    <nav
      role="navigation"
      id={navId}
      aria-label={ariaLabel}
      className={className}
      data-testid={`navigation-${navId}`}
    >
      {children}
    </nav>
  )
}
