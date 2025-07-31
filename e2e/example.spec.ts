import { test, expect } from '@playwright/test'

test('homepage has title and get started link', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Next.js/)

  const getStarted = page.getByText('Get started')
  await expect(getStarted).toBeVisible()
})
