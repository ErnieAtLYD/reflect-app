import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { FirstTimeTooltip } from '@/components/ui/first-time-tooltip'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

describe('FirstTimeTooltip', () => {
  const defaultProps = {
    children: <button>Test Button</button>,
    content: 'This is a helpful tooltip message',
    storageKey: 'test-tooltip-key',
  }

  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }

  beforeEach(() => {
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    mockLocalStorage.getItem.mockReturnValue('true') // Already seen
    render(<FirstTimeTooltip {...defaultProps} />)

    expect(
      screen.getByRole('button', { name: 'Test Button' })
    ).toBeInTheDocument()
  })

  it('shows tooltip on first visit when not in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue(null) // First time
    render(<FirstTimeTooltip {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('first-time-tooltip')).toBeInTheDocument()
    })
    expect(
      screen.getByText('This is a helpful tooltip message')
    ).toBeInTheDocument()
    expect(screen.getByTestId('tooltip-dismiss-button')).toBeInTheDocument()
  })

  it('does not show tooltip if already seen (localStorage has value)', async () => {
    mockLocalStorage.getItem.mockReturnValue('true') // Already seen
    render(<FirstTimeTooltip {...defaultProps} />)

    await waitFor(() => {
      expect(screen.queryByTestId('first-time-tooltip')).not.toBeInTheDocument()
    })
  })

  it('dismisses tooltip when X button is clicked', async () => {
    const user = userEvent.setup()
    mockLocalStorage.getItem.mockReturnValue(null) // First time
    render(<FirstTimeTooltip {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('first-time-tooltip')).toBeInTheDocument()
    })

    const dismissButton = screen.getByTestId('tooltip-dismiss-button')
    await user.click(dismissButton)

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-tooltip-key',
      'true'
    )

    await waitFor(() => {
      expect(screen.queryByTestId('first-time-tooltip')).not.toBeInTheDocument()
    })
  })

  it('uses correct storage key for localStorage operations', async () => {
    const customStorageKey = 'custom-tooltip-key'
    mockLocalStorage.getItem.mockReturnValue(null)

    render(<FirstTimeTooltip {...defaultProps} storageKey={customStorageKey} />)

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(customStorageKey)
  })

  it('handles SSR correctly by not showing tooltip on initial render', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    render(<FirstTimeTooltip {...defaultProps} />)

    // Should only show children initially, tooltip appears after useEffect
    expect(
      screen.getByRole('button', { name: 'Test Button' })
    ).toBeInTheDocument()

    // Wait for client-side hydration to complete
    await waitFor(() => {
      expect(screen.getByTestId('first-time-tooltip')).toBeInTheDocument()
    })
  })

  it('renders with different content text', async () => {
    const customContent = 'Custom tooltip message for this feature'
    mockLocalStorage.getItem.mockReturnValue(null)

    render(<FirstTimeTooltip {...defaultProps} content={customContent} />)

    await waitFor(() => {
      expect(screen.getByText(customContent)).toBeInTheDocument()
    })
  })

  it('renders with different children', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    render(
      <FirstTimeTooltip {...defaultProps}>
        <div data-testid="custom-child">Custom Child</div>
      </FirstTimeTooltip>
    )

    expect(screen.getByTestId('custom-child')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('first-time-tooltip')).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    render(<FirstTimeTooltip {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('first-time-tooltip')).toBeInTheDocument()
    })

    const dismissButton = screen.getByTestId('tooltip-dismiss-button')
    // The button has screen reader text instead of aria-label
    const srText = screen.getByText('Dismiss tooltip')
    expect(srText).toHaveClass('sr-only')
    expect(dismissButton).toContainElement(srText)
  })

  it('handles multiple instances with different storage keys', async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'tooltip-1') return 'true' // Already seen
      if (key === 'tooltip-2') return null // Not seen
      return null
    })

    render(
      <div>
        <FirstTimeTooltip storageKey="tooltip-1" content="First tooltip">
          <button>Button 1</button>
        </FirstTimeTooltip>
        <FirstTimeTooltip storageKey="tooltip-2" content="Second tooltip">
          <button>Button 2</button>
        </FirstTimeTooltip>
      </div>
    )

    await waitFor(() => {
      // First tooltip should not be visible (already seen)
      expect(screen.queryByText('First tooltip')).not.toBeInTheDocument()
      // Second tooltip should be visible (not seen)
      expect(screen.getByText('Second tooltip')).toBeInTheDocument()
    })
  })

  it('has accessible close button with screen reader text', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    render(<FirstTimeTooltip {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('first-time-tooltip')).toBeInTheDocument()
    })

    const dismissButton = screen.getByTestId('tooltip-dismiss-button')
    const srText = screen.getByText('Dismiss tooltip')

    expect(srText).toHaveClass('sr-only')
    expect(dismissButton).toContainElement(srText)
    expect(dismissButton).toHaveAttribute('data-slot', 'button')
  })

  it('maintains tooltip position with inline styles', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    render(<FirstTimeTooltip {...defaultProps} />)

    await waitFor(() => {
      const tooltip = screen.getByTestId('first-time-tooltip')
      expect(tooltip).toHaveStyle({
        position: 'absolute',
        left: '50%',
        top: '100%',
        zIndex: 50,
        marginTop: '1rem',
        width: '20rem',
        transform: 'translateX(-50%)',
      })
    })
  })

  it('calls localStorage.setItem only once when dismissed', async () => {
    const user = userEvent.setup()
    mockLocalStorage.getItem.mockReturnValue(null)
    render(<FirstTimeTooltip {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('first-time-tooltip')).toBeInTheDocument()
    })

    const dismissButton = screen.getByTestId('tooltip-dismiss-button')

    // Click multiple times rapidly
    await user.click(dismissButton)
    await user.click(dismissButton)
    await user.click(dismissButton)

    // Should only call setItem once (since tooltip is hidden after first click)
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-tooltip-key',
      'true'
    )
  })
})
