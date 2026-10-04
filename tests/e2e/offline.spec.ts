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
  const prediction = page.getByRole('region', { name: '基础预测面板' })
  await prediction.getByRole('combobox', { name: '预测偏转方向' }).selectOption('left')
  await prediction.getByRole('button', { name: '提交预测' }).click()
  await prediction.getByRole('button', { name: '运行模拟验证' }).click()
  await expect(prediction.getByRole('status')).toContainText('预测正确')
  await expect(page.getByRole('combobox', { name: '自转方向' })).toHaveValue('-1')
  await page.getByRole('button', { name: '撤销', exact: true }).click()
  await expect(page.getByRole('combobox', { name: '自转方向' })).toHaveValue('1')
})
