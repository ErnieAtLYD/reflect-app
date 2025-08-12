/**
 * JournalEntryInput Component
 *
 * An enhanced textarea component designed specifically for journal writing with
 * auto-resize functionality, character validation, and comprehensive user feedback.
 *
 * Features:
 * - Auto-resize based on content using react-textarea-autosize
 * - Character count display with minimum length validation
 * - Clear button for easy input reset
 * - Real-time validation with error messages
 * - Full accessibility support (WCAG 2.1 AA compliant)
 * - Theme-aware styling with dark/light mode support
 * - Responsive design across all breakpoints
 *
 * @example
 * ```tsx
 * // Basic usage
 * <JournalEntryInput
 *   value={entry}
 *   onChange={setEntry}
 *   placeholder="Write your thoughts..."
 * />
 *
 * // With validation and clear button
 * <JournalEntryInput
 *   value={entry}
 *   onChange={setEntry}
 *   onValidationChange={handleValidation}
 *   onClear={handleClear}
 *   showClearButton
 *   showValidationErrors={showErrors}
 *   minLength={50}
 * />
 * ```
 */

'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useLiveRegions } from '@/lib/live-regions'
import { cn } from '@/lib/utils'

const journalInputVariants = cva(
  'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex w-full rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      size: {
        sm: 'min-h-10 px-2 py-1 text-sm',
        default: 'min-h-16 px-3 py-2 text-base md:text-sm',
        lg: 'min-h-20 px-4 py-3 text-lg',
      },
      variant: {
        default: 'border-input bg-transparent',
        filled: 'bg-muted border-muted dark:bg-muted/50',
        ghost: 'border-transparent bg-transparent hover:bg-accent',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

/**
 * Props for the JournalEntryInput component
 */
interface JournalEntryInputProps
  extends Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      'onChange' | 'style'
    >,
    VariantProps<typeof journalInputVariants> {
  /**
   * Custom error state styling
   * @default false
   */
  error?: boolean

  /**
   * Callback when value changes. Receives the new string value directly.
   * @param value - The new input value
   */
  onChange?: (value: string) => void

  /**
   * Current value of the input
   * @default ''
   */
  value?: string

  /**
   * Minimum number of visible rows when empty
   * @default 3
   */
  minRows?: number

  /**
   * Maximum number of rows before scrolling
   * @default 20
   */
  maxRows?: number

  /**
   * Minimum character requirement for validation
   * @default 20
   */
  minLength?: number

  /**
   * Whether to display the character count indicator
   * Shows progress toward minimum length and current character count
   * @default true
   */
  showCharacterCount?: boolean

  /**
   * Whether to show the clear button when input has content
   * Button appears in top-right corner and clears all text
   * @default false
   */
  showClearButton?: boolean

  /**
   * Callback triggered when the clear button is clicked
   * Should reset the input value in the parent component
   */
  onClear?: () => void

  /**
   * Callback triggered when validation state changes
   * Called whenever the input transitions between valid/invalid states
   * @param isValid - Whether the current input meets all validation requirements
   */
  onValidationChange?: (isValid: boolean) => void

  /**
   * Whether to display validation error messages
   * When true, shows specific error messages below the input
   * @default false
   */
  showValidationErrors?: boolean
}

/**
 * JournalEntryInput - Enhanced textarea component for journal writing
 *
 * A comprehensive textarea component built specifically for journal entries with:
 * - Auto-resize functionality that grows/shrinks with content
 * - Character count display with minimum length validation
 * - Optional clear button for easy content reset
 * - Real-time validation with customizable error display
 * - Full accessibility support including ARIA attributes
 * - Theme-aware styling that adapts to light/dark modes
 *
 * Validation Rules:
 * - Minimum character length (default: 20 characters)
 * - No empty or whitespace-only entries
 * - Real-time feedback with visual indicators
 *
 * Accessibility Features:
 * - Screen reader support with aria-live regions
 * - Keyboard navigation support
 * - Proper focus management
 * - WCAG 2.1 AA compliant color contrast
 *
 * @param props - JournalEntryInputProps
 * @param props.id - The id for the JournalEntryInput component
 * @param props.className - The className for the JournalEntryInput component
 * @param props.size - The size for the JournalEntryInput component (sm, default, lg)
 * @param props.variant - The variant for the JournalEntryInput component (default, filled, ghost)
 * @param props.error - The error for the JournalEntryInput component
 * @param props.onChange - The onChange for the JournalEntryInput component
 * @param props.value - The value for the JournalEntryInput component
 * @param props.minRows - The minRows for the JournalEntryInput component
 * @param props.maxRows - The maxRows for the JournalEntryInput component
 * @param props.minLength - The minLength for the JournalEntryInput component
 * @param props.showCharacterCount - The showCharacterCount for the JournalEntryInput component
 * @param props.showClearButton - The showClearButton for the JournalEntryInput component
 * @param ref - Forwarded ref to the textarea element
 * @returns JSX.Element
 */
const JournalEntryInput = React.forwardRef<
  HTMLTextAreaElement,
  JournalEntryInputProps
>(
  (
    {
      id,
      className,
      size,
      variant,
      error,
      onChange,
      value = '',
      minRows = 3,
      maxRows = 20,
      minLength = 20,
      showCharacterCount = true,
      showClearButton = false,
      onClear,
      onValidationChange,
      showValidationErrors = false,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const textareaId = id || `journal-entry-${generatedId}`
    const currentLength = value.length
    const remainingChars = minLength - currentLength
    const meetsMinimum = currentLength >= minLength
    const liveRegions = useLiveRegions()

    // Validation logic - prioritize whitespace error over length error
    const validationErrors = React.useMemo(() => {
      const errors: string[] = []
      if (value.trim().length === 0 && currentLength > 0) {
        errors.push('Entry cannot be empty or contain only whitespace')
      } else if (currentLength > 0 && currentLength < minLength) {
        errors.push(`Entry must be at least ${minLength} characters long`)
      }
      return errors
    }, [value, currentLength, minLength])

    const isValid = validationErrors.length === 0 && meetsMinimum
    const hasValidationError =
      showValidationErrors && validationErrors.length > 0

    // Announce validation errors to screen readers
    React.useEffect(() => {
      if (hasValidationError && validationErrors.length > 0) {
        liveRegions.announceError(validationErrors[0], 'Journal entry')
      }
    }, [hasValidationError, validationErrors, liveRegions])

    // Announce milestone achievements
    React.useEffect(() => {
      if (currentLength === minLength && !isValid) {
        // Only announce when reaching minimum for the first time
        liveRegions.announceSuccess(
          `Minimum length reached! Entry is now ${currentLength} characters.`
        )
      }
    }, [currentLength, minLength, isValid, liveRegions])

    // Notify parent of validation state changes
    React.useEffect(() => {
      onValidationChange?.(isValid)
    }, [isValid, onValidationChange])

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value
      onChange?.(newValue)
    }

    const handleClear = () => {
      liveRegions.announceSuccess('Journal entry cleared')
      onClear?.()
    }

    return (
      <div className="relative">
        <TextareaAutosize
          id={textareaId}
          ref={ref}
          value={value}
          onChange={handleChange}
          minRows={minRows}
          maxRows={maxRows}
          data-slot="journal-input"
          data-testid="journal-entry-input"
          className={cn(
            journalInputVariants({ size, variant, className }),
            (error || hasValidationError) &&
              'border-destructive ring-destructive/20 focus-visible:ring-destructive/20',
            showCharacterCount && 'pb-8',
            showClearButton && value && 'pr-12'
          )}
          aria-invalid={hasValidationError}
          aria-describedby={
            hasValidationError ? 'validation-errors' : undefined
          }
          {...props}
        />

        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
            )}
            data-testid="clear-button"
            aria-label="Clear input"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        )}

        {showCharacterCount && (
          <div
            className={cn(
              'absolute bottom-2 text-xs tabular-nums transition-colors',
              showClearButton && value ? 'right-12' : 'right-3',
              !meetsMinimum
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-muted-foreground'
            )}
            data-testid="character-count"
            aria-live="polite"
          >
            {meetsMinimum
              ? `${currentLength.toLocaleString()} characters`
              : `${remainingChars} more needed (${currentLength}/${minLength})`}
          </div>
        )}

        {hasValidationError && (
          <div
            id="validation-errors"
            className="mt-2 space-y-1"
            data-testid="validation-errors"
          >
            {validationErrors.map((errorMessage, index) => (
              <div
                key={index}
                className="text-destructive flex items-center gap-2 text-sm"
                role="alert"
                aria-live="polite"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errorMessage}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

JournalEntryInput.displayName = 'JournalEntryInput'

export { JournalEntryInput, journalInputVariants }
export type { JournalEntryInputProps }
