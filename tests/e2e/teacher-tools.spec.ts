import { expect, test } from '@playwright/test'

test('preserves classroom state while switching to the low performance tier', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('button', { name: '查看 7 月' }).click()
  await page
    .getByRole('region', { name: '教师工具栏' })
    .getByRole('button', { name: '下一步' })
    .click()
  await page.getByRole('button', { name: '北半球副热带高压' }).first().click()
  await page.getByRole('combobox', { name: '性能档位' }).selectOption('low')

  await expect(
    page.getByRole('slider', { name: '月份', exact: true }),
  ).toHaveValue('7')
  await expect(page.getByRole('heading', { name: '高空向两极运动' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: '北半球副热带高压' }).first(),
  ).toHaveAttribute('aria-current', 'true')
  await expect(page.getByRole('combobox', { name: '标签密度' })).toHaveValue(
    'reduced',
  )
})

test('enters fullscreen and downloads a globe screenshot', async ({ page }) => {
  await page.goto('/')

  await page
    .getByRole('region', { name: '教师工具栏' })
    .getByRole('button', { name: '全屏' })
    .click()
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement !== null))
    .toBe(true)

  await page.evaluate(async () => {
    await document.exitFullscreen()
  })

  const downloadPromise = page.waitForEvent('download')
  await page
    .getByRole('region', { name: '教师工具栏' })
    .getByRole('button', { name: '截图' })
    .click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('three-cell-circulation.png')
})
