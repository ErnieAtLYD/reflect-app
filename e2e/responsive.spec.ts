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

test.describe('Responsive Design System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays correct breakpoint indicators at different screen sizes', async ({
    page,
  }) => {
    // Test mobile (below xs)
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })
    await expect(page.locator('text=Mobile (< 480px)')).toBeVisible()
    await expect(page.locator('text=XS (480px+)')).not.toBeVisible()

    // Test XS breakpoint
    await page.setViewportSize({ width: breakpoints.xs, height: 800 })
    await expect(page.locator('text=Mobile (< 480px)')).not.toBeVisible()
    await expect(page.locator('text=XS (480px+)')).toBeVisible()
    await expect(page.locator('text=SM (640px+)')).not.toBeVisible()

    // Test SM breakpoint
    await page.setViewportSize({ width: breakpoints.sm, height: 800 })
    await expect(page.locator('text=XS (480px+)')).not.toBeVisible()
    await expect(page.locator('text=SM (640px+)')).toBeVisible()
    await expect(page.locator('text=MD (768px+)')).not.toBeVisible()

    // Test MD breakpoint
    await page.setViewportSize({ width: breakpoints.md, height: 800 })
    await expect(page.locator('text=SM (640px+)')).not.toBeVisible()
    await expect(page.locator('text=MD (768px+)')).toBeVisible()
    await expect(page.locator('text=LG (1024px+)')).not.toBeVisible()

    // Test LG breakpoint
    await page.setViewportSize({ width: breakpoints.lg, height: 800 })
    await expect(page.locator('text=MD (768px+)')).not.toBeVisible()
    await expect(page.locator('text=LG (1024px+)')).toBeVisible()
    await expect(page.locator('text=XL (1280px+)')).not.toBeVisible()

    // Test XL breakpoint
    await page.setViewportSize({ width: breakpoints.xl, height: 800 })
    await expect(page.locator('text=LG (1024px+)')).not.toBeVisible()
    await expect(page.locator('text=XL (1280px+)')).toBeVisible()
    await expect(page.locator('text=2XL (1536px+)')).not.toBeVisible()

    // Test 2XL breakpoint
    await page.setViewportSize({ width: breakpoints['2xl'], height: 800 })
    await expect(page.locator('text=XL (1280px+)')).not.toBeVisible()
    await expect(page.locator('text=2XL (1536px+)')).toBeVisible()
  })

  test('header layout adapts responsively', async ({ page }) => {
    // Mobile: should be stacked vertically
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })
    const headerMobile = page.locator('header')
    await expect(headerMobile).toHaveClass(/flex-col/)

    // XS and above: should be horizontal
    await page.setViewportSize({ width: breakpoints.xs, height: 800 })
    const headerDesktop = page.locator('header')
    await expect(headerDesktop).toHaveClass(/xs:flex-row/)
  })

  test('grid layout adapts at different breakpoints', async ({ page }) => {
    const breakpointGrid = page
      .locator('[data-testid="breakpoint-grid"]')
      .first()

    // Mobile: 1 column
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })
    await expect(breakpointGrid).toHaveClass(/grid-cols-1/)

    // XS: 2 columns
    await page.setViewportSize({ width: breakpoints.xs, height: 800 })
    await expect(breakpointGrid).toHaveClass(/xs:grid-cols-2/)

    // SM: 3 columns
    await page.setViewportSize({ width: breakpoints.sm, height: 800 })
    await expect(breakpointGrid).toHaveClass(/sm:grid-cols-3/)

    // MD: 4 columns
    await page.setViewportSize({ width: breakpoints.md, height: 800 })
    await expect(breakpointGrid).toHaveClass(/md:grid-cols-4/)

    // LG: 5 columns
    await page.setViewportSize({ width: breakpoints.lg, height: 800 })
    await expect(breakpointGrid).toHaveClass(/lg:grid-cols-5/)

    // XL: 6 columns
    await page.setViewportSize({ width: breakpoints.xl, height: 800 })
    await expect(breakpointGrid).toHaveClass(/xl:grid-cols-6/)
  })

  test('main grid switches from 1 to 2 columns at lg breakpoint', async ({
    page,
  }) => {
    const mainGrid = page.locator('.grid').first()

    // Below LG: single column
    await page.setViewportSize({ width: breakpoints.md, height: 800 })

    // LG and above: 2 columns
    await page.setViewportSize({ width: breakpoints.lg, height: 800 })
    await expect(mainGrid).toHaveClass(/lg:grid-cols-2/)
  })

  test('color palette grid adapts responsively', async ({ page }) => {
    // SM: 2 columns
    await page.setViewportSize({ width: breakpoints.sm, height: 800 })
    const colorGrid = page
      .locator('text=Background Colors')
      .locator('..')
      .locator('..')
    await expect(colorGrid).toHaveClass(/sm:grid-cols-2/)

    // LG: 3 columns
    await page.setViewportSize({ width: breakpoints.lg, height: 800 })
    await expect(colorGrid).toHaveClass(/lg:grid-cols-3/)
  })

  test('container utility centers content properly', async ({ page }) => {
    // Test container behavior at different breakpoints
    const container = page.locator('.container').first()

    for (const [name, width] of Object.entries(breakpoints)) {
      await page.setViewportSize({ width, height: 800 })

      // Container should be centered
      const containerBox = await container.boundingBox()
      const pageWidth = await page.evaluate(() => window.innerWidth)

      if (containerBox) {
        // Check that container is roughly centered (allowing for padding)
        const leftMargin = containerBox.x
        const rightMargin = pageWidth - (containerBox.x + containerBox.width)
        const marginDiff = Math.abs(leftMargin - rightMargin)

        // Margins should be roughly equal (within 20px tolerance for padding)
        expect(marginDiff).toBeLessThan(20)
      }
    }
  })

  test('spacing adapts at different breakpoints', async ({ page }) => {
    // Mobile spacing should be smaller
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })
    const main = page.locator('main')
    await expect(main).toHaveClass(/p-4/)

    // XS spacing
    await page.setViewportSize({ width: breakpoints.xs, height: 800 })
    await expect(main).toHaveClass(/xs:p-6/)

    // SM and above spacing
    await page.setViewportSize({ width: breakpoints.sm, height: 800 })
    await expect(main).toHaveClass(/sm:p-8/)
  })

  test('typography scales responsively', async ({ page }) => {
    const heading = page.locator('h1')

    // Mobile: smaller text
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })
    await expect(heading).toHaveClass(/text-2xl/)

    // XS and above: larger text
    await page.setViewportSize({ width: breakpoints.xs, height: 800 })
    await expect(heading).toHaveClass(/xs:text-3xl/)
  })

  test('no horizontal overflow at any breakpoint', async ({ page }) => {
    // Test each breakpoint to ensure no horizontal scrolling
    for (const [name, width] of Object.entries(breakpoints)) {
      await page.setViewportSize({ width, height: 800 })

      // Check that page width doesn't exceed viewport
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      )
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth
      )

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // Allow 1px tolerance
    }
  })

  test('all interactive elements remain accessible on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: breakpoints.mobile, height: 800 })

    // Test theme toggles are clickable
    await expect(page.getByTestId('theme-toggle')).toBeVisible()
    await expect(page.getByTestId('theme-toggle-advanced')).toBeVisible()

    // Test form elements are accessible
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('button').first()).toBeVisible()

    // Test feedback component is accessible
    await expect(page.getByTestId('feedback-positive')).toBeVisible()
    await expect(page.getByTestId('feedback-negative')).toBeVisible()
  })
})
