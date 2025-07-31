import { render, screen } from '@testing-library/react'

import { FontTest } from '../font-test'

describe('FontTest Component', () => {
  it('renders all text elements with correct test ids', () => {
    render(<FontTest />)

    expect(screen.getByTestId('font-test-container')).toBeInTheDocument()
    expect(screen.getByTestId('parkinsans-heading')).toBeInTheDocument()
    expect(screen.getByTestId('parkinsans-display')).toBeInTheDocument()
    expect(screen.getByTestId('body-text')).toBeInTheDocument()
    expect(screen.getByTestId('heading-medium')).toBeInTheDocument()
    expect(screen.getByTestId('heading-small')).toBeInTheDocument()
    expect(screen.getByTestId('quote-text')).toBeInTheDocument()
  })

  it('applies correct font classes to elements', () => {
    render(<FontTest />)

    const heading = screen.getByTestId('parkinsans-heading')
    const displayText = screen.getByTestId('parkinsans-display')
    const bodyText = screen.getByTestId('body-text')
    const quote = screen.getByTestId('quote-text')

    expect(heading).toHaveClass('font-heading')
    expect(displayText).toHaveClass('font-display')
    expect(bodyText).toHaveClass('font-body')
    expect(quote).toHaveClass('font-display')
  })

  it('displays correct text content', () => {
    render(<FontTest />)

    expect(screen.getByText('Parkinsans Heading')).toBeInTheDocument()
    expect(
      screen.getByText('This is display text using Parkinsans font')
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'This is body text using the default sans font (not Parkinsans)'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Medium Heading')).toBeInTheDocument()
    expect(screen.getByText('Small Heading')).toBeInTheDocument()
    const quoteElement = screen.getByTestId('quote-text')
    expect(quoteElement).toBeInTheDocument()
    expect(quoteElement.textContent).toContain(
      'This quote uses Parkinsans display font'
    )
  })

  it('applies correct typography classes', () => {
    render(<FontTest />)

    const mainHeading = screen.getByTestId('parkinsans-heading')
    const mediumHeading = screen.getByTestId('heading-medium')
    const smallHeading = screen.getByTestId('heading-small')
    const displayText = screen.getByTestId('parkinsans-display')

    expect(mainHeading).toHaveClass('text-6xl', 'font-bold')
    expect(mediumHeading).toHaveClass('text-4xl', 'font-semibold')
    expect(smallHeading).toHaveClass('text-2xl', 'font-medium')
    expect(displayText).toHaveClass('text-2xl')
  })

  it('applies proper styling classes', () => {
    render(<FontTest />)

    const container = screen.getByTestId('font-test-container')
    const quote = screen.getByTestId('quote-text')

    expect(container).toHaveClass('p-8', 'space-y-6')
    expect(quote).toHaveClass('italic', 'border-l-4', 'border-primary', 'pl-4')
  })
})
