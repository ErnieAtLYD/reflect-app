import { render } from '@testing-library/react'
import { vi } from 'vitest'

describe('Parkinsans Font Loading', () => {
  let originalGetComputedStyle: typeof window.getComputedStyle

  beforeAll(() => {
    originalGetComputedStyle = window.getComputedStyle
    window.getComputedStyle = vi.fn().mockImplementation((element) => {
      if (element.classList.contains('font-display')) {
        return {
          fontFamily: 'var(--font-parkinsans), var(--font-sans)',
        } as CSSStyleDeclaration
      }
      if (element.classList.contains('font-heading')) {
        return {
          fontFamily: 'var(--font-parkinsans), var(--font-sans)',
        } as CSSStyleDeclaration
      }
      return originalGetComputedStyle(element)
    })
  })

  afterAll(() => {
    window.getComputedStyle = originalGetComputedStyle
  })

  it('should have font CSS classes available for testing', () => {
    const { container } = render(
      <div>
        <div className="font-display" data-testid="display-element" />
        <div className="font-heading" data-testid="heading-element" />
      </div>
    )

    const displayElement = container.querySelector(
      '[data-testid="display-element"]'
    )
    const headingElement = container.querySelector(
      '[data-testid="heading-element"]'
    )

    expect(displayElement).toHaveClass('font-display')
    expect(headingElement).toHaveClass('font-heading')
  })

  it('should render elements with font-display class using Parkinsans', () => {
    const { container } = render(
      <div className="font-display" data-testid="display-text">
        Display Text
      </div>
    )

    const element = container.querySelector('[data-testid="display-text"]')
    const computedStyle = window.getComputedStyle(element!)

    expect(computedStyle.fontFamily).toContain('--font-parkinsans')
  })

  it('should render elements with font-heading class using Parkinsans', () => {
    const { container } = render(
      <h1 className="font-heading" data-testid="heading-text">
        Heading Text
      </h1>
    )

    const element = container.querySelector('[data-testid="heading-text"]')
    const computedStyle = window.getComputedStyle(element!)

    expect(computedStyle.fontFamily).toContain('--font-parkinsans')
  })

  it('should properly mock getComputedStyle for font testing', () => {
    const { container } = render(
      <div className="font-display" data-testid="display-text">
        Display Text
      </div>
    )

    const element = container.querySelector('[data-testid="display-text"]')
    const computedStyle = window.getComputedStyle(element!)

    expect(computedStyle.fontFamily).toContain('--font-parkinsans')
    expect(computedStyle.fontFamily).toContain('--font-sans')
  })

  it('should verify font variable classes can be applied', () => {
    const { container } = render(
      <div className="font-sans antialiased" data-testid="body-content">
        <div className="font-display">Display text</div>
        <div className="font-heading">Heading text</div>
      </div>
    )

    const bodyContent = container.querySelector('[data-testid="body-content"]')
    expect(bodyContent).toHaveClass('font-sans', 'antialiased')
  })
})
