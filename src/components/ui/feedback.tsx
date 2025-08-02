import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const feedbackVariants = cva(
  'inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-all hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input hover:border-accent-foreground/20',
        ghost: 'border-transparent hover:bg-accent/50',
        outline: 'border-input bg-transparent hover:bg-accent',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
      state: {
        default: '',
        positive:
          'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400',
        negative:
          'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
)

interface FeedbackButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>,
    VariantProps<typeof feedbackVariants> {
  /**
   * Whether this is a positive (thumbs up) or negative (thumbs down) feedback button
   */
  feedbackType: 'positive' | 'negative'
  /**
   * Whether this feedback option is currently selected
   */
  selected?: boolean
  /**
   * Callback when feedback is given
   */
  onFeedback?: (feedbackType: 'positive' | 'negative') => void
  /**
   * Custom label for screen readers
   */
  'aria-label'?: string
  /**
   * Whether to show text labels alongside icons
   */
  showLabel?: boolean
}

interface FeedbackProps {
  /**
   * Callback when feedback is given
   */
  onFeedback?: (feedbackType: 'positive' | 'negative') => void
  /**
   * Currently selected feedback type
   */
  selectedFeedback?: 'positive' | 'negative' | null
  /**
   * Whether feedback has been disabled (e.g., already submitted)
   */
  disabled?: boolean
  /**
   * Size variant for both buttons
   */
  size?: VariantProps<typeof feedbackVariants>['size']
  /**
   * Visual variant for both buttons
   */
  variant?: VariantProps<typeof feedbackVariants>['variant']
  /**
   * Whether to show text labels alongside icons
   */
  showLabels?: boolean
  /**
   * Custom className for the container
   */
  className?: string
  /**
   * Additional props for the container
   */
  containerProps?: React.HTMLAttributes<HTMLDivElement> &
    Record<string, unknown>
}

const ThumbsUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('size-4', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7m5 3v4M2 15h5l2-2v-4l-2-2H2v8z"
    />
  </svg>
)

const ThumbsDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('size-4', className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17m-5-3v-4m-4-4h5l2 2v4l-2 2H2V9z"
    />
  </svg>
)

function FeedbackButton({
  feedbackType,
  selected = false,
  onFeedback,
  variant,
  size,
  className,
  showLabel = false,
  'aria-label': ariaLabel,
  disabled,
  ...props
}: FeedbackButtonProps) {
  const state = selected ? feedbackType : 'default'
  const defaultAriaLabel =
    feedbackType === 'positive' ? 'Helpful' : 'Not helpful'

  return (
    <button
      type="button"
      onClick={() => onFeedback?.(feedbackType)}
      className={cn(feedbackVariants({ variant, size, state, className }))}
      aria-label={ariaLabel || defaultAriaLabel}
      aria-pressed={selected}
      disabled={disabled}
      data-testid={`feedback-${feedbackType}`}
      {...props}
    >
      {feedbackType === 'positive' ? <ThumbsUpIcon /> : <ThumbsDownIcon />}
      {showLabel && (
        <span className="select-none">
          {feedbackType === 'positive' ? 'Helpful' : 'Not helpful'}
        </span>
      )}
    </button>
  )
}

function Feedback({
  onFeedback,
  selectedFeedback,
  disabled = false,
  size,
  variant,
  showLabels = false,
  className,
  containerProps,
}: FeedbackProps) {
  const handleFeedback = (feedbackType: 'positive' | 'negative') => {
    if (disabled) return
    onFeedback?.(feedbackType)
  }

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      data-testid="feedback-component"
      {...containerProps}
    >
      <FeedbackButton
        feedbackType="positive"
        selected={selectedFeedback === 'positive'}
        onFeedback={handleFeedback}
        variant={variant}
        size={size}
        showLabel={showLabels}
        disabled={disabled}
      />
      <FeedbackButton
        feedbackType="negative"
        selected={selectedFeedback === 'negative'}
        onFeedback={handleFeedback}
        variant={variant}
        size={size}
        showLabel={showLabels}
        disabled={disabled}
      />
    </div>
  )
}

export { Feedback, FeedbackButton, feedbackVariants }
export type { FeedbackProps, FeedbackButtonProps }
