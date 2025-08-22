import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

  it('cycles through themes when clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggleAdvanced />, 'light')

    const button = screen.getByTestId('theme-toggle-advanced')

    // Should start with Light theme
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(button.getAttribute('aria-label')).toContain('Current theme: Light')

    // Click to cycle to Dark theme
    await user.click(button)
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
      expect(button.getAttribute('aria-label')).toContain('Current theme: Dark')
    })

    // Click to cycle to System theme
    await user.click(button)
    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument()
      expect(button.getAttribute('aria-label')).toContain(
        'Current theme: System'
      )
    })

    // Click to cycle back to Light theme
    await user.click(button)
    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument()
      expect(button.getAttribute('aria-label')).toContain(
        'Current theme: Light'
      )
    })
  })

  it('cycles through all available themes', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggleAdvanced />)

    const button = screen.getByTestId('theme-toggle-advanced')

    // Get the initial theme text
    const initialTheme = button.textContent

    // Click to cycle to the next theme
    await user.click(button)
    await waitFor(() => {
      expect(button.textContent).not.toBe(initialTheme)
    })

    const secondTheme = button.textContent

    // Click to cycle to the third theme
    await user.click(button)
    await waitFor(() => {
      expect(button.textContent).not.toBe(secondTheme)
    })

    const thirdTheme = button.textContent

    // Click to cycle back to the first theme
    await user.click(button)
    await waitFor(() => {
      expect(button.textContent).toBe(initialTheme)
    })

    // Verify we have three distinct themes
    expect(new Set([initialTheme, secondTheme, thirdTheme]).size).toBe(3)
  })

  it('maintains theme state across multiple cycles', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggleAdvanced />)

    const button = screen.getByTestId('theme-toggle-advanced')
    const themes = []

    // Collect theme states over multiple clicks
    themes.push(button.textContent)

    for (let i = 0; i < 6; i++) {
      const previousTheme = button.textContent
      await user.click(button)
      await waitFor(() => {
        expect(button.textContent).not.toBe(previousTheme)
      })
      themes.push(button.textContent)
    }

    // Should cycle through the same pattern twice
    expect(themes[0]).toBe(themes[3]) // First and fourth should be the same
    expect(themes[1]).toBe(themes[4]) // Second and fifth should be the same
    expect(themes[2]).toBe(themes[5]) // Third and sixth should be the same
  })

  it('displays correct icons for each theme', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggleAdvanced />, 'light')

    const button = screen.getByTestId('theme-toggle-advanced')

    // Light theme should show Sun icon
    expect(screen.getByText('Light')).toBeInTheDocument()

    // Click to Dark theme
    await user.click(button)
    await waitFor(() => {
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })

    // Click to System theme (should show dimmed Sun icon)
    await user.click(button)
    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument()
    })
  })
})
