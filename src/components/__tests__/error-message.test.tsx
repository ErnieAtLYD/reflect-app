import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ErrorMessage } from '@/components/ui/error-message'

describe('ErrorMessage', () => {
  it('renders nothing when no message or children provided', () => {
    const { container } = render(<ErrorMessage />)
    expect(container.firstChild).toBeNull()
  })

  it('renders with message prop', () => {
    render(<ErrorMessage message="Something went wrong" />)

    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toBeInTheDocument()
    expect(screen.getByTestId('error-content')).toHaveTextContent(
      'Something went wrong'
    )
  })

  it('renders with children instead of message', () => {
    render(
      <ErrorMessage>
        <span>Custom error content</span>
      </ErrorMessage>
    )

    expect(screen.getByText('Custom error content')).toBeInTheDocument()
  })

  it('children take precedence over message prop', () => {
    render(
      <ErrorMessage message="This should not appear">
        <span>Children content</span>
      </ErrorMessage>
    )

    expect(screen.getByText('Children content')).toBeInTheDocument()
    expect(screen.queryByText('This should not appear')).not.toBeInTheDocument()
  })

  it('renders with title', () => {
    render(<ErrorMessage title="Error Title" message="Error description" />)

    expect(screen.getByTestId('error-title')).toHaveTextContent('Error Title')
    expect(screen.getByTestId('error-content')).toHaveTextContent(
      'Error description'
    )
  })

  it('shows default error icon by default', () => {
    render(<ErrorMessage message="Error" />)

    const errorMessage = screen.getByTestId('error-message')
    const icon = errorMessage.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('hides icon when showIcon is false', () => {
    render(<ErrorMessage message="Error" showIcon={false} />)

    const errorMessage = screen.getByTestId('error-message')
    const icon = errorMessage.querySelector('svg')
    expect(icon).not.toBeInTheDocument()
  })

  it('renders custom icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>

    render(<ErrorMessage message="Error" icon={<CustomIcon />} />)

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes by default', () => {
    render(<ErrorMessage message="Error occurred" />)

    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toHaveAttribute('role', 'alert')
    expect(errorMessage).toHaveAttribute('aria-live', 'polite')
  })

  it('removes accessibility attributes when announce is false', () => {
    render(<ErrorMessage message="Error occurred" announce={false} />)

    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).not.toHaveAttribute('role')
    expect(errorMessage).not.toHaveAttribute('aria-live')
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(
      <ErrorMessage message="Error" variant="subtle" />
    )
    expect(screen.getByTestId('error-message')).toHaveClass(
      'text-destructive/80'
    )

    rerender(<ErrorMessage message="Error" variant="filled" />)
    expect(screen.getByTestId('error-message')).toHaveClass(
      'bg-destructive',
      'text-white',
      'border-destructive'
    )
  })

  it('applies size variants correctly', () => {
    const { rerender } = render(<ErrorMessage message="Error" size="sm" />)
    expect(screen.getByTestId('error-message')).toHaveClass('p-2', 'text-xs')

    rerender(<ErrorMessage message="Error" size="lg" />)
    expect(screen.getByTestId('error-message')).toHaveClass('p-4', 'text-base')
  })

  it('applies custom className', () => {
    render(<ErrorMessage message="Error" className="custom-error-class" />)

    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toHaveClass('custom-error-class')
  })

  it('forwards additional props', () => {
    render(
      <ErrorMessage message="Error" data-custom="test-value" id="error-id" />
    )

    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toHaveAttribute('data-custom', 'test-value')
    expect(errorMessage).toHaveAttribute('id', 'error-id')
  })

  it('has proper layout structure with icon and content', () => {
    render(<ErrorMessage title="Error Title" message="Error message" />)

    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toHaveClass('flex', 'items-start', 'gap-2')

    // Icon should be present and not shrink
    const icon = errorMessage.querySelector('svg')
    expect(icon?.parentElement).toHaveClass('shrink-0')

    // Content should be flexible
    const contentContainer = screen.getByTestId('error-title').parentElement
    expect(contentContainer).toHaveClass('flex-1', 'min-w-0')
  })
})
