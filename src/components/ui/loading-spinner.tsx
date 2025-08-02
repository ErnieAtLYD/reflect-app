import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const spinnerVariants = cva(
  'animate-spin rounded-full border border-solid border-current border-r-transparent',
  {
    variants: {
      size: {
        sm: 'size-4 border-[1.5px]',
        default: 'size-6 border-2',
        lg: 'size-8 border-2',
        xl: 'size-12 border-[3px]',
      },
      variant: {
        default: 'text-primary',
        muted: 'text-muted-foreground',
        secondary: 'text-secondary-foreground',
        destructive: 'text-destructive',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * Accessible label for screen readers
   */
  'aria-label'?: string
}

function LoadingSpinner({
  className,
  size,
  variant,
  'aria-label': ariaLabel = 'Loading',
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(spinnerVariants({ size, variant, className }))}
      data-testid="loading-spinner"
      {...props}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

export { LoadingSpinner, spinnerVariants }
export type { LoadingSpinnerProps }
