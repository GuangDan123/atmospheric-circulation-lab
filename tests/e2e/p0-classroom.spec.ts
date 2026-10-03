import { expect, test } from '@playwright/test'

test('completes the P0 classroom sequence and restores the initial classroom', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '三圈环流因果探究平台' })).toBeVisible()
  await page.getByRole('button', { name: '三圈环流全景', exact: true }).click()
  const coriolis = page.getByRole('checkbox', { name: '开启地转偏向' })
  await coriolis.uncheck()
  await expect(coriolis).not.toBeChecked()
  const section = page.getByRole('img', { name: '全球大气环流经向剖面' })
  const map = page.getByRole('img', { name: '全球气压带与风带平面图' })
  const causal = page.getByRole('region', { name: '因果链面板' })
  await causal.getByRole('button', { name: '下一步' }).click()
  await expect(causal.getByRole('heading', { name: '高空径直向两极运动' })).toBeVisible()
  await coriolis.check()
  await expect(section.locator('[data-source-id^="wind-belt:"]')).toHaveCount(6)
  await expect(map.locator('[data-source-id^="wind-belt:"]')).toHaveCount(6)
  await section.getByRole('button', { name: '北半球副热带高压' }).click()
  for (const view of [section, map]) {
    await expect(view.getByRole('button', { name: '北半球副热带高压' }))
      .toHaveAttribute('aria-current', 'true')
  }
  await expect(causal.getByLabel('当前选中气压带成因')).toHaveText('动力成因')
  await causal.getByRole('button', { name: '重置因果链' }).click()
  await page.getByRole('combobox', { name: '动画速度' }).selectOption('0.5')
  const titles = ['赤道受热上升', '高空向两极运动', '地转偏向增强',
    '30°附近高空气流堆积', '空气下沉', '副热带高压形成', '分流形成信风与西风']
  await expect(causal.getByRole('heading', { name: titles[0], exact: true })).toBeVisible()
  await causal.getByRole('button', { name: '播放', exact: true }).click()
  for (let index = 1; index < titles.length; index += 1) {
    await expect(causal.getByRole('heading', { name: titles[index], exact: true })).toBeVisible()
    await expect(causal.getByText(`第 ${index + 1} / 7 步`)).toBeVisible()
  }
  await causal.getByRole('button', { name: '暂停', exact: true }).click()
  await causal.getByRole('button', { name: '上一步' }).click()
  await expect(causal.getByRole('heading', { name: '副热带高压形成', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '查看 7 月' }).click()
  await page.getByRole('button', { name: '地中海地点追踪', exact: true }).click()
  const location = page.getByRole('region', { name: '地点追踪面板' })
  await expect(location.getByRole('heading', { name: '地中海地区' })).toBeVisible()
  await expect(location.locator('dd')).toHaveText(['副热带高压', '下沉', '干燥'])
  await expect(page.getByRole('slider', { name: '月份', exact: true })).toHaveValue('7')
  await page.getByRole('button', { name: '复位课堂' }).click()
  await expect(page.getByRole('slider', { name: '月份', exact: true })).toHaveValue('6')
  await expect(coriolis).toBeChecked()
  await expect(causal.getByText('第 1 / 7 步')).toBeVisible()
  await expect(page.locator('[aria-current="true"]')).toHaveCount(0)
  expect(errors).toEqual([])
})
