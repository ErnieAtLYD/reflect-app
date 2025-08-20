/**
 * Screen Reader Enhancements Tests
 *
 * Comprehensive test suite for screen reader accessibility enhancements
 * including live regions, announcements, and ARIA attributes.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

import { JournalEntryInput } from '@/components/ui/journal-entry-input'
import {
  checkScreenReaderSupport,
  generateAccessibilityReport,
} from '@/test/screen-reader-testing'

// Mock the live regions module with hoisted functions
const {
  mockAnnounce,
  mockAnnounceError,
  mockAnnounceSuccess,
  mockAnnounceLoading,
  mockAnnounceNavigation,
  mockClearAll,
} = vi.hoisted(() => ({
  mockAnnounce: vi.fn(),
  mockAnnounceError: vi.fn(),
  mockAnnounceSuccess: vi.fn(),
  mockAnnounceLoading: vi.fn(),
  mockAnnounceNavigation: vi.fn(),
  mockClearAll: vi.fn(),
}))

vi.mock('@/lib/live-regions', () => {
  return {
    useLiveRegions: vi.fn(() => ({
      announce: mockAnnounce,
      announceError: mockAnnounceError,
      announceSuccess: mockAnnounceSuccess,
      announceLoading: mockAnnounceLoading,
      announceNavigation: mockAnnounceNavigation,
      clearAll: mockClearAll,
    })),
    liveRegions: {
      announce: mockAnnounce,
      announceError: mockAnnounceError,
      announceSuccess: mockAnnounceSuccess,
      announceLoading: mockAnnounceLoading,
      announceNavigation: mockAnnounceNavigation,
      clearAll: mockClearAll,
      cleanup: vi.fn(),
    },
  }
})

describe('Screen Reader Enhancements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Live Regions Utility', () => {
    it('should announce form validation errors', async () => {
      const user = userEvent.setup()
      const onValidationChange = vi.fn()
      let currentValue = ''
      const onChange = vi.fn((value: string) => {
        currentValue = value
      })

      const { rerender } = render(
        <JournalEntryInput
          value={currentValue}
          onChange={onChange}
          onValidationChange={onValidationChange}
          showValidationErrors={true}
          minLength={20}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Type less than minimum length and trigger validation
      await user.type(input, 'Too short')

      // Update component with new value to trigger validation
      rerender(
        <JournalEntryInput
          value="Too short"
          onChange={onChange}
          onValidationChange={onValidationChange}
          showValidationErrors={true}
          minLength={20}
        />
      )

      // Wait for validation effect to trigger
      await waitFor(() => {
        expect(mockAnnounceError).toHaveBeenCalledWith(
          'Entry must be at least 20 characters long',
          'Journal entry'
        )
      })
    })

    it('should announce successful milestones', async () => {
      const user = userEvent.setup()
      let currentValue = ''
      const onChange = vi.fn((value: string) => {
        currentValue = value
      })

      const { rerender } = render(
        <JournalEntryInput
          value={currentValue}
          onChange={onChange}
          minLength={10}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Type exactly the minimum length
      await user.type(input, '1234567890')

      // Update the component with the new value to trigger effects
      rerender(
        <JournalEntryInput
          value="1234567890"
          onChange={onChange}
          minLength={10}
        />
      )

      // Wait for the effect to trigger
      await waitFor(
        () => {
          expect(mockAnnounceSuccess).toHaveBeenCalledWith(
            expect.stringContaining('Minimum length reached!')
          )
        },
        { timeout: 2000 }
      )
    })

    it('should announce when input is cleared', async () => {
      const user = userEvent.setup()
      const onClear = vi.fn()

      render(
        <JournalEntryInput
          value="Some content"
          onChange={vi.fn()}
          onClear={onClear}
          showClearButton={true}
        />
      )

      const clearButton = screen.getByTestId('clear-button')
      await user.click(clearButton)

      expect(mockAnnounceSuccess).toHaveBeenCalledWith('Journal entry cleared')
      expect(onClear).toHaveBeenCalled()
    })
  })

  describe('ARIA Attributes and Roles', () => {
    it('should have proper ARIA attributes for form validation', () => {
      render(
        <JournalEntryInput
          value=""
          onChange={vi.fn()}
          showValidationErrors={true}
          minLength={20}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Should have proper ARIA attributes
      expect(input).toHaveAttribute('aria-invalid', 'false')
      expect(input).not.toHaveAttribute('aria-describedby')
    })

    it('should update ARIA attributes when validation fails', () => {
      render(
        <JournalEntryInput
          value="short"
          onChange={vi.fn()}
          showValidationErrors={true}
          minLength={20}
        />
      )

      const input = screen.getByTestId('journal-entry-input')

      // Should indicate invalid state
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'validation-errors')
    })

    it('should have proper roles for validation messages', () => {
      render(
        <JournalEntryInput
          value="short"
          onChange={vi.fn()}
          showValidationErrors={true}
          minLength={20}
        />
      )

      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Character Count Accessibility', () => {
    it('should announce character count changes to screen readers', () => {
      render(
        <JournalEntryInput
          value="Hello world"
          onChange={vi.fn()}
          showCharacterCount={true}
          minLength={20}
        />
      )

      const characterCount = screen.getByTestId('character-count')

      // Should have aria-live for dynamic updates
      expect(characterCount).toHaveAttribute('aria-live', 'polite')
      expect(characterCount).toHaveTextContent('9 more needed (11/20)')
    })

    it('should update announcement when minimum is reached', () => {
      render(
        <JournalEntryInput
          value="This is exactly twenty!"
          onChange={vi.fn()}
          showCharacterCount={true}
          minLength={20}
        />
      )

      const characterCount = screen.getByTestId('character-count')

      // Should show success state
      expect(characterCount).toHaveTextContent('23 characters')
      expect(characterCount).not.toHaveClass('text-orange-500')
    })
  })

  describe('Button Accessibility', () => {
    it('should have proper labels for clear button', () => {
      render(
        <JournalEntryInput
          value="Some content"
          onChange={vi.fn()}
          showClearButton={true}
        />
      )

      const clearButton = screen.getByTestId('clear-button')

      expect(clearButton).toHaveAttribute('aria-label', 'Clear input')
      expect(clearButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Screen Reader Testing Utilities', () => {
    it('should track announcements correctly', async () => {
      // Create a simple test component that uses our mocked announce
      const TestComponent = () => (
        <div>
          <button
            onClick={() => mockAnnounce('Test message', { priority: 'polite' })}
          >
            Announce
          </button>
          <div aria-live="polite" id="test-region"></div>
        </div>
      )

      const user = userEvent.setup()
      render(<TestComponent />)

      const button = screen.getByRole('button')
      await user.click(button)

      // Check that our mock was called
      expect(mockAnnounce).toHaveBeenCalledWith('Test message', {
        priority: 'polite',
      })
    })

    it('should check screen reader support correctly', () => {
      // Create elements with various accessibility issues
      const container = document.createElement('div')
      container.innerHTML = `
        <button>No accessible name</button>
        <img>
        <input type="text" required>
        <h1>Title</h1>
        <h3>Skipped level</h3>
      `

      const report = generateAccessibilityReport(container)

      expect(report.summary.issueCount).toBeGreaterThan(0)
      expect(report.elements.length).toBeGreaterThan(0)
    })

    it('should detect missing alt text on images', () => {
      const img = document.createElement('img')
      img.src = 'test.jpg'

      const result = checkScreenReaderSupport(img)

      expect(result.isAccessible).toBe(false)
      expect(result.issues).toContain('Image missing alt attribute')
    })

    it('should detect interactive elements without labels', () => {
      const button = document.createElement('button')

      const result = checkScreenReaderSupport(button)

      expect(result.isAccessible).toBe(false)
      expect(result.issues).toContain(
        'Interactive element lacks accessible name'
      )
    })

    it('should validate heading hierarchy', () => {
      const container = document.createElement('div')
      const h1 = document.createElement('h1')
      const h3 = document.createElement('h3')

      h1.textContent = 'Title'
      h3.textContent = 'Subtitle'

      container.appendChild(h1)
      container.appendChild(h3)

      // Add to document so querySelector can find the previous heading
      document.body.appendChild(container)

      const result = checkScreenReaderSupport(h3)

      expect(result.issues).toContain('Heading level skips from h1 to h3')

      // Clean up
      document.body.removeChild(container)
    })
  })

  describe('Integration Tests', () => {
    it('should provide comprehensive screen reader experience', async () => {
      const user = userEvent.setup()

      const TestJournalForm = () => {
        const [value, setValue] = React.useState('')
        const [showErrors, setShowErrors] = React.useState(false)

        return (
          <div>
            <h1>Journal Entry</h1>
            <JournalEntryInput
              value={value}
              onChange={setValue}
              showValidationErrors={showErrors}
              showClearButton={true}
              onClear={() => setValue('')}
              minLength={10}
            />
            <button onClick={() => setShowErrors(true)}>Submit</button>
          </div>
        )
      }

      render(<TestJournalForm />)

      const input = screen.getByTestId('journal-entry-input')
      const submitButton = screen.getByText('Submit')

      // Test validation workflow
      await user.type(input, 'Short')
      await user.click(submitButton)

      // Should announce validation error
      expect(mockAnnounceError).toHaveBeenCalledWith(
        'Entry must be at least 10 characters long',
        'Journal entry'
      )

      // Complete the entry - need to clear first to trigger the effect properly
      await user.clear(input)
      await user.type(input, 'Short enough text')

      // Should announce milestone
      await waitFor(
        () => {
          expect(mockAnnounceSuccess).toHaveBeenCalledWith(
            expect.stringContaining('Minimum length reached!')
          )
        },
        { timeout: 2000 }
      )
    })
  })
})
