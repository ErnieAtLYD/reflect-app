import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const errorMessageVariants = cva(
  'flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm dark:border-destructive/40 dark:bg-destructive/10',
  {
    variants: {
      variant: {
        default: 'text-destructive',
        subtle: 'text-destructive/80',
        filled: 'bg-destructive text-white border-destructive',
      },
      size: {
        sm: 'p-2 text-xs',
        default: 'p-3 text-sm',
        lg: 'p-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorMessageVariants> {
  /**
   * The error message to display
   */
  message?: string
  /**
   * Optional title for the error
   */
  title?: string
  /**
   * Whether to show an error icon
   */
  showIcon?: boolean
  /**
   * Custom icon to display instead of the default error icon
   */
  icon?: React.ReactNode
  /**
   * Whether this error should be announced to screen readers
   */
  announce?: boolean
}

const ErrorIcon = () => (
  <svg
    className="mt-0.5 size-4 shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

function ErrorMessage({
  className,
  variant,
  size,
  message,
  title,
  showIcon = true,
  icon,
  announce = true,
  children,
  ...props
}: ErrorMessageProps) {
  const content = children || message

  if (!content) {
    return null
  }

  return (
    <div
      role={announce ? 'alert' : undefined}
      aria-live={announce ? 'polite' : undefined}
      className={cn(errorMessageVariants({ variant, size, className }))}
      data-testid="error-message"
      {...props}
    >
      {showIcon && <div className="shrink-0">{icon || <ErrorIcon />}</div>}
      <div className="min-w-0 flex-1">
        {title && (
          <div className="mb-1 font-medium" data-testid="error-title">
            {title}
          </div>
        )}
        <div data-testid="error-content">{content}</div>
      </div>
    </div>
  )
}

export { ErrorMessage, errorMessageVariants }
export type { ErrorMessageProps }
