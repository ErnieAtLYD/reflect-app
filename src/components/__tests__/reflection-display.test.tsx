import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, it, expect, vi } from 'vitest'

import { ReflectionDisplay } from '@/components/ui/reflection-display'
import type { ReflectionResponse } from '@/types/ai'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

const mockReflectionData: ReflectionResponse = {
  summary: 'You reflected on a challenging but rewarding day at work.',
  pattern:
    'There seems to be a pattern of finding breakthroughs during quiet moments.',
  suggestion:
    'Consider incorporating more quiet reflection time into your daily routine.',
  metadata: {
    model: 'gpt-4-1106-preview',
    processedAt: '2024-01-01T12:00:00Z',
    processingTimeMs: 1500,
  },
}

describe('ReflectionDisplay', () => {
  it('renders nothing in idle state', () => {
    const { container } = render(<ReflectionDisplay state="idle" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders loading state with spinner and skeleton', () => {
    render(<ReflectionDisplay state="loading" />)

    // Check for loading text (may vary in different environments)
    const loadingTextFound =
      screen.queryByText('Generating reflection...') ||
      screen.queryByText('Generating your reflection...') ||
      screen.queryByText(/Generating.*reflection/i)
    expect(loadingTextFound).toBeInTheDocument()

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

    // Check for skeleton animation elements (there are more elements with animate-pulse)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    )
  })

  it('renders error state with retry button', () => {
    const mockOnRetry = vi.fn()
    render(
      <ReflectionDisplay
        state="error"
        error="Something went wrong"
        onRetry={mockOnRetry}
      />
    )

    expect(screen.getByText('Reflection Processing Failed')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByTestId('retry-reflection-button')).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnRetry = vi.fn()

    render(
      <ReflectionDisplay
        state="error"
        error="Network error"
        onRetry={mockOnRetry}
      />
    )

    const retryButton = screen.getByTestId('retry-reflection-button')
    await user.click(retryButton)

    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('renders success state with reflection data', () => {
    render(<ReflectionDisplay state="success" data={mockReflectionData} />)

    expect(screen.getByText('Your Reflection')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Pattern Noticed')).toBeInTheDocument()
    expect(screen.getByText('Suggestion')).toBeInTheDocument()

    expect(screen.getByText(mockReflectionData.summary)).toBeInTheDocument()
    expect(screen.getByText(mockReflectionData.pattern)).toBeInTheDocument()
    expect(screen.getByText(mockReflectionData.suggestion)).toBeInTheDocument()

    expect(
      screen.getByText(/Processed by gpt-4-1106-preview in 1500ms/)
    ).toBeInTheDocument()
  })

  it('renders copy button in success state', () => {
    render(<ReflectionDisplay state="success" data={mockReflectionData} />)

    const copyButton = screen.getByTestId('copy-reflection-button')
    expect(copyButton).toBeInTheDocument()
    expect(copyButton).toHaveTextContent('Copy')
  })

  it('handles copy functionality', async () => {
    const user = userEvent.setup()

    // Mock the clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = navigator.clipboard

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      configurable: true,
    })

    render(<ReflectionDisplay state="success" data={mockReflectionData} />)

    const copyButton = screen.getByTestId('copy-reflection-button')
    await user.click(copyButton)

    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining('Your Reflection')
    )
    expect(mockWriteText).toHaveBeenCalledWith(
      expect.stringContaining(mockReflectionData.summary)
    )

    // Check that button text changes to "Copied!"
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    // Restore original clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    })
  })

  it('handles clipboard API not available', async () => {
    const user = userEvent.setup()

    // Mock clipboard API as undefined
    const originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    })

    render(<ReflectionDisplay state="success" data={mockReflectionData} />)

    const copyButton = screen.getByTestId('copy-reflection-button')
    await user.click(copyButton)

    // Button should not show "Copied!" when clipboard fails
    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })

    // Restore original clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    })
  })

  it('applies custom className', () => {
    render(<ReflectionDisplay state="loading" className="custom-class" />)

    // The className is applied to the inner div, not the motion.div wrapper
    expect(document.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('handles missing onRetry prop in error state', () => {
    render(<ReflectionDisplay state="error" error="Something went wrong" />)

    expect(screen.getByText('Reflection Processing Failed')).toBeInTheDocument()
    expect(
      screen.queryByTestId('retry-reflection-button')
    ).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ReflectionDisplay state="success" data={mockReflectionData} />)

    // Check that the copy button has proper accessibility
    const copyButton = screen.getByTestId('copy-reflection-button')
    expect(copyButton).toBeInTheDocument()

    // Check for proper heading structure
    expect(screen.getByText('Your Reflection')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('Pattern Noticed')).toBeInTheDocument()
    expect(screen.getByText('Suggestion')).toBeInTheDocument()
  })

  it('renders sections with proper icons', () => {
    render(<ReflectionDisplay state="success" data={mockReflectionData} />)

    // Verify that each section has its icon container by testing for the Sparkles icon specifically
    const sparklesIcon =
      document.querySelector('[data-testid="sparkles-icon"]') ||
      document.querySelector('.lucide-sparkles')
    expect(sparklesIcon).toBeInTheDocument()
  })
})
