import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { JournalEntryInput } from '../ui/journal-entry-input'

describe('JournalEntryInput', () => {
  it('renders with default props', () => {
    render(<JournalEntryInput />)

    const input = screen.getByTestId('journal-entry-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'journal-input')
  })

  it('displays the provided value', () => {
    const testValue = 'This is a test journal entry'
    render(<JournalEntryInput value={testValue} />)

    const input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveValue(testValue)
  })

  it('calls onChange when text is typed', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(<JournalEntryInput onChange={mockOnChange} />)

    const input = screen.getByTestId('journal-entry-input')
    await user.type(input, 'H')

    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith('H')
  })

  it('shows character count by default', () => {
    render(<JournalEntryInput value="Test" />)

    const characterCount = screen.getByTestId('character-count')
    expect(characterCount).toBeInTheDocument()
    expect(characterCount).toHaveTextContent('16 more needed (4/20)')
  })

  it('hides character count when showCharacterCount is false', () => {
    render(<JournalEntryInput value="Test" showCharacterCount={false} />)

    const characterCount = screen.queryByTestId('character-count')
    expect(characterCount).not.toBeInTheDocument()
  })

  it('shows minimum character warning when below 20 characters', () => {
    render(<JournalEntryInput value="Short text" />)

    const characterCount = screen.getByTestId('character-count')
    expect(characterCount).toHaveTextContent('10 more needed (10/20)')
    expect(characterCount).toHaveClass('text-orange-500')
  })

  it('shows character count when minimum is met', () => {
    const longText =
      'This is a long enough text to meet the minimum requirement'
    render(<JournalEntryInput value={longText} />)

    const characterCount = screen.getByTestId('character-count')
    expect(characterCount).toHaveTextContent(
      `${longText.length.toLocaleString()} characters`
    )
    expect(characterCount).toHaveClass('text-muted-foreground')
  })

  it('uses custom minLength prop', () => {
    render(<JournalEntryInput value="Test" minLength={10} />)

    const characterCount = screen.getByTestId('character-count')
    expect(characterCount).toHaveTextContent('6 more needed (4/10)')
  })

  it('shows clear button when showClearButton is true and has value', () => {
    render(<JournalEntryInput value="Some text" showClearButton />)

    const clearButton = screen.getByTestId('clear-button')
    expect(clearButton).toBeInTheDocument()
    expect(clearButton).toHaveAttribute('aria-label', 'Clear input')
  })

  it('hides clear button when value is empty', () => {
    render(<JournalEntryInput value="" showClearButton />)

    const clearButton = screen.queryByTestId('clear-button')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('hides clear button when showClearButton is false', () => {
    render(<JournalEntryInput value="Some text" showClearButton={false} />)

    const clearButton = screen.queryByTestId('clear-button')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnClear = vi.fn()

    render(
      <JournalEntryInput
        value="Some text"
        showClearButton
        onClear={mockOnClear}
      />
    )

    const clearButton = screen.getByTestId('clear-button')
    await user.click(clearButton)

    expect(mockOnClear).toHaveBeenCalledTimes(1)
  })

  it('positions character count correctly when clear button is present', () => {
    render(<JournalEntryInput value="Test" showClearButton />)

    const characterCount = screen.getByTestId('character-count')
    expect(characterCount).toHaveClass('right-12')
  })

  it('positions character count correctly when clear button is not present', () => {
    render(<JournalEntryInput value="Test" showClearButton={false} />)

    const characterCount = screen.getByTestId('character-count')
    expect(characterCount).toHaveClass('right-3')
  })

  it('applies error styling when error prop is true', () => {
    render(<JournalEntryInput error />)

    const input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveClass('border-destructive')
  })

  it('applies size variants correctly', () => {
    const { rerender } = render(<JournalEntryInput size="sm" />)
    let input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveClass('min-h-10')

    rerender(<JournalEntryInput size="lg" />)
    input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveClass('min-h-20')
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<JournalEntryInput variant="filled" />)
    let input = screen.getByTestId('journal-entry-input')
    // Check for muted background variant (may include additional classes)
    expect(input.className).toMatch(/bg-muted/)

    rerender(<JournalEntryInput variant="ghost" />)
    input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveClass('border-transparent')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<JournalEntryInput ref={ref} />)

    expect(ref).toHaveBeenCalled()
  })

  it('adds padding when clear button is visible', () => {
    render(<JournalEntryInput value="Test" showClearButton />)

    const input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveClass('pr-12')
  })

  it('does not add padding when clear button is not visible', () => {
    render(<JournalEntryInput value="" showClearButton />)

    const input = screen.getByTestId('journal-entry-input')
    expect(input).not.toHaveClass('pr-12')
  })

  it('has proper accessibility attributes', () => {
    render(<JournalEntryInput value="Test" showClearButton />)

    const characterCount = screen.getByTestId('character-count')
    expect(characterCount).toHaveAttribute('aria-live', 'polite')

    const clearButton = screen.getByTestId('clear-button')
    expect(clearButton).toHaveAttribute('aria-label', 'Clear input')
    expect(clearButton).toHaveAttribute('type', 'button')
  })

  it('updates character count as user types', async () => {
    const user = userEvent.setup()
    let currentValue = ''
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue
      // Re-render with updated value would happen in real component usage
    })

    const { rerender } = render(
      <JournalEntryInput value={currentValue} onChange={mockOnChange} />
    )

    const input = screen.getByTestId('journal-entry-input')

    // Simulate typing and updating the value
    await user.type(input, 'H')
    currentValue = 'H'
    rerender(<JournalEntryInput value={currentValue} onChange={mockOnChange} />)

    await waitFor(() => {
      const characterCount = screen.getByTestId('character-count')
      expect(characterCount).toHaveTextContent('19 more needed (1/20)')
    })
  })

  it('applies custom className', () => {
    render(<JournalEntryInput className="custom-class" />)

    const input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveClass('custom-class')
  })

  it('passes through additional props', () => {
    render(
      <JournalEntryInput placeholder="Test placeholder" data-custom="test" />
    )

    const input = screen.getByTestId('journal-entry-input')
    expect(input).toHaveAttribute('placeholder', 'Test placeholder')
    expect(input).toHaveAttribute('data-custom', 'test')
  })

  describe('Validation callback functionality', () => {
    it('calls onValidationChange with false when input is empty', () => {
      const mockOnValidationChange = vi.fn()

      render(<JournalEntryInput onValidationChange={mockOnValidationChange} />)

      expect(mockOnValidationChange).toHaveBeenCalledWith(false)
    })

    it('calls onValidationChange with false when input is below minimum length', async () => {
      const user = userEvent.setup()
      const mockOnValidationChange = vi.fn()
      let currentValue = ''
      const mockOnChange = vi.fn((newValue: string) => {
        currentValue = newValue
      })

      const { rerender } = render(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={20}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Type short text (below minimum)
      await user.type(input, 'Short text')
      currentValue = 'Short text'
      rerender(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={20}
        />
      )

      // Should be called with false since text is too short
      expect(mockOnValidationChange).toHaveBeenCalledWith(false)
    })

    it('calls onValidationChange with true when input meets minimum length', async () => {
      const user = userEvent.setup()
      const mockOnValidationChange = vi.fn()
      let currentValue = ''
      const mockOnChange = vi.fn((newValue: string) => {
        currentValue = newValue
      })

      const { rerender } = render(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={20}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Type text that meets minimum requirement
      const longText =
        'This is a long enough text that meets the minimum requirement'
      await user.clear(input)
      await user.type(input, longText)
      currentValue = longText
      rerender(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={20}
        />
      )

      // Should be called with true since text meets requirement
      expect(mockOnValidationChange).toHaveBeenCalledWith(true)
    })

    it('calls onValidationChange with false when input contains only whitespace', async () => {
      const user = userEvent.setup()
      const mockOnValidationChange = vi.fn()
      let currentValue = ''
      const mockOnChange = vi.fn((newValue: string) => {
        currentValue = newValue
      })

      const { rerender } = render(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Type only whitespace
      await user.type(input, '   \n\t   ')
      currentValue = '   \n\t   '
      rerender(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
        />
      )

      // Should be called with false since whitespace-only is invalid
      expect(mockOnValidationChange).toHaveBeenCalledWith(false)
    })

    it('validation changes as user types from invalid to valid', async () => {
      const user = userEvent.setup()
      const mockOnValidationChange = vi.fn()
      let currentValue = ''
      const mockOnChange = vi.fn((newValue: string) => {
        currentValue = newValue
      })

      const { rerender } = render(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={10}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Start with short text (invalid)
      await user.type(input, 'Short')
      currentValue = 'Short'
      rerender(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={10}
        />
      )

      expect(mockOnValidationChange).toHaveBeenCalledWith(false)

      // Add more text to make it valid
      await user.type(input, ' enough text')
      currentValue = 'Short enough text'
      rerender(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={10}
        />
      )

      expect(mockOnValidationChange).toHaveBeenCalledWith(true)
    })

    it('respects custom minLength for validation', async () => {
      const user = userEvent.setup()
      const mockOnValidationChange = vi.fn()
      let currentValue = ''
      const mockOnChange = vi.fn((newValue: string) => {
        currentValue = newValue
      })

      const customMinLength = 50
      const { rerender } = render(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={customMinLength}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Type text just under the custom minimum
      const almostLongEnough = 'This text is almost long enough but not quite'
      await user.type(input, almostLongEnough)
      currentValue = almostLongEnough
      rerender(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={customMinLength}
        />
      )

      expect(mockOnValidationChange).toHaveBeenCalledWith(false)

      // Add a few more characters to meet the requirement
      await user.type(input, ' there!')
      currentValue = almostLongEnough + ' there!'
      rerender(
        <JournalEntryInput
          value={currentValue}
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          minLength={customMinLength}
        />
      )

      expect(mockOnValidationChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Validation error display', () => {
    it('shows validation errors when showValidationErrors is true and input is invalid', () => {
      render(
        <JournalEntryInput
          value="Short"
          showValidationErrors={true}
          minLength={20}
        />
      )

      const validationErrors = screen.getByTestId('validation-errors')
      expect(validationErrors).toBeInTheDocument()
      expect(validationErrors).toHaveTextContent(
        'Entry must be at least 20 characters long'
      )
    })

    it('shows whitespace validation error', () => {
      render(
        <JournalEntryInput
          value="                                        " // 40 spaces - meets length but is all whitespace
          showValidationErrors={true}
          minLength={20}
        />
      )

      const validationErrors = screen.getByTestId('validation-errors')
      expect(validationErrors).toBeInTheDocument()
      expect(validationErrors).toHaveTextContent(
        'Entry cannot be empty or contain only whitespace'
      )
    })

    it('hides validation errors when showValidationErrors is false', () => {
      render(
        <JournalEntryInput
          value="Short"
          showValidationErrors={false}
          minLength={20}
        />
      )

      const validationErrors = screen.queryByTestId('validation-errors')
      expect(validationErrors).not.toBeInTheDocument()
    })

    it('does not show validation errors when input is valid', () => {
      render(
        <JournalEntryInput
          value="This is a long enough text that meets the minimum requirement"
          showValidationErrors={true}
          minLength={20}
        />
      )

      const validationErrors = screen.queryByTestId('validation-errors')
      expect(validationErrors).not.toBeInTheDocument()
    })

    it('applies error styling when validation errors are shown', () => {
      render(
        <JournalEntryInput
          value="Short"
          showValidationErrors={true}
          minLength={20}
        />
      )

      const input = screen.getByTestId('journal-entry-input')
      expect(input).toHaveClass('border-destructive')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('validation errors have proper accessibility attributes', () => {
      render(
        <JournalEntryInput
          value="Short"
          showValidationErrors={true}
          minLength={20}
        />
      )

      const input = screen.getByTestId('journal-entry-input')
      const validationErrors = screen.getByTestId('validation-errors')

      expect(input).toHaveAttribute('aria-describedby', 'validation-errors')
      expect(validationErrors).toHaveAttribute('id', 'validation-errors')

      // Check that error messages have proper alert role
      const errorMessage = validationErrors.querySelector('[role="alert"]')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })
  })
})
