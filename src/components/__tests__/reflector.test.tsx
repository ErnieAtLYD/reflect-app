import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'

import { Reflector } from '@/components/app/reflector'
import { aiClient, AIReflectionError } from '@/lib/ai-client'

// Mock framer-motion to avoid animation timing issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// Partially mock ai-client: keep AIReflectionError class, mock aiClient instance
vi.mock('@/lib/ai-client', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@/lib/ai-client')
  return {
    ...actual,
    aiClient: { processEntry: vi.fn() },
  }
})

// Note: aiClient is imported at the top but mocked here so we get the mocked aiClient and real AIReflectionError

const makeMockResponse = () => ({
  summary: 'A supportive summary',
  pattern: 'A noticed pattern',
  suggestion: 'A thoughtful suggestion',
  metadata: {
    model: 'gpt-4-1106-preview',
    processedAt: '2024-01-01T00:00:00Z',
    processingTimeMs: 1234,
  },
})

describe('Reflector', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetAllMocks()
  })

  it('renders initial state with disabled Reflect Now button', () => {
    render(<Reflector />)

    const button = screen.getByTestId('reflect-now-button')
    expect(button).toBeDisabled()
  })

  it('enables button when input becomes valid and completes success flow', async () => {
    const user = userEvent.setup()
    const processMock = aiClient.processEntry as unknown as Mock
    // Add a delay to simulate async behavior
    processMock.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(makeMockResponse()), 100)
        )
    )

    render(<Reflector />)

    const input = screen.getByTestId(
      'journal-entry-input'
    ) as HTMLTextAreaElement
    const button = screen.getByTestId('reflect-now-button')

    // Type a long enough entry to pass validation (>= 20 non-whitespace chars)
    await user.type(
      input,
      'This is a sufficiently long journal entry to be valid.'
    )
    expect(button).toBeEnabled()

    // Click and check immediate loading state
    await user.click(button)

    // Loading state should be visible immediately - check button is disabled and shows loading text
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Reflecting...')

    // Show success via ReflectionDisplay
    await waitFor(() => {
      expect(screen.getByText('Your Reflection')).toBeInTheDocument()
    })

    // Ensure API called once
    expect(processMock).toHaveBeenCalledTimes(1)
  })

  it('handles rate limit by showing countdown and auto-retrying once', async () => {
    const user = userEvent.setup({ delay: null })

    // First call: throw rate_limit with retryAfter=1; Second call: succeed
    const rateLimitError = new AIReflectionError(
      {
        error: 'rate_limit',
        message: 'Too many requests',
        retryAfter: 1, // Use 1 second for faster test
      },
      429
    )

    const processMock = aiClient.processEntry as unknown as Mock
    processMock.mockRejectedValueOnce(rateLimitError)
    processMock.mockResolvedValueOnce(makeMockResponse())

    render(<Reflector />)

    const input = screen.getByTestId(
      'journal-entry-input'
    ) as HTMLTextAreaElement
    const button = screen.getByTestId('reflect-now-button')

    await user.type(
      input,
      'This entry will trigger a temporary rate limit and then succeed.'
    )
    expect(button).toBeEnabled()

    // Click button to trigger request
    await user.click(button)

    // Wait for initial rate limit error and retry message to appear
    await waitFor(() => {
      expect(processMock).toHaveBeenCalledTimes(1)
      // Look for retry message
      expect(screen.getByText(/Retry scheduled in/)).toBeInTheDocument()
    })

    // Wait for retry call to complete (allow extra time)
    await waitFor(
      () => {
        expect(processMock).toHaveBeenCalledTimes(2)
      },
      { timeout: 3000 }
    )

    // Should show success
    await waitFor(() => {
      expect(screen.getByText('Your Reflection')).toBeInTheDocument()
    })
  }, 5000)

  it('clears input and resets state when clear is pressed', async () => {
    const user = userEvent.setup({ delay: null })
    const processMock = aiClient.processEntry as unknown as Mock
    processMock.mockResolvedValue(makeMockResponse())

    render(<Reflector />)

    const input = screen.getByTestId(
      'journal-entry-input'
    ) as HTMLTextAreaElement
    await user.type(input, 'Some text to clear later')

    // Clear button should appear in the input component
    const clearButton = await screen.findByTestId('clear-button')
    await user.click(clearButton)

    // Input is cleared and button disabled again
    expect(
      (screen.getByTestId('journal-entry-input') as HTMLTextAreaElement).value
    ).toBe('')
    expect(screen.getByTestId('reflect-now-button')).toBeDisabled()
  })
})
