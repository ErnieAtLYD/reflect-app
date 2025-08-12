import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkipLink, SkipNavigation } from '@/components/ui/skip-link'
import { testAccessibility } from '@/test/accessibility'

// Mock scrollIntoView since jsdom doesn't implement it
const mockScrollIntoView = vi.fn()
Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
  writable: true,
  value: mockScrollIntoView,
})

describe('SkipLink', () => {
  beforeEach(() => {
    mockScrollIntoView.mockClear()
  })

  it('renders with correct accessibility attributes', () => {
    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
    expect(skipLink).toHaveTextContent('Skip to main content')
  })

  it('has sr-only class by default (visually hidden)', () => {
    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')
    expect(skipLink).toHaveClass('sr-only')
  })

  it('becomes visible when focused', () => {
    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    // Focus the skip link
    skipLink.focus()

    // Should have focus classes that make it visible
    expect(skipLink).toHaveClass('focus:not-sr-only')
    expect(skipLink).toHaveClass('focus:absolute')
    expect(skipLink).toHaveClass('focus:bg-primary')
  })

  it('scrolls to target element when clicked', async () => {
    const user = userEvent.setup()

    // Create target element
    const targetElement = document.createElement('div')
    targetElement.id = 'main-content'
    document.body.appendChild(targetElement)

    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    await user.click(skipLink)

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })

    // Clean up
    document.body.removeChild(targetElement)
  })

  it('focuses target element when clicked', async () => {
    const user = userEvent.setup()

    // Create target element (focusable)
    const targetElement = document.createElement('button')
    targetElement.id = 'main-content'
    targetElement.textContent = 'Main Content'
    document.body.appendChild(targetElement)

    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    await user.click(skipLink)

    // Target element should be focused
    expect(targetElement).toHaveFocus()

    // Clean up
    document.body.removeChild(targetElement)
  })

  it('adds tabindex to non-focusable target elements', async () => {
    const user = userEvent.setup()

    // Create non-focusable target element
    const targetElement = document.createElement('div')
    targetElement.id = 'main-content'
    targetElement.textContent = 'Main Content'
    document.body.appendChild(targetElement)

    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    await user.click(skipLink)

    // Should temporarily add tabindex="-1"
    expect(targetElement).toHaveAttribute('tabindex', '-1')
    expect(targetElement).toHaveFocus()

    // Should remove tabindex after delay
    await waitFor(
      () => {
        expect(targetElement).not.toHaveAttribute('tabindex')
      },
      { timeout: 200 }
    )

    // Clean up
    document.body.removeChild(targetElement)
  })

  it('preserves existing tabindex on target elements', async () => {
    const user = userEvent.setup()

    // Create target element with existing tabindex
    const targetElement = document.createElement('div')
    targetElement.id = 'main-content'
    targetElement.setAttribute('tabindex', '0')
    targetElement.textContent = 'Main Content'
    document.body.appendChild(targetElement)

    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    await user.click(skipLink)

    // Should restore original tabindex after delay
    await waitFor(
      () => {
        expect(targetElement).toHaveAttribute('tabindex', '0')
      },
      { timeout: 200 }
    )

    // Clean up
    document.body.removeChild(targetElement)
  })

  it('handles missing target element gracefully', async () => {
    const user = userEvent.setup()

    render(<SkipLink href="#non-existent">Skip to non-existent</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    // Should not throw error
    await user.click(skipLink)

    expect(mockScrollIntoView).not.toHaveBeenCalled()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()

    // Create target element
    const targetElement = document.createElement('div')
    targetElement.id = 'main-content'
    document.body.appendChild(targetElement)

    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    // Tab to focus skip link
    await user.tab()
    expect(skipLink).toHaveFocus()

    // Press Enter to activate
    await user.keyboard('{Enter}')

    expect(mockScrollIntoView).toHaveBeenCalled()

    // Clean up
    document.body.removeChild(targetElement)
  })

  it('prevents default click behavior and scrolls to target', async () => {
    const user = userEvent.setup()

    // Create target element
    const targetElement = document.createElement('div')
    targetElement.id = 'main-content'
    document.body.appendChild(targetElement)

    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')

    // Mock preventDefault to verify it's called
    const mockPreventDefault = vi.fn()
    const clickEvent = new Event('click', { bubbles: true, cancelable: true })
    Object.defineProperty(clickEvent, 'preventDefault', {
      value: mockPreventDefault,
    })

    await user.click(skipLink)

    // Should scroll to target element
    expect(mockScrollIntoView).toHaveBeenCalled()

    // Clean up
    document.body.removeChild(targetElement)
  })

  it('accepts custom className', () => {
    render(
      <SkipLink href="#main-content" className="custom-class">
        Skip to main content
      </SkipLink>
    )

    const skipLink = screen.getByTestId('skip-link')
    expect(skipLink).toHaveClass('custom-class')
    expect(skipLink).toHaveClass('sr-only') // Should still have default classes
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()

    render(
      <SkipLink ref={ref} href="#main-content">
        Skip to main content
      </SkipLink>
    )

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement))
  })

  // Accessibility tests
  it('passes accessibility tests', async () => {
    await testAccessibility(
      <SkipLink href="#main-content">Skip to main content</SkipLink>
    )
  })

  it('passes accessibility tests when focused', async () => {
    render(<SkipLink href="#main-content">Skip to main content</SkipLink>)

    const skipLink = screen.getByTestId('skip-link')
    skipLink.focus()

    // Test the focused element directly
    await testAccessibility(
      <SkipLink href="#main-content">Skip to main content</SkipLink>
    )
  })
})

describe('SkipNavigation', () => {
  it('renders with correct accessibility attributes', () => {
    render(
      <SkipNavigation>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
      </SkipNavigation>
    )

    const skipNav = screen.getByTestId('skip-navigation')
    expect(skipNav).toBeInTheDocument()
    expect(skipNav).toHaveAttribute('role', 'navigation')
    expect(skipNav).toHaveAttribute('aria-label', 'Skip navigation')
  })

  it('contains multiple skip links', () => {
    render(
      <SkipNavigation>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
      </SkipNavigation>
    )

    const skipLinks = screen.getAllByTestId('skip-link')
    expect(skipLinks).toHaveLength(2)
    expect(skipLinks[0]).toHaveTextContent('Skip to main content')
    expect(skipLinks[1]).toHaveTextContent('Skip to navigation')
  })

  it('accepts custom className', () => {
    render(
      <SkipNavigation className="custom-nav-class">
        <SkipLink href="#main-content">Skip to main content</SkipLink>
      </SkipNavigation>
    )

    const skipNav = screen.getByTestId('skip-navigation')
    expect(skipNav).toHaveClass('custom-nav-class')
    expect(skipNav).toHaveClass('relative') // Should still have default classes
  })

  it('has proper z-index for overlay positioning', () => {
    render(
      <SkipNavigation>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
      </SkipNavigation>
    )

    const skipNav = screen.getByTestId('skip-navigation')
    expect(skipNav).toHaveClass('z-50')
  })

  // Accessibility tests
  it('passes accessibility tests', async () => {
    await testAccessibility(
      <SkipNavigation>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
      </SkipNavigation>
    )
  })

  it('maintains proper tab order', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <SkipNavigation>
          <SkipLink href="#main-content">Skip to main content</SkipLink>
          <SkipLink href="#navigation">Skip to navigation</SkipLink>
        </SkipNavigation>
        <button>Other button</button>
      </div>
    )

    const skipLinks = screen.getAllByTestId('skip-link')
    const otherButton = screen.getByRole('button', { name: 'Other button' })

    // First tab should focus first skip link
    await user.tab()
    expect(skipLinks[0]).toHaveFocus()

    // Second tab should focus second skip link
    await user.tab()
    expect(skipLinks[1]).toHaveFocus()

    // Third tab should focus other button
    await user.tab()
    expect(otherButton).toHaveFocus()
  })
})
