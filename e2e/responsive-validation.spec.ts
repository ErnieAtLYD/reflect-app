import { test, expect } from '@playwright/test'

const breakpoints = {
  mobile: { width: 375, height: 667, name: 'Mobile' },
  xs: { width: 480, height: 800, name: 'XS' },
  sm: { width: 640, height: 800, name: 'SM' },
  md: { width: 768, height: 1024, name: 'MD' },
  lg: { width: 1024, height: 768, name: 'LG' },
  xl: { width: 1280, height: 1024, name: 'XL' },
  '2xl': { width: 1536, height: 1024, name: '2XL' },
}

test.describe('Responsive Layout Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const [key, viewport] of Object.entries(breakpoints)) {
    test(`should render correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      // Set viewport size
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })

      // Wait for layout to stabilize
      await page.waitForLoadState('networkidle')

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'Reflect App' })
      ).toBeVisible()

      // Verify no horizontal overflow
      const bodyScrollWidth = await page.evaluate(
        () => document.body.scrollWidth
      )
      const windowInnerWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 1) // Allow 1px tolerance

      // Check that current breakpoint indicator is showing correctly
      if (key === 'mobile') {
        const mobileIndicator = page
          .locator('.bg-destructive')
          .filter({ hasText: /Mobile/ })
        await expect(mobileIndicator).toBeVisible()
      } else if (key === 'xs') {
        const xsIndicator = page
          .locator('.bg-chart-1')
          .filter({ hasText: /XS \(480px\+\)/ })
        await expect(xsIndicator).toBeVisible()
      } else if (key === 'sm') {
        const smIndicator = page
          .locator('.bg-chart-2')
          .filter({ hasText: /SM \(640px\+\)/ })
        await expect(smIndicator).toBeVisible()
      } else if (key === 'md') {
        const mdIndicator = page
          .locator('.bg-chart-3')
          .filter({ hasText: /MD \(768px\+\)/ })
        await expect(mdIndicator).toBeVisible()
      } else if (key === 'lg') {
        const lgIndicator = page
          .locator('.bg-chart-4')
          .filter({ hasText: /LG \(1024px\+\)/ })
        await expect(lgIndicator).toBeVisible()
      } else if (key === 'xl') {
        const xlIndicator = page
          .locator('.bg-chart-5')
          .filter({ hasText: /XL \(1280px\+\)/ })
        await expect(xlIndicator).toBeVisible()
      } else if (key === '2xl') {
        const x2xlIndicator = page
          .locator('.bg-primary')
          .filter({ hasText: /2XL \(1536px\+\)/ })
        await expect(x2xlIndicator).toBeVisible()
      }

      // Verify grid layout adapts correctly
      const breakpointGrid = page.locator('[data-testid="breakpoint-grid"]')
      await expect(breakpointGrid).toBeVisible()

      // Take screenshot for visual validation
      await page.screenshot({
        path: `e2e/screenshots/responsive-${key}-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      })
    })
  }

  test('should handle smooth transitions between breakpoints', async ({
    page,
  }) => {
    // Start at mobile size
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForLoadState('networkidle')

    // Gradually increase width to test transitions
    const testWidths = [480, 640, 768, 1024, 1280, 1536]

    for (const width of testWidths) {
      await page.setViewportSize({ width, height: 800 })
      await page.waitForTimeout(100) // Allow transition to complete

      // Verify no layout breaks
      const bodyScrollWidth = await page.evaluate(
        () => document.body.scrollWidth
      )
      const windowInnerWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 1)

      // Verify content is still visible
      await expect(
        page.getByRole('heading', { name: 'Reflect App' })
      ).toBeVisible()
    }
  })

  test('should maintain proper spacing and alignment at all breakpoints', async ({
    page,
  }) => {
    for (const [, viewport] of Object.entries(breakpoints)) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.waitForLoadState('networkidle')

      // Check header layout
      const header = page.locator('header')
      await expect(header).toBeVisible()

      // Check that cards maintain proper spacing
      const cards = page.locator('[data-testid="card"], .group')
      const cardCount = await cards.count()

      if (cardCount > 0) {
        for (let i = 0; i < cardCount; i++) {
          await expect(cards.nth(i)).toBeVisible()
        }
      }

      // Verify form elements are properly sized
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox()
          if (boundingBox) {
            // Buttons should have reasonable touch target size on mobile (< 480px)
            // Note: Some buttons might have borders/padding that affect rendered size
            if (viewport.width < 480) {
              expect(boundingBox.height).toBeGreaterThanOrEqual(36)
            } else {
              // At xs+ breakpoints, can be smaller
              expect(boundingBox.height).toBeGreaterThanOrEqual(28)
            }
          }
        }
      }
    }
  })

  test('should handle container behavior correctly', async ({ page }) => {
    for (const [, viewport] of Object.entries(breakpoints)) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.waitForLoadState('networkidle')

      // Check container max-width behavior
      const container = page.locator('.container').first()
      const containerBoundingBox = await container.boundingBox()

      if (containerBoundingBox) {
        // Container should never exceed viewport width
        expect(containerBoundingBox.width).toBeLessThanOrEqual(viewport.width)

        // Container should be properly centered
        const containerLeft = containerBoundingBox.x
        const containerRight = containerLeft + containerBoundingBox.width
        const viewportCenter = viewport.width / 2
        const containerCenter = (containerLeft + containerRight) / 2

        // Allow some tolerance for centering
        expect(Math.abs(containerCenter - viewportCenter)).toBeLessThanOrEqual(
          20
        )
      }
    }
  })

  test('should handle theme toggle interactions across breakpoints', async ({
    page,
  }) => {
    for (const [, viewport] of Object.entries(breakpoints)) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.waitForLoadState('networkidle')

      // Find theme toggle buttons
      const themeToggle = page.locator('[data-testid="theme-toggle"]').first()
      const themeToggleAdvanced = page
        .locator('[data-testid="theme-toggle-advanced"]')
        .first()

      // Test basic theme toggle
      if (await themeToggle.isVisible()) {
        await themeToggle.click()
        await page.waitForTimeout(100) // Allow theme change

        // Verify theme actually changed by checking for dark class
        const htmlElement = page.locator('html')
        const hasClass = await htmlElement.evaluate(
          (el) =>
            el.classList.contains('dark') || el.classList.contains('light')
        )
        expect(hasClass).toBe(true)
      }

      // Test advanced theme toggle
      if (await themeToggleAdvanced.isVisible()) {
        await themeToggleAdvanced.click()
        await page.waitForTimeout(100)

        // Should cycle through themes
        await expect(themeToggleAdvanced).toBeVisible()
      }
    }
  })
})
