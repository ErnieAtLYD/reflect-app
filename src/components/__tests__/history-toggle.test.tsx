import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { HistoryToggle } from '../ui/history-toggle'

// Mock the history-storage module
vi.mock('@/lib/history-storage', () => ({
  historyStorage: {
    isEnabled: vi.fn(),
    setEnabled: vi.fn(),
  },
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Database: ({ className }: { className?: string }) => (
    <div data-testid="database-icon" className={className} />
  ),
  DatabaseZap: ({ className }: { className?: string }) => (
    <div data-testid="database-zap-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className} />
  ),
}))

describe('HistoryToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage for FirstTimeTooltip
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
  })

  it('renders with disabled state initially', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(false)

    render(<HistoryToggle />)

    expect(screen.getByTestId('history-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('database-zap-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('database-icon')).not.toBeInTheDocument()
  })

  it('renders with enabled state when storage is enabled', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)

    render(<HistoryToggle />)

    expect(screen.getByTestId('history-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('database-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('database-zap-icon')).not.toBeInTheDocument()
  })

  it('toggles state when clicked', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(false)

    render(<HistoryToggle />)

    const toggle = screen.getByTestId('history-toggle')
    fireEvent.click(toggle)

    expect(historyStorage.setEnabled).toHaveBeenCalledWith(true)
  })

  it('shows correct tooltip text for disabled state', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(false)

    render(<HistoryToggle />)

    const toggle = screen.getByTestId('history-toggle')
    expect(toggle).toHaveAttribute(
      'title',
      'History storage is disabled - Click to enable saving your journal entries and reflections locally in your browser'
    )
  })

  it('shows correct tooltip text for enabled state', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)

    render(<HistoryToggle />)

    const toggle = screen.getByTestId('history-toggle')
    expect(toggle).toHaveAttribute(
      'title',
      'History storage is enabled - Your journal entries and AI reflections are being saved locally in your browser for easy access'
    )
  })

  it('includes screen reader text', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(false)

    render(<HistoryToggle />)

    expect(screen.getByText('Enable history storage')).toBeInTheDocument()
  })

  it('applies custom className when provided', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(false)

    render(<HistoryToggle className="custom-class" />)

    const toggle = screen.getByTestId('history-toggle')
    expect(toggle).toHaveClass('custom-class')
  })
})
