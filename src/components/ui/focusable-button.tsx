/**
 * Focusable Button Component
 *
 * An enhanced button component with comprehensive focus management,
 * keyboard navigation, and accessibility features.
 */

'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { useFocusVisible, useFocusAnnouncements } from '@/hooks/use-focus-management'
import { cn } from '@/lib/utils'

const focusableButtonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
    // Enhanced focus indicators
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    // Custom focus visible state using data attribute
    'data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-ring',
    'data-[focus-visible=true]:ring-offset-2 data-[focus-visible=true]:ring-offset-background',
    'data-[focus-visible=true]:shadow-lg data-[focus-visible=true]:scale-[1.02]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'active:bg-primary/80',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
          'active:bg-destructive/80',
        ],
        outline: [
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
          'active:bg-accent/80',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
          'active:bg-secondary/60',
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
          'active:bg-accent/80',
        ],
        link: [
          'text-primary underline-offset-4',
          'hover:underline',
          'active:no-underline',
        ],
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
      focusMode: {
        default: '',
        enhanced: [
          'focus-visible:shadow-2xl focus-visible:shadow-primary/25',
          'data-[focus-visible=true]:shadow-2xl data-[focus-visible=true]:shadow-primary/25',
        ],
        minimal: [
          'focus-visible:ring-1 focus-visible:ring-offset-1',
          'data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-offset-1',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      focusMode: 'default',
    },
  }
)

export interface FocusableButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof focusableButtonVariants> {
  /**
   * Whether the button should announce focus changes to screen readers
   */
  announceFocus?: boolean
  
  /**
   * Custom announcement message for screen readers
   */
  focusAnnouncement?: string
  
  /**
   * Whether to use roving tabindex behavior
   */
  rovingTabindex?: boolean
  
  /**
   * Position in roving tabindex group (0-based)
   */
  tabindexPosition?: number
  
  /**
   * Whether this button is currently active in roving tabindex
   */
  isActiveInGroup?: boolean
}

/**
 * Focusable Button - Enhanced button with comprehensive focus management
 *
 * This component provides enhanced focus indicators, keyboard navigation support,
 * and accessibility announcements. It's designed to work well in complex UI
 * patterns like toolbars, button groups, and roving tabindex scenarios.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FocusableButton>Click me</FocusableButton>
 *
 * // Enhanced focus mode
 * <FocusableButton focusMode="enhanced" variant="outline">
 *   Important Action
 * </FocusableButton>
 *
 * // With focus announcements
 * <FocusableButton
 *   announceFocus
 *   focusAnnouncement="Save document button"
 * >
 *   Save
 * </FocusableButton>
 *
 * // Roving tabindex pattern
 * <FocusableButton
 *   rovingTabindex
 *   isActiveInGroup={true}
 *   tabindexPosition={0}
 * >
 *   First Button
 * </FocusableButton>
 * ```
 */
export const FocusableButton = React.forwardRef<
  HTMLButtonElement,
  FocusableButtonProps
>(
  (
    {
      className,
      variant,
      size,
      focusMode,
      announceFocus = false,
      focusAnnouncement,
      rovingTabindex = false,
      tabindexPosition,
      isActiveInGroup = false,
      children,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const focusVisibleRef = useFocusVisible()
    const { announceFocusChange } = useFocusAnnouncements()

    // Merge refs
    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (focusVisibleRef) {
          focusVisibleRef.current = node
        }
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref, focusVisibleRef]
    )

    // Handle focus events
    const handleFocus = React.useCallback(
      (event: React.FocusEvent<HTMLButtonElement>) => {
        if (announceFocus) {
          const announcement =
            focusAnnouncement ||
            event.currentTarget.textContent ||
            'Button'
          announceFocusChange(announcement)
        }
        
        onFocus?.(event)
      },
      [announceFocus, focusAnnouncement, announceFocusChange, onFocus]
    )

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        // Enhanced keyboard support
        if (event.key === 'Enter' || event.key === ' ') {
          // Ensure click is triggered
          event.preventDefault()
          event.currentTarget.click()
        }
        
        onKeyDown?.(event)
      },
      [onKeyDown]
    )

    // Determine tabindex based on roving tabindex pattern
    const tabIndex = React.useMemo(() => {
      if (rovingTabindex) {
        return isActiveInGroup ? 0 : -1
      }
      return props.tabIndex
    }, [rovingTabindex, isActiveInGroup, props.tabIndex])

    return (
      <button
        className={cn(focusableButtonVariants({ variant, size, focusMode, className }))}
        ref={mergedRef}
        onFocus={handleFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        tabIndex={tabIndex}
        data-testid="focusable-button"
        data-position={tabindexPosition}
        {...props}
      >
        {children}
      </button>
    )
  }
)

FocusableButton.displayName = 'FocusableButton'

/**
 * Button Group with Roving Tabindex
 *
 * A container for multiple FocusableButton components that implements
 * the roving tabindex pattern for keyboard navigation.
 */
interface FocusableButtonGroupProps {
  /**
   * Button group children
   */
  children: React.ReactNode
  
  /**
   * Orientation for keyboard navigation
   */
  orientation?: 'horizontal' | 'vertical'
  
  /**
   * Whether to wrap around when reaching the end
   */
  wrap?: boolean
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * ARIA role for the button group
   */
  role?: string
  
  /**
   * ARIA label for the button group
   */
  'aria-label'?: string
}

/**
 * Focusable Button Group - Container for buttons with roving tabindex
 *
 * This component manages keyboard navigation between multiple buttons using
 * the roving tabindex pattern, where only one button is tabbable at a time.
 */
export const FocusableButtonGroup: React.FC<FocusableButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  wrap = true,
  className,
  role = 'group',
  'aria-label': ariaLabel,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  // Get button elements
  const buttons = React.useMemo(() => {
    const container = containerRef.current
    if (!container) return []
    
    return Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-testid="focusable-button"]')
    )
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = event
      let newIndex = activeIndex

      const isHorizontalNavigation = 
        (key === 'ArrowLeft' || key === 'ArrowRight') && 
        orientation === 'horizontal'
      
      const isVerticalNavigation = 
        (key === 'ArrowUp' || key === 'ArrowDown') && 
        orientation === 'vertical'

      if (isHorizontalNavigation || isVerticalNavigation) {
        event.preventDefault()
        
        if (key === 'ArrowLeft' || key === 'ArrowUp') {
          newIndex = wrap 
            ? (activeIndex - 1 + buttons.length) % buttons.length
            : Math.max(0, activeIndex - 1)
        } else if (key === 'ArrowRight' || key === 'ArrowDown') {
          newIndex = wrap
            ? (activeIndex + 1) % buttons.length
            : Math.min(buttons.length - 1, activeIndex + 1)
        }
        
        if (newIndex !== activeIndex && buttons[newIndex]) {
          setActiveIndex(newIndex)
          buttons[newIndex].focus()
        }
      } else if (key === 'Home') {
        event.preventDefault()
        setActiveIndex(0)
        buttons[0]?.focus()
      } else if (key === 'End') {
        event.preventDefault()
        const lastIndex = buttons.length - 1
        setActiveIndex(lastIndex)
        buttons[lastIndex]?.focus()
      }
    },
    [activeIndex, buttons, orientation, wrap]
  )

  // Clone children to add roving tabindex props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement<FocusableButtonProps>(child) && child.type === FocusableButton) {
      return React.cloneElement<FocusableButtonProps>(child, {
        rovingTabindex: true,
        isActiveInGroup: index === activeIndex,
        tabindexPosition: index,
        onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
          setActiveIndex(index)
          child.props.onFocus?.(event)
        },
      })
    }
    return child
  })

  return (
    <div
      ref={containerRef}
      role={role}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex gap-1',
        orientation === 'vertical' && 'flex-col',
        className
      )}
      data-testid="focusable-button-group"
    >
      {enhancedChildren}
    </div>
  )
}