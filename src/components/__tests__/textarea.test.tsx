import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Textarea } from '@/components/ui/textarea'
import { testAccessibility } from '@/test/accessibility'

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('data-slot', 'textarea')
  })

  it('applies size variants correctly', () => {
    const { rerender } = render(<Textarea size="sm" />)
    expect(screen.getByTestId('textarea')).toHaveClass(
      'min-h-10',
      'px-2',
      'py-1',
      'text-sm'
    )

    rerender(<Textarea size="lg" />)
    expect(screen.getByTestId('textarea')).toHaveClass(
      'min-h-20',
      'px-4',
      'py-3',
      'text-lg'
    )
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Textarea variant="filled" />)
    expect(screen.getByTestId('textarea')).toHaveClass(
      'bg-muted',
      'border-muted'
    )

    rerender(<Textarea variant="ghost" />)
    expect(screen.getByTestId('textarea')).toHaveClass(
      'border-transparent',
      'hover:bg-accent'
    )
  })

  it('shows error state when error prop is true', () => {
    render(<Textarea error={true} />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('border-destructive', 'ring-destructive/20')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea-class" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('custom-textarea-class')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Textarea ref={ref} />)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement))
  })

  it('handles value and onChange', () => {
    const handleChange = vi.fn()
    render(<Textarea value="test content" onChange={handleChange} />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveValue('test content')

    fireEvent.change(textarea, { target: { value: 'new content' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports placeholder text', () => {
    render(<Textarea placeholder="Enter your text here..." />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('placeholder', 'Enter your text here...')
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass(
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    )
  })

  it('supports required attribute', () => {
    render(<Textarea required />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeRequired()
  })

  it('supports maxLength attribute', () => {
    render(<Textarea maxLength={100} />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  it('supports rows attribute', () => {
    render(<Textarea rows={5} />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('forwards additional props', () => {
    render(<Textarea data-custom="test-value" id="custom-textarea" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('data-custom', 'test-value')
    expect(textarea).toHaveAttribute('id', 'custom-textarea')
  })

  it('has proper accessibility attributes', () => {
    render(<Textarea aria-label="Description" aria-describedby="help-text" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('aria-label', 'Description')
    expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('shows invalid state with aria-invalid', () => {
    render(<Textarea aria-invalid="true" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveClass('aria-invalid:ring-destructive/20')
  })

  it('has proper focus styles', () => {
    render(<Textarea />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass(
      'focus-visible:border-ring',
      'focus-visible:ring-ring/50',
      'focus-visible:ring-[3px]'
    )
  })

  it('has proper transition styles', () => {
    render(<Textarea />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('transition-[color,box-shadow]')
  })

  it('supports field-sizing-content for auto-resize', () => {
    render(<Textarea />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('field-sizing-content')
  })

  it('handles combination of error and variant props', () => {
    render(<Textarea variant="filled" error={true} />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveClass('bg-muted', 'border-destructive')
  })

  // Accessibility tests
  it('passes accessibility tests', async () => {
    await testAccessibility(<Textarea aria-label="Basic textarea" />)
  })

  it('passes accessibility tests with all features', async () => {
    await testAccessibility(
      <Textarea
        size="lg"
        variant="filled"
        error={true}
        placeholder="Enter your message"
        aria-label="Message input"
        aria-describedby="message-help"
        required
      />
    )
  })

  it('has proper form accessibility', () => {
    render(
      <div>
        <label htmlFor="message">Message</label>
        <Textarea
          id="message"
          aria-describedby="message-error message-help"
          required
        />
        <div id="message-help">Please enter your message</div>
        <div id="message-error">This field is required</div>
      </div>
    )

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('id', 'message')
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      'message-error message-help'
    )
    expect(textarea).toBeRequired()

    // Check label association
    const label = screen.getByText('Message')
    expect(label).toHaveAttribute('for', 'message')
  })

  it('properly handles error states for screen readers', () => {
    render(<Textarea error={true} aria-invalid="true" />)

    const textarea = screen.getByTestId('textarea')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveClass('border-destructive')
  })

  it('supports keyboard navigation', () => {
    const handleKeyDown = vi.fn()
    render(<Textarea onKeyDown={handleKeyDown} />)

    const textarea = screen.getByTestId('textarea')

    fireEvent.keyDown(textarea, { key: 'Tab' })
    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Tab' })
    )
  })
})
