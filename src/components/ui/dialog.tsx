import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'

import { liveRegions } from '@/lib/live-regions'
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

// Base Dialog components
const DialogRoot = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof dialogVariants>
>(({ className, size, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200',
        dialogVariants({ size }),
        className
      )}
      data-testid="dialog-panel"
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg leading-none font-semibold tracking-tight',
      className
    )}
    data-testid="dialog-title"
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    data-testid="dialog-description"
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Legacy Dialog interface for backward compatibility
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
   * Whether to announce the dialog to screen readers
   */
  announceToScreenReader?: boolean
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

// Legacy Dialog component for backward compatibility
const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      announceToScreenReader = true,
      size,
      className,
      panelProps,
      children,
      ...props
    },
    ref
  ) => {
    // Announce dialog state to screen readers
    React.useEffect(() => {
      if (isOpen && announceToScreenReader && title) {
        liveRegions.announceNavigation(`Dialog opened: ${title}`)
      }
    }, [isOpen, announceToScreenReader, title])

    const handleOpenChange = React.useCallback(
      (open: boolean) => {
        if (!open) {
          if (announceToScreenReader) {
            liveRegions.announceNavigation('Dialog closed')
          }
          onClose()
        }
      },
      [announceToScreenReader, onClose]
    )

    return (
      <DialogRoot open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          ref={ref}
          size={size}
          className={className}
          data-testid="dialog-panel"
          {...panelProps}
          {...props}
        >
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
        </DialogContent>
      </DialogRoot>
    )
  }
)

Dialog.displayName = 'Dialog'

export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogVariants,
}
export type { DialogProps }
