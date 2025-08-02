import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { testAccessibility } from '@/test/accessibility'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('role', 'status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')

    const srText = screen.getByText('Loading')
    expect(srText).toHaveClass('sr-only')
  })

  it('renders with custom aria-label', () => {
    render(<LoadingSpinner aria-label="Processing your request" />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('aria-label', 'Processing your request')

    const srText = screen.getByText('Processing your request')
    expect(srText).toHaveClass('sr-only')
  })

  it('applies size variants correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass(
      'size-4',
      'border-[1.5px]'
    )

    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass(
      'size-8',
      'border-2'
    )

    rerender(<LoadingSpinner size="xl" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass(
      'size-12',
      'border-[3px]'
    )
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<LoadingSpinner variant="muted" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass(
      'text-muted-foreground'
    )

    rerender(<LoadingSpinner variant="secondary" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass(
      'text-secondary-foreground'
    )

    rerender(<LoadingSpinner variant="destructive" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass(
      'text-destructive'
    )
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('custom-class')
  })

  it('forwards additional props', () => {
    render(<LoadingSpinner data-custom="test-value" />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('data-custom', 'test-value')
  })

  it('has spinning animation class', () => {
    render(<LoadingSpinner />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('animate-spin')
  })

  // Accessibility tests
  it('passes accessibility tests', async () => {
    await testAccessibility(<LoadingSpinner />)
  })

  it('passes accessibility tests with custom props', async () => {
    await testAccessibility(
      <LoadingSpinner
        size="lg"
        variant="secondary"
        aria-label="Processing your request"
      />
    )
  })

  it('is properly announced to screen readers', () => {
    render(<LoadingSpinner aria-label="Loading data" />)

    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('role', 'status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading data')

    // Check for screen reader only text
    const srText = screen.getByText('Loading data')
    expect(srText).toHaveClass('sr-only')
  })
})
