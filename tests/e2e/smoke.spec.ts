import { expect, test } from '@playwright/test'

test('opens the circulation platform shell without runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { name: '三圈环流因果探究平台' })).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(1)
  expect(
    runtimeErrors.filter((message) =>
      message.includes('Cannot set "data-'),
    ),
  ).toEqual([])
})
