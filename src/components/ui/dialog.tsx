import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const dialogVariants = cva(
  'relative transform overflow-hidden rounded-lg bg-background border border-border shadow-xl transition-all text-left p-6',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        default: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

interface DialogProps extends VariantProps<typeof dialogVariants> {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean
  /**
   * Callback when dialog should be closed
   */
  onClose: () => void
  /**
   * Dialog title for accessibility
   */
  title?: string
  /**
   * Dialog description for accessibility
   */
  description?: string
  /**
   * Additional props for the dialog panel
   */
  panelProps?: React.HTMLAttributes<HTMLDivElement>
  /**
   * Custom className for the dialog panel
   */
  className?: string
  /**
   * Dialog content
   */
  children: React.ReactNode
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      size,
      className,
      panelProps,
      children,
      ...props
    },
    ref
  ) => {
    // Handle escape key
    React.useEffect(() => {
      if (!isOpen) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Prevent body scroll when dialog is open
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = ''
        }
      }
    }, [isOpen])

    // Focus management
    const dialogRef = React.useRef<HTMLDivElement>(null)
    const previousActiveElement = React.useRef<HTMLElement | null>(null)

    React.useEffect(() => {
      if (isOpen) {
        // Save the currently focused element
        previousActiveElement.current = document.activeElement as HTMLElement

        // Focus the dialog
        if (dialogRef.current) {
          dialogRef.current.focus()
        }
      } else if (previousActiveElement.current) {
        // Restore focus when dialog closes
        previousActiveElement.current.focus()
        previousActiveElement.current = null
      }
    }, [isOpen])

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        dialogRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    if (!isOpen) {
      return null
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        data-testid="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/25 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Dialog panel */}
        <div
          ref={combinedRef}
          className={cn(dialogVariants({ size }), className)}
          data-testid="dialog-panel"
          tabIndex={-1}
          {...panelProps}
          {...props}
        >
          {title && (
            <h3
              id="dialog-title"
              className="text-foreground mb-2 text-lg leading-6 font-medium"
              data-testid="dialog-title"
            >
              {title}
            </h3>
          )}

          {description && (
            <p
              id="dialog-description"
              className="text-muted-foreground mb-4 text-sm"
              data-testid="dialog-description"
            >
              {description}
            </p>
          )}

          {children}
        </div>
      </div>
    )
  }
)

Dialog.displayName = 'Dialog'

export { Dialog, dialogVariants }
export type { DialogProps }
