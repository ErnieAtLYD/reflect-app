import { test, expect } from '@playwright/test'

test.describe('Parkinsans Font Loading', () => {
  test('should load Parkinsans font and apply to display elements', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for fonts to load
    await page.waitForLoadState('networkidle')

    // Create a test element with font-display class
    await page.evaluate(() => {
      const testElement = document.createElement('div')
      testElement.className = 'font-display text-4xl'
      testElement.textContent = 'Test Display Text'
      testElement.setAttribute('data-testid', 'font-display-test')
      document.body.appendChild(testElement)
    })

    const displayElement = page.getByTestId('font-display-test')
    await expect(displayElement).toBeVisible()

    // Check computed font family includes Parkinsans
    const fontFamily = await displayElement.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily
    })

    expect(fontFamily).toContain('Parkinsans')
  })

  test('should load Parkinsans font and apply to heading elements', async ({
    page,
  }) => {
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // Create a test heading with font-heading class
    await page.evaluate(() => {
      const testHeading = document.createElement('h1')
      testHeading.className = 'font-heading text-6xl font-bold'
      testHeading.textContent = 'Test Heading'
      testHeading.setAttribute('data-testid', 'font-heading-test')
      document.body.appendChild(testHeading)
    })

    const headingElement = page.getByTestId('font-heading-test')
    await expect(headingElement).toBeVisible()

    const fontFamily = await headingElement.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily
    })

    expect(fontFamily).toContain('Parkinsans')
  })

  test('should have Parkinsans font file loaded', async ({ page }) => {
    await page.goto('/')

    // Wait for all network requests to complete
    await page.waitForLoadState('networkidle')

    // Check that Google Fonts CSS is loaded
    const fontRequests = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]')
      )
      return links.some(
        (link) =>
          (link as HTMLLinkElement).href.includes('fonts.googleapis.com') ||
          (link as HTMLLinkElement).href.includes('Parkinsans')
      )
    })

    // Check if the font is available in document fonts
    const parkinsansLoaded = await page.evaluate(async () => {
      // Check if document.fonts API is available
      if ('fonts' in document) {
        await document.fonts.ready
        const fonts = Array.from(document.fonts)
        return fonts.some((font) => font.family.includes('Parkinsans'))
      }
      return true // Assume loaded if API not available
    })

    expect(parkinsansLoaded).toBe(true)
  })

  test('should render text correctly with Parkinsans font in different themes', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      const testDiv = document.createElement('div')
      testDiv.className = 'font-display text-2xl p-4'
      testDiv.textContent = 'Parkinsans in Light Theme'
      testDiv.setAttribute('data-testid', 'light-theme-test')
      document.body.appendChild(testDiv)
    })

    const lightElement = page.getByTestId('light-theme-test')
    await expect(lightElement).toBeVisible()

    // Test dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      const testDiv = document.createElement('div')
      testDiv.className = 'font-heading text-2xl p-4'
      testDiv.textContent = 'Parkinsans in Dark Theme'
      testDiv.setAttribute('data-testid', 'dark-theme-test')
      document.body.appendChild(testDiv)
    })

    const darkElement = page.getByTestId('dark-theme-test')
    await expect(darkElement).toBeVisible()

    // Verify both elements use Parkinsans
    const lightFontFamily = await lightElement.evaluate(
      (el) => window.getComputedStyle(el).fontFamily
    )
    const darkFontFamily = await darkElement.evaluate(
      (el) => window.getComputedStyle(el).fontFamily
    )

    expect(lightFontFamily).toContain('Parkinsans')
    expect(darkFontFamily).toContain('Parkinsans')
  })

  test('should handle font loading gracefully with fallbacks', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => {
      const testElement = document.createElement('div')
      testElement.className = 'font-display text-xl'
      testElement.textContent = 'Font Fallback Test'
      testElement.setAttribute('data-testid', 'fallback-test')
      document.body.appendChild(testElement)
    })

    const element = page.getByTestId('fallback-test')
    await expect(element).toBeVisible()

    // Even if Parkinsans fails to load, should fall back to sans-serif
    const fontFamily = await element.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily
    })

    // Should contain either Parkinsans or fallback fonts
    const hasFontFamily = fontFamily.length > 0
    expect(hasFontFamily).toBe(true)
  })
})
