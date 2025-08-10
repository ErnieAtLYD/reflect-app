import { Dialog as HeadlessDialog, Transition } from '@headlessui/react'
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
   * Initial focus element selector
   */
  initialFocus?: React.RefObject<HTMLElement>
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
      initialFocus,
      size,
      className,
      panelProps,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Transition appear show={isOpen} as={React.Fragment}>
        <HeadlessDialog
          as="div"
          className="relative z-50"
          onClose={onClose}
          initialFocus={initialFocus}
          data-testid="dialog"
        >
          {/* Backdrop */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
          </Transition.Child>

          {/* Full-screen container to center the panel */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <HeadlessDialog.Panel
                  ref={ref}
                  className={cn(dialogVariants({ size, className }))}
                  data-testid="dialog-panel"
                  {...panelProps}
                  {...props}
                >
                  {title && (
                    <HeadlessDialog.Title
                      as="h3"
                      className="text-foreground mb-2 text-lg leading-6 font-medium"
                      data-testid="dialog-title"
                    >
                      {title}
                    </HeadlessDialog.Title>
                  )}

                  {description && (
                    <HeadlessDialog.Description
                      className="text-muted-foreground mb-4 text-sm"
                      data-testid="dialog-description"
                    >
                      {description}
                    </HeadlessDialog.Description>
                  )}

                  {children}
                </HeadlessDialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </HeadlessDialog>
      </Transition>
    )
  }
)

Dialog.displayName = 'Dialog'

export { Dialog, dialogVariants }
export type { DialogProps }
