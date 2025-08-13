/**
 * Focus Management Tests
 *
 * Comprehensive test suite for focus management utilities, hooks, and components
 * including focus trapping, restoration, dynamic content focus, and accessibility.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

import { Dialog } from '@/components/ui/dialog'
import {
  DynamicContent,
  LoadingContent,
  ErrorContent,
} from '@/components/ui/dynamic-content'
import {
  FocusableButton,
  FocusableButtonGroup,
} from '@/components/ui/focusable-button'
import { useFocusTrap, useAutoFocus } from '@/hooks/use-focus-management'
import {
  FocusTrap,
  focusRestoration,
  DynamicFocusManager,
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
} from '@/lib/focus-management'

// Test utilities
function TestComponent() {
  return (
    <div>
      <button data-testid="button-1">Button 1</button>
      <input data-testid="input-1" type="text" />
      <button data-testid="button-2">Button 2</button>
      <a href="/test" data-testid="link-1">
        Link 1
      </a>
    </div>
  )
}

function TestDialogComponent() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen(true)} data-testid="open-dialog">
        Open Dialog
      </button>
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Test Dialog"
        description="This is a test dialog"
      >
        <input data-testid="dialog-input" type="text" />
        <button data-testid="dialog-button" onClick={() => setIsOpen(false)}>
          Close
        </button>
      </Dialog>
    </div>
  )
}

function TestDynamicContentComponent() {
  const [content, setContent] =
    React.useState<React.ReactNode>('Initial content')
  const [state, setState] = React.useState<'loading' | 'success' | 'error'>(
    'success'
  )

  return (
    <div>
      <button
        onClick={() => setContent('Updated content')}
        data-testid="update-content"
      >
        Update Content
      </button>
      <button onClick={() => setState('loading')} data-testid="set-loading">
        Set Loading
      </button>
      <button onClick={() => setState('error')} data-testid="set-error">
        Set Error
      </button>
      <DynamicContent
        state={state}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={true}
        announceChanges={true}
        data-testid="dynamic-content"
      >
        {content}
      </DynamicContent>
    </div>
  )
}

function TestAutoFocusComponent() {
  const ref = useAutoFocus<HTMLInputElement>({
    enabled: true,
    selectText: true,
  })

  return (
    <div>
      <input
        data-testid="auto-focus-input"
        ref={ref}
        defaultValue="Select this text"
      />
    </div>
  )
}

describe('Focus Management Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  describe('getFocusableElements', () => {
    it('should find all focusable elements in container', () => {
      render(<TestComponent />)
      const container = screen.getByTestId('button-1')
        .parentElement as HTMLElement

      const focusable = getFocusableElements(container)

      expect(focusable).toHaveLength(4)
      expect(focusable[0]).toBe(screen.getByTestId('button-1'))
      expect(focusable[1]).toBe(screen.getByTestId('input-1'))
      expect(focusable[2]).toBe(screen.getByTestId('button-2'))
      expect(focusable[3]).toBe(screen.getByTestId('link-1'))
    })

    it('should exclude disabled elements', () => {
      render(
        <div>
          <button>Enabled Button</button>
          <button disabled>Disabled Button</button>
          <input type="text" />
          <input type="text" disabled />
        </div>
      )

      const container = screen.getByText('Enabled Button')
        .parentElement as HTMLElement
      const focusable = getFocusableElements(container)

      expect(focusable).toHaveLength(2)
      expect(focusable[0]).toHaveTextContent('Enabled Button')
      expect(focusable[1]).toHaveAttribute('type', 'text')
      expect(focusable[1]).not.toHaveAttribute('disabled')
    })
  })

  describe('getFirstFocusableElement', () => {
    it('should return first focusable element', () => {
      render(<TestComponent />)
      const container = screen.getByTestId('button-1')
        .parentElement as HTMLElement

      const first = getFirstFocusableElement(container)

      expect(first).toBe(screen.getByTestId('button-1'))
    })

    it('should return null if no focusable elements exist', () => {
      render(
        <div>
          <span>No focusable elements</span>
        </div>
      )
      const container = screen.getByText('No focusable elements')
        .parentElement as HTMLElement

      const first = getFirstFocusableElement(container)

      expect(first).toBeNull()
    })
  })

  describe('getLastFocusableElement', () => {
    it('should return last focusable element', () => {
      render(<TestComponent />)
      const container = screen.getByTestId('button-1')
        .parentElement as HTMLElement

      const last = getLastFocusableElement(container)

      expect(last).toBe(screen.getByTestId('link-1'))
    })
  })
})

describe('FocusTrap', () => {
  let container: HTMLElement

  beforeEach(() => {
    render(<TestComponent />)
    container = screen.getByTestId('button-1').parentElement as HTMLElement
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should trap focus within container', async () => {
    const user = userEvent.setup()
    const focusTrap = new FocusTrap(container)

    // Activate focus trap
    focusTrap.activate()

    // Should focus first element
    await waitFor(() => {
      expect(screen.getByTestId('button-1')).toHaveFocus()
    })

    // Tab to next element
    await user.tab()
    expect(screen.getByTestId('input-1')).toHaveFocus()

    // Tab to next element
    await user.tab()
    expect(screen.getByTestId('button-2')).toHaveFocus()

    // Tab to last element
    await user.tab()
    expect(screen.getByTestId('link-1')).toHaveFocus()

    // Tab should wrap to first element
    await user.tab()
    expect(screen.getByTestId('button-1')).toHaveFocus()

    focusTrap.deactivate()
  })

  it('should handle shift+tab navigation', async () => {
    const user = userEvent.setup()
    const focusTrap = new FocusTrap(container)

    focusTrap.activate()

    // Focus last element manually
    screen.getByTestId('link-1').focus()

    // Shift+Tab should go to previous element
    await user.tab({ shift: true })
    expect(screen.getByTestId('button-2')).toHaveFocus()

    // Continue shift+tabbing
    await user.tab({ shift: true })
    expect(screen.getByTestId('input-1')).toHaveFocus()

    await user.tab({ shift: true })
    expect(screen.getByTestId('button-1')).toHaveFocus()

    // Should wrap to last element
    await user.tab({ shift: true })
    expect(screen.getByTestId('link-1')).toHaveFocus()

    focusTrap.deactivate()
  })

  it('should restore focus when deactivated', async () => {
    const originalButton = screen.getByTestId('button-2')

    // Focus an element outside the trap
    originalButton.focus()
    expect(originalButton).toHaveFocus()

    const focusTrap = new FocusTrap(container)
    focusTrap.activate()

    // Focus should move to first element in trap
    await waitFor(() => {
      expect(screen.getByTestId('button-1')).toHaveFocus()
    })

    // Deactivate and check focus restoration
    focusTrap.deactivate()

    await waitFor(() => {
      expect(originalButton).toHaveFocus()
    })
  })
})

describe('FocusRestoration', () => {
  beforeEach(() => {
    render(<TestComponent />)
    focusRestoration.clear()
  })

  it('should save and restore focus', () => {
    const button1 = screen.getByTestId('button-1')
    const button2 = screen.getByTestId('button-2')

    // Focus first button and save
    button1.focus()
    focusRestoration.save()

    // Focus second button
    button2.focus()
    expect(button2).toHaveFocus()

    // Restore focus
    const restored = focusRestoration.restore()
    expect(restored).toBe(true)
    expect(button1).toHaveFocus()
  })

  it('should maintain focus history', () => {
    const button1 = screen.getByTestId('button-1')
    const input1 = screen.getByTestId('input-1')
    const button2 = screen.getByTestId('button-2')

    // Save multiple focus states
    button1.focus()
    focusRestoration.save()

    input1.focus()
    focusRestoration.save()

    button2.focus()
    focusRestoration.save()

    expect(focusRestoration.historyLength).toBe(3)

    // Restore in reverse order
    const button3 = screen.getByTestId('link-1')
    button3.focus()

    focusRestoration.restore()
    expect(button2).toHaveFocus()

    focusRestoration.restore()
    expect(input1).toHaveFocus()

    focusRestoration.restore()
    expect(button1).toHaveFocus()
  })
})

describe('DynamicFocusManager', () => {
  let manager: DynamicFocusManager

  beforeEach(() => {
    manager = new DynamicFocusManager()
    render(<div data-testid="container" />)
  })

  afterEach(() => {
    manager.cleanup()
  })

  it('should focus new content when added', () => {
    const container = screen.getByTestId('container')

    // Add focusable content
    const button = document.createElement('button')
    button.textContent = 'New Button'
    button.setAttribute('data-testid', 'new-button')
    container.appendChild(button)

    // Focus new content
    const focused = manager.focusNewContent(container)

    expect(focused).toBe(true)
    expect(button).toHaveFocus()
  })

  it('should observe content changes', async () => {
    const container = screen.getByTestId('container')
    const callback = vi.fn()

    // Start observing
    const cleanup = manager.observeContentChanges(container, callback)

    // Add new content
    const div = document.createElement('div')
    div.textContent = 'New content'
    container.appendChild(div)

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith([div], [])
    })

    cleanup()
  })
})

describe('React Hooks', () => {
  describe('useFocusTrap', () => {
    it('should provide focus trap functionality', async () => {
      const TestFocusTrapComponent = () => {
        const { containerRef, activate, deactivate, isActive } =
          useFocusTrap<HTMLDivElement>()

        return (
          <div>
            <button onClick={() => activate()} data-testid="activate">
              Activate
            </button>
            <button onClick={() => deactivate()} data-testid="deactivate">
              Deactivate
            </button>
            <div ref={containerRef} data-testid="trap-container">
              <button data-testid="trapped-button">Trapped Button</button>
            </div>
            <span data-testid="status">{isActive ? 'active' : 'inactive'}</span>
          </div>
        )
      }

      render(<TestFocusTrapComponent />)

      expect(screen.getByTestId('status')).toHaveTextContent('inactive')

      const activateButton = screen.getByTestId('activate')
      activateButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('trapped-button')).toHaveFocus()
      })
    })
  })

  describe('useAutoFocus', () => {
    it('should auto-focus element on mount', async () => {
      render(<TestAutoFocusComponent />)

      await waitFor(() => {
        const input = screen.getByTestId('auto-focus-input') as HTMLInputElement
        expect(input).toHaveFocus()
        expect(input.selectionStart).toBe(0)
        expect(input.selectionEnd).toBe(input.value.length)
      })
    })
  })
})

describe('FocusableButton Component', () => {
  it('should render with enhanced focus indicators', () => {
    render(
      <FocusableButton focusMode="enhanced" announceFocus>
        Test Button
      </FocusableButton>
    )

    const button = screen.getByTestId('focusable-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Test Button')
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<FocusableButton onClick={onClick}>Test Button</FocusableButton>)

    const button = screen.getByTestId('focusable-button')
    button.focus()

    // Enter key should trigger click
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalled()

    // Space key should trigger click
    onClick.mockClear()
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalled()
  })

  it('should implement roving tabindex in button group', async () => {
    render(
      <FocusableButtonGroup aria-label="Button group">
        <FocusableButton>Button 1</FocusableButton>
        <FocusableButton>Button 2</FocusableButton>
        <FocusableButton>Button 3</FocusableButton>
      </FocusableButtonGroup>
    )

    const buttons = screen.getAllByTestId('focusable-button')

    // First button should be tabbable, others should not
    expect(buttons[0]).toHaveAttribute('tabindex', '0')
    expect(buttons[1]).toHaveAttribute('tabindex', '-1')
    expect(buttons[2]).toHaveAttribute('tabindex', '-1')

    // Test basic roving tabindex structure is correct
    expect(buttons[0]).toHaveAttribute('data-position', '0')
    expect(buttons[1]).toHaveAttribute('data-position', '1')
    expect(buttons[2]).toHaveAttribute('data-position', '2')

    // Test that the group container exists
    const group = screen.getByTestId('focusable-button-group')
    expect(group).toHaveAttribute('role', 'group')
    expect(group).toHaveAttribute('aria-label', 'Button group')
  })
})

describe('DynamicContent Component', () => {
  it('should render different states correctly', () => {
    const { rerender } = render(
      <DynamicContent state="loading">Content</DynamicContent>
    )

    expect(screen.getByTestId('dynamic-content-loading')).toBeInTheDocument()

    rerender(<DynamicContent state="error">Content</DynamicContent>)

    expect(screen.getByTestId('dynamic-content-error')).toBeInTheDocument()

    rerender(<DynamicContent state="success">Content</DynamicContent>)

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should handle content changes with focus management', async () => {
    render(<TestDynamicContentComponent />)

    // Initial content should be present
    expect(screen.getByText('Initial content')).toBeInTheDocument()

    // Update content
    const user = userEvent.setup()
    await user.click(screen.getByTestId('update-content'))

    await waitFor(() => {
      expect(screen.getByText('Updated content')).toBeInTheDocument()
    })
  })

  it('should announce state changes', async () => {
    const user = userEvent.setup()
    render(<TestDynamicContentComponent />)

    // Set to loading state
    await user.click(screen.getByTestId('set-loading'))

    await waitFor(() => {
      expect(screen.getByTestId('dynamic-content-loading')).toBeInTheDocument()
    })
  })
})

describe('LoadingContent Component', () => {
  it('should render loading spinner and message', () => {
    render(<LoadingContent message="Loading data..." size="lg" />)

    const loading = screen.getByTestId('loading-content')
    expect(loading).toBeInTheDocument()
    expect(loading).toHaveAttribute('aria-label', 'Loading data...')

    // Check for visible text (not sr-only)
    const visibleText = screen.getByText('Loading data...', {
      selector: '.text-sm',
    })
    expect(visibleText).toBeInTheDocument()
  })
})

describe('ErrorContent Component', () => {
  it('should render error message and retry button', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <ErrorContent
        message="Something went wrong"
        showRetry
        onRetry={onRetry}
      />
    )

    const error = screen.getByTestId('error-content')
    expect(error).toBeInTheDocument()
    expect(error).toHaveAttribute('role', 'alert')
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    const retryButton = screen.getByTestId('error-retry-button')
    await user.click(retryButton)

    expect(onRetry).toHaveBeenCalled()
  })
})

describe('Dialog Component with Focus Management', () => {
  it('should manage focus correctly when opening and closing', async () => {
    const user = userEvent.setup()
    render(<TestDialogComponent />)

    const openButton = screen.getByTestId('open-dialog')

    // Focus the open button
    openButton.focus()
    expect(openButton).toHaveFocus()

    // Open dialog
    await user.click(openButton)

    // Dialog should be open and focus should be trapped
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    // Close dialog
    const closeButton = screen.getByTestId('dialog-button')
    await user.click(closeButton)

    // Focus should be restored to the open button
    await waitFor(() => {
      expect(openButton).toHaveFocus()
    })
  })
})

describe('Integration Tests', () => {
  it('should provide comprehensive focus management across components', async () => {
    const user = userEvent.setup()

    const IntegrationTestComponent = () => {
      const [showDialog, setShowDialog] = React.useState(false)
      const [content, setContent] = React.useState('Initial')

      return (
        <div>
          <FocusableButton
            onClick={() => setShowDialog(true)}
            focusMode="enhanced"
            data-testid="open-dialog"
          >
            Open Dialog
          </FocusableButton>

          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <DynamicContent autoFocus announceChanges>
            <div>{content}</div>
            <FocusableButton
              onClick={() => setContent('Updated')}
              data-testid="update-content"
            >
              Update Content
            </FocusableButton>
          </DynamicContent>

          <Dialog
            isOpen={showDialog}
            onClose={() => setShowDialog(false)}
            title="Integration Test Dialog"
            restoreFocus={true}
          >
            <FocusableButton
              onClick={() => setShowDialog(false)}
              data-testid="close-dialog"
            >
              Close
            </FocusableButton>
          </Dialog>
        </div>
      )
    }

    render(<IntegrationTestComponent />)

    // Test focus flow
    const openButton = screen.getByTestId('open-dialog')
    openButton.focus()

    // Open dialog
    await user.click(openButton)

    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })

    // Close dialog and verify focus restoration
    await user.click(screen.getByTestId('close-dialog'))

    await waitFor(() => {
      expect(openButton).toHaveFocus()
    })

    // Test dynamic content focus
    await user.click(screen.getByTestId('update-content'))

    await waitFor(() => {
      expect(screen.getByText('Updated')).toBeInTheDocument()
    })
  })
})
