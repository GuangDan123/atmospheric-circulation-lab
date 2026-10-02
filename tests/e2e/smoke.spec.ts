import { expect, test } from '@playwright/test'

test('opens the circulation platform shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '三圈环流因果探究平台' })).toBeVisible()
})
