import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { HistoryView } from '../ui/history-view'

// Mock the history-storage module
vi.mock('@/lib/history-storage', () => ({
  historyStorage: {
    isEnabled: vi.fn(),
    getEntries: vi.fn(),
    clearHistory: vi.fn(),
  },
  type: {
    HistoryEntry: {},
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Clock: ({ className }: { className?: string }) => (
    <div data-testid="clock-icon" className={className} />
  ),
  Trash2: ({ className }: { className?: string }) => (
    <div data-testid="trash-icon" className={className} />
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <div data-testid="chevron-down-icon" className={className} />
  ),
  ChevronUp: ({ className }: { className?: string }) => (
    <div data-testid="chevron-up-icon" className={className} />
  ),
}))

// Mock Dialog component
vi.mock('../ui/dialog', () => ({
  Dialog: ({
    isOpen,
    children,
    title,
    description,
  }: {
    isOpen: boolean
    children: React.ReactNode
    title?: string
    description?: string
  }) =>
    isOpen ? (
      <div data-testid="clear-dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
      </div>
    ) : null,
}))

describe('HistoryView', () => {
  const mockEntries = [
    {
      id: '1',
      timestamp: 1640995200000, // 2022-01-01 00:00:00
      journalEntry: 'First entry content',
      reflection: {
        summary: 'Summary of first entry',
        pattern: 'Pattern',
        suggestion: 'Suggestion',
      },
    },
    {
      id: '2',
      timestamp: 1641081600000, // 2022-01-02 00:00:00
      journalEntry: 'Second entry content',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when history is disabled', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(false)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue([])

    render(<HistoryView />)

    expect(screen.queryByTestId('toggle-history-view')).not.toBeInTheDocument()
  })

  it('renders nothing when no entries exist', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue([])

    render(<HistoryView />)

    expect(screen.queryByTestId('toggle-history-view')).not.toBeInTheDocument()
  })

  it('renders history view when entries exist', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue(mockEntries)

    render(<HistoryView />)

    expect(screen.getByTestId('toggle-history-view')).toBeInTheDocument()
    expect(screen.getByText('2 saved entries')).toBeInTheDocument()
    expect(screen.getByTestId('clear-history-button')).toBeInTheDocument()
  })

  it('shows singular text for one entry', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue([mockEntries[0]])

    render(<HistoryView />)

    expect(screen.getByText('1 saved entry')).toBeInTheDocument()
  })

  it('toggles expanded state when clicked', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue(mockEntries)

    render(<HistoryView />)

    const toggleButton = screen.getByTestId('toggle-history-view')

    // Initially collapsed - should show chevron down
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(toggleButton)

    // Should show chevron up when expanded
    expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('chevron-down-icon')).not.toBeInTheDocument()
  })

  it('displays history entries when expanded', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue(mockEntries)

    render(<HistoryView />)

    const toggleButton = screen.getByTestId('toggle-history-view')
    fireEvent.click(toggleButton)

    const historyEntries = screen.getAllByTestId('history-entry')
    expect(historyEntries).toHaveLength(2)

    expect(screen.getByText('First entry content')).toBeInTheDocument()
    expect(screen.getByText('Second entry content')).toBeInTheDocument()
    expect(screen.getByText('💭 Summary of first entry')).toBeInTheDocument()
  })

  it('calls onLoadEntry when entry is clicked', async () => {
    const onLoadEntry = vi.fn()
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue(mockEntries)

    render(<HistoryView onLoadEntry={onLoadEntry} />)

    const toggleButton = screen.getByTestId('toggle-history-view')
    fireEvent.click(toggleButton)

    const firstEntry = screen.getAllByTestId('history-entry')[0]
    fireEvent.click(firstEntry)

    expect(onLoadEntry).toHaveBeenCalledWith('First entry content')
  })

  it('shows clear history dialog when clear button is clicked', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue(mockEntries)

    render(<HistoryView />)

    const clearButton = screen.getByTestId('clear-history-button')
    fireEvent.click(clearButton)

    expect(screen.getByTestId('clear-dialog')).toBeInTheDocument()
    expect(screen.getByText('Clear History')).toBeInTheDocument()
  })

  it('clears history when confirmed', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue(mockEntries)

    render(<HistoryView />)

    // Open dialog
    const clearButton = screen.getByTestId('clear-history-button')
    fireEvent.click(clearButton)

    // Confirm clear
    const confirmButton = screen.getByTestId('confirm-clear-history')
    fireEvent.click(confirmButton)

    expect(historyStorage.clearHistory).toHaveBeenCalled()
  })

  it('formats dates correctly', async () => {
    const { historyStorage } = await import('@/lib/history-storage')
    ;(
      historyStorage.isEnabled as vi.MockedFunction<
        typeof historyStorage.isEnabled
      >
    ).mockReturnValue(true)
    ;(
      historyStorage.getEntries as vi.MockedFunction<
        typeof historyStorage.getEntries
      >
    ).mockReturnValue(mockEntries)

    render(<HistoryView />)

    const toggleButton = screen.getByTestId('toggle-history-view')
    fireEvent.click(toggleButton)

    // Check that dates are formatted (exact format may vary by locale)
    expect(screen.getByText(/Jan \d+, \d+:\d+/)).toBeInTheDocument()
  })
})
