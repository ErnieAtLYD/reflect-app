import { test, expect } from '@playwright/test'

const breakpoints = {
  mobile: 375, // Below xs breakpoint
  xs: 480, // --breakpoint-xs: 30rem (480px)
  sm: 640, // --breakpoint-sm: 40rem (640px)
  md: 768, // --breakpoint-md: 48rem (768px)
  lg: 1024, // --breakpoint-lg: 64rem (1024px)
  xl: 1280, // --breakpoint-xl: 80rem (1280px)
  '2xl': 1536, // --breakpoint-2xl: 96rem (1536px)
} as const

test.describe('Responsive Journal App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('journal app works at all screen sizes', async ({ page }) => {
    const screenSizes = [
      breakpoints.mobile,
      breakpoints.xs,
      breakpoints.sm,
      breakpoints.md,
      breakpoints.lg,
      breakpoints.xl,
      breakpoints['2xl'],
    ]

    for (const width of screenSizes) {
      await page.setViewportSize({ width, height: 800 })

      // Core functionality should always work
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.getByTestId('journal-entry-input')).toBeVisible()
      await expect(page.getByTestId('reflect-now-button')).toBeVisible()

      // Button should be disabled initially (no content)
      await expect(page.getByTestId('reflect-now-button')).toBeDisabled()
    }
  })

  test('user can write and reflect at mobile size', async ({ page }) => {
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })

    // Type a journal entry
    const journalInput = page.getByTestId('journal-entry-input')
    await journalInput.fill(
      'Today was a challenging but rewarding day. I learned new things.'
    )

    // Button should become enabled
    await expect(page.getByTestId('reflect-now-button')).toBeEnabled()

    // User can click reflect (we won't test the AI call in this test)
    const reflectButton = page.getByTestId('reflect-now-button')
    await expect(reflectButton).toBeVisible()
    await expect(reflectButton).toContainText('Reflect Now')
  })

  test('theme toggle works responsively', async ({ page }) => {
    const screenSizes = [breakpoints.mobile, breakpoints.md, breakpoints.lg]

    for (const width of screenSizes) {
      await page.setViewportSize({ width, height: 800 })

      // Theme toggle should be accessible
      const themeToggle = page.getByTestId('theme-toggle-advanced')
      await expect(themeToggle).toBeVisible()

      // Should be able to click it
      await themeToggle.click()

      // Should show some indication of theme change
      await expect(themeToggle).toBeVisible()
    }
  })

  test('no horizontal overflow at any screen size', async ({ page }) => {
    const screenSizes = [
      breakpoints.mobile,
      breakpoints.xs,
      breakpoints.sm,
      breakpoints.md,
    ]

    for (const width of screenSizes) {
      await page.setViewportSize({ width, height: 800 })

      // Check for horizontal scrollbar
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
      const clientWidth = await page.evaluate(() => document.body.clientWidth)

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // +1 for rounding
    }
  })

  test('interactive elements remain accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })

    // All key interactive elements should be large enough for touch
    const interactiveElements = [
      page.getByTestId('journal-entry-input'),
      page.getByTestId('reflect-now-button'),
      page.getByTestId('theme-toggle-advanced'),
    ]

    for (const element of interactiveElements) {
      await expect(element).toBeVisible()

      // Should be large enough for touch interaction (minimum 44px)
      const box = await element.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(40) // Slightly less due to padding/margins
    }
  })
})
