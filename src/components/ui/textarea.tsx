import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'min-h-10 px-2 py-1 text-sm',
        default: 'min-h-16 px-3 py-2 text-base md:text-sm',
        lg: 'min-h-20 px-4 py-3 text-lg',
      },
      variant: {
        default: 'border-input bg-transparent',
        filled: 'bg-muted border-muted',
        ghost: 'border-transparent bg-transparent hover:bg-accent',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /**
   * Custom error state styling
   */
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, variant, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        data-testid="textarea"
        className={cn(
          textareaVariants({ size, variant, className }),
          error &&
            'border-destructive ring-destructive/20 focus-visible:ring-destructive/20'
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
export type { TextareaProps }
