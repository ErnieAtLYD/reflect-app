import { render, screen } from '@testing-library/react'

import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle, ThemeToggleAdvanced } from '@/components/ui/theme-toggle'

function renderWithTheme(component: React.ReactElement, theme = 'light') {
  return render(<ThemeProvider defaultTheme={theme}>{component}</ThemeProvider>)
}

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    renderWithTheme(<ThemeToggle />)

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
    expect(screen.getByLabelText(/switch to/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithTheme(<ThemeToggle />)

    const button = screen.getByTestId('theme-toggle')
    expect(button).toHaveAttribute('aria-label')
  })
})

describe('ThemeToggleAdvanced', () => {
  it('renders advanced toggle with label', () => {
    renderWithTheme(<ThemeToggleAdvanced />)

    expect(screen.getByTestId('theme-toggle-advanced')).toBeInTheDocument()
  })

  it('shows theme label text', () => {
    renderWithTheme(<ThemeToggleAdvanced />, 'light')

    expect(screen.getByText('Light')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    renderWithTheme(<ThemeToggleAdvanced />)

    const button = screen.getByTestId('theme-toggle-advanced')
    expect(button).toHaveAttribute('aria-label')
    expect(button.getAttribute('aria-label')).toContain('Current theme')
  })
})
