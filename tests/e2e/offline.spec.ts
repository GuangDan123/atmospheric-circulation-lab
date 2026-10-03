import { expect, test } from '@playwright/test'

test('keeps the core classroom available after an offline refresh', async ({
  context,
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })

  await context.setOffline(true)
  await page.reload()

  await expect(
    page.getByRole('heading', { name: '三圈环流因果探究平台' }),
  ).toBeVisible()
  await expect(page.getByRole('region', { name: '教师工具栏' })).toBeVisible()
  await expect(page.getByRole('region', { name: '因果链面板' })).toBeVisible()
})
