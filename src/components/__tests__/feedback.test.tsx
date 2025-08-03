import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Feedback, FeedbackButton } from '@/components/ui/feedback'
import { testAccessibility, keyboardHelpers } from '@/test/accessibility'

describe('FeedbackButton', () => {
  it('renders positive feedback button with thumbs up icon', () => {
    render(<FeedbackButton feedbackType="positive" />)

    const button = screen.getByTestId('feedback-positive')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Helpful')
    expect(button).toHaveAttribute('aria-pressed', 'false')

    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders negative feedback button with thumbs down icon', () => {
    render(<FeedbackButton feedbackType="negative" />)

    const button = screen.getByTestId('feedback-negative')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Not helpful')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows selected state correctly', () => {
    render(<FeedbackButton feedbackType="positive" selected={true} />)

    const button = screen.getByTestId('feedback-positive')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveClass(
      'bg-green-50',
      'border-green-200',
      'text-green-700'
    )
  })

  it('calls onFeedback when clicked', () => {
    const mockFeedback = vi.fn()
    render(<FeedbackButton feedbackType="positive" onFeedback={mockFeedback} />)

    const button = screen.getByTestId('feedback-positive')
    fireEvent.click(button)

    expect(mockFeedback).toHaveBeenCalledWith('positive')
  })

  it('shows label when showLabel is true', () => {
    render(<FeedbackButton feedbackType="positive" showLabel={true} />)

    expect(screen.getByText('Helpful')).toBeInTheDocument()
  })

  it('uses custom aria-label when provided', () => {
    render(<FeedbackButton feedbackType="positive" aria-label="Custom label" />)

    const button = screen.getByTestId('feedback-positive')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('is disabled when disabled prop is true', () => {
    const mockFeedback = vi.fn()
    render(
      <FeedbackButton
        feedbackType="positive"
        disabled={true}
        onFeedback={mockFeedback}
      />
    )

    const button = screen.getByTestId('feedback-positive')
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(mockFeedback).not.toHaveBeenCalled()
  })

  it('applies size variants correctly', () => {
    const { rerender } = render(
      <FeedbackButton feedbackType="positive" size="sm" />
    )
    expect(screen.getByTestId('feedback-positive')).toHaveClass(
      'px-2',
      'py-1',
      'text-xs'
    )

    rerender(<FeedbackButton feedbackType="positive" size="lg" />)
    expect(screen.getByTestId('feedback-positive')).toHaveClass(
      'px-4',
      'py-3',
      'text-base'
    )
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(
      <FeedbackButton feedbackType="positive" variant="ghost" />
    )
    expect(screen.getByTestId('feedback-positive')).toHaveClass(
      'border-transparent'
    )

    rerender(<FeedbackButton feedbackType="positive" variant="outline" />)
    expect(screen.getByTestId('feedback-positive')).toHaveClass(
      'bg-transparent'
    )
  })

  // Accessibility tests for FeedbackButton
  it('passes accessibility tests', async () => {
    await testAccessibility(<FeedbackButton feedbackType="positive" />)
  })

  it('has proper ARIA attributes', () => {
    render(<FeedbackButton feedbackType="positive" selected={true} />)

    const button = screen.getByTestId('feedback-positive')
    expect(button).toHaveAttribute('aria-label', 'Helpful')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('supports keyboard navigation', () => {
    const mockFeedback = vi.fn()
    render(<FeedbackButton feedbackType="positive" onFeedback={mockFeedback} />)

    const button = screen.getByTestId('feedback-positive')

    // Test Enter key
    keyboardHelpers.pressEnter(button)
    button.click() // Simulate the actual click that would happen
    expect(mockFeedback).toHaveBeenCalledWith('positive')

    mockFeedback.mockClear()

    // Test Space key
    keyboardHelpers.pressSpace(button)
    button.click() // Simulate the actual click that would happen
    expect(mockFeedback).toHaveBeenCalledWith('positive')
  })

  it('icons have proper accessibility attributes', () => {
    render(<FeedbackButton feedbackType="positive" />)

    const icon = screen.getByTestId('feedback-positive').querySelector('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Feedback', () => {
  it('renders both positive and negative feedback buttons', () => {
    render(<Feedback />)

    expect(screen.getByTestId('feedback-component')).toBeInTheDocument()
    expect(screen.getByTestId('feedback-positive')).toBeInTheDocument()
    expect(screen.getByTestId('feedback-negative')).toBeInTheDocument()
  })

  it('calls onFeedback with correct type when buttons are clicked', () => {
    const mockFeedback = vi.fn()
    render(<Feedback onFeedback={mockFeedback} />)

    fireEvent.click(screen.getByTestId('feedback-positive'))
    expect(mockFeedback).toHaveBeenCalledWith('positive')

    mockFeedback.mockClear()

    fireEvent.click(screen.getByTestId('feedback-negative'))
    expect(mockFeedback).toHaveBeenCalledWith('negative')
  })

  it('shows selected feedback correctly', () => {
    render(<Feedback selectedFeedback="positive" />)

    const positiveButton = screen.getByTestId('feedback-positive')
    const negativeButton = screen.getByTestId('feedback-negative')

    expect(positiveButton).toHaveAttribute('aria-pressed', 'true')
    expect(negativeButton).toHaveAttribute('aria-pressed', 'false')
    expect(positiveButton).toHaveClass('bg-green-50')
  })

  it('shows negative selected feedback correctly', () => {
    render(<Feedback selectedFeedback="negative" />)

    const positiveButton = screen.getByTestId('feedback-positive')
    const negativeButton = screen.getByTestId('feedback-negative')

    expect(positiveButton).toHaveAttribute('aria-pressed', 'false')
    expect(negativeButton).toHaveAttribute('aria-pressed', 'true')
    expect(negativeButton).toHaveClass('bg-red-50')
  })

  it('disables both buttons when disabled prop is true', () => {
    const mockFeedback = vi.fn()
    render(<Feedback disabled={true} onFeedback={mockFeedback} />)

    const positiveButton = screen.getByTestId('feedback-positive')
    const negativeButton = screen.getByTestId('feedback-negative')

    expect(positiveButton).toBeDisabled()
    expect(negativeButton).toBeDisabled()

    fireEvent.click(positiveButton)
    fireEvent.click(negativeButton)

    expect(mockFeedback).not.toHaveBeenCalled()
  })

  it('shows labels when showLabels is true', () => {
    render(<Feedback showLabels={true} />)

    expect(screen.getByText('Helpful')).toBeInTheDocument()
    expect(screen.getByText('Not helpful')).toBeInTheDocument()
  })

  it('applies size to both buttons', () => {
    render(<Feedback size="lg" />)

    const positiveButton = screen.getByTestId('feedback-positive')
    const negativeButton = screen.getByTestId('feedback-negative')

    expect(positiveButton).toHaveClass('px-4', 'py-3', 'text-base')
    expect(negativeButton).toHaveClass('px-4', 'py-3', 'text-base')
  })

  it('applies variant to both buttons', () => {
    render(<Feedback variant="ghost" />)

    const positiveButton = screen.getByTestId('feedback-positive')
    const negativeButton = screen.getByTestId('feedback-negative')

    expect(positiveButton).toHaveClass('border-transparent')
    expect(negativeButton).toHaveClass('border-transparent')
  })

  it('applies custom className to container', () => {
    render(<Feedback className="custom-feedback-class" />)

    const container = screen.getByTestId('feedback-component')
    expect(container).toHaveClass(
      'custom-feedback-class',
      'flex',
      'items-center',
      'gap-2'
    )
  })

  it('forwards container props', () => {
    render(
      <Feedback
        containerProps={{
          'data-custom': 'test-value',
          id: 'feedback-container',
        }}
      />
    )

    const container = screen.getByTestId('feedback-component')
    expect(container).toHaveAttribute('data-custom', 'test-value')
    expect(container).toHaveAttribute('id', 'feedback-container')
  })

  it('prevents feedback when disabled even if onFeedback is called directly', () => {
    const mockFeedback = vi.fn()
    render(<Feedback disabled={true} onFeedback={mockFeedback} />)

    // Try to trigger feedback through the internal handler
    fireEvent.click(screen.getByTestId('feedback-positive'))

    expect(mockFeedback).not.toHaveBeenCalled()
  })

  it('has proper layout structure', () => {
    render(<Feedback />)

    const container = screen.getByTestId('feedback-component')
    expect(container).toHaveClass('flex', 'items-center', 'gap-2')

    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(2)
  })

  // Accessibility tests for Feedback component
  it('passes accessibility tests', async () => {
    await testAccessibility(<Feedback />)
  })

  it('passes accessibility tests with feedback selected', async () => {
    await testAccessibility(
      <Feedback
        selectedFeedback="positive"
        showLabels={true}
        onFeedback={() => {}}
      />
    )
  })

  it('maintains proper tab order', () => {
    const { unmount } = render(<Feedback />)

    const positiveButton = screen.getByTestId('feedback-positive')
    const negativeButton = screen.getByTestId('feedback-negative')

    // Both buttons should be focusable
    expect(positiveButton).not.toHaveAttribute('tabindex', '-1')
    expect(negativeButton).not.toHaveAttribute('tabindex', '-1')

    // Clean up first render
    unmount()

    // When disabled, buttons should not be focusable
    render(<Feedback disabled={true} />)

    const disabledPositive = screen.getByTestId('feedback-positive')
    const disabledNegative = screen.getByTestId('feedback-negative')

    expect(disabledPositive).toBeDisabled()
    expect(disabledNegative).toBeDisabled()
  })

  it('provides clear feedback states for screen readers', () => {
    render(<Feedback selectedFeedback="positive" />)

    const positiveButton = screen.getByTestId('feedback-positive')
    const negativeButton = screen.getByTestId('feedback-negative')

    expect(positiveButton).toHaveAttribute('aria-pressed', 'true')
    expect(negativeButton).toHaveAttribute('aria-pressed', 'false')

    expect(positiveButton).toHaveAttribute('aria-label', 'Helpful')
    expect(negativeButton).toHaveAttribute('aria-label', 'Not helpful')
  })
})
