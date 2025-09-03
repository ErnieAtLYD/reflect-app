import { test, expect } from '@playwright/test'

const breakpoints = {
  mobile: 375,
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

test.describe('Journal App Responsive Validation', () => {
  const testBreakpoints = [
    { name: 'Mobile', width: breakpoints.mobile, height: 667 },
    { name: 'XS', width: breakpoints.xs, height: 800 },
    { name: 'SM', width: breakpoints.sm, height: 800 },
    { name: 'MD', width: breakpoints.md, height: 1024 },
    { name: 'LG', width: breakpoints.lg, height: 768 },
    { name: 'XL', width: breakpoints.xl, height: 1024 },
    { name: '2XL', width: breakpoints['2xl'], height: 1024 },
  ]

  testBreakpoints.forEach(({ name, width, height }) => {
    test(`should render correctly at ${name} (${width}x${height})`, async ({
      page,
    }) => {
      await page.goto('/')
      await page.setViewportSize({ width, height })

      // Core app elements should be visible and functional
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.getByTestId('journal-entry-input')).toBeVisible()
      await expect(page.getByTestId('reflect-now-button')).toBeVisible()

      // Test actual user interaction
      const input = page.getByTestId('journal-entry-input')
      await input.fill(
        'This is a test entry to verify the app works at this screen size.'
      )

      await expect(page.getByTestId('reflect-now-button')).toBeEnabled()

      // Clear input should work
      await input.clear()
      await expect(page.getByTestId('reflect-now-button')).toBeDisabled()

      // Theme toggle should be accessible
      const themeToggle = page.getByTestId('theme-toggle-advanced')
      await expect(themeToggle).toBeVisible()

      // No horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth
      })
      expect(hasHorizontalOverflow).toBe(false)
    })
  })

  test('should maintain proper spacing and alignment at all breakpoints', async ({
    page,
  }) => {
    await page.goto('/')

    for (const { width, height } of testBreakpoints) {
      await page.setViewportSize({ width, height })

      // Main container should be centered
      const main = page.locator('main').first()
      await expect(main).toBeVisible()

      // Elements should have proper spacing
      const input = page.getByTestId('journal-entry-input')
      const button = page.getByTestId('reflect-now-button')

      await expect(input).toBeVisible()
      await expect(button).toBeVisible()

      // Button should be below input with proper spacing
      const inputBox = await input.boundingBox()
      const buttonBox = await button.boundingBox()

      if (inputBox && buttonBox) {
        // Button should be below input (allowing for some margin)
        expect(buttonBox.y).toBeGreaterThan(inputBox.y + inputBox.height - 10)
      }
    }
  })

  test('should handle container behavior correctly', async ({ page }) => {
    await page.goto('/')

    for (const { width, height } of testBreakpoints.slice(0, 4)) {
      // Test smaller breakpoints
      await page.setViewportSize({ width, height })

      // Container should not exceed viewport width
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(width + 1) // +1 for rounding
    }
  })

  test('should handle theme toggle interactions across breakpoints', async ({
    page,
  }) => {
    await page.goto('/')

    for (const { width, height } of [
      testBreakpoints[0], // Mobile
      testBreakpoints[3], // MD
      testBreakpoints[5], // XL
    ]) {
      await page.setViewportSize({ width, height })

      const themeToggle = page.getByTestId('theme-toggle-advanced')
      await expect(themeToggle).toBeVisible()

      // Should be clickable at all screen sizes
      await themeToggle.click()
      await expect(themeToggle).toBeVisible()

      // App should remain functional after theme change
      await expect(page.getByTestId('journal-entry-input')).toBeVisible()
      await expect(page.getByTestId('reflect-now-button')).toBeVisible()
    }
  })
})
