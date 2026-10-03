import { expect, test } from '@playwright/test'

const scenes = [
  { id: 'single-cell', keyframe: '无地转偏向单圈环流', month: '6', coriolis: false },
  { id: 'three-cells', keyframe: '三圈环流全景', month: '6', coriolis: true },
  { id: 'january', keyframe: '1 月环流', month: '1', coriolis: true },
  { id: 'july', keyframe: '7 月环流', month: '7', coriolis: true },
  { id: 'subtropical-step-5', keyframe: '副热带高压', month: '6', coriolis: true },
  { id: 'exploded', keyframe: '三圈环流全景', month: '6', coriolis: true },
  { id: 'low-tier', keyframe: '三圈环流全景', month: '6', coriolis: true },
] as const

for (const scene of scenes) {
  test(`collects ${scene.id} for subject review, not an approved baseline`, async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'review-status', description: '待学科与视觉审校；仅采集，不代表基线正确' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.getByRole('combobox', { name: '性能档位' }).selectOption('standard')
    await page.getByRole('button', { name: scene.keyframe, exact: true }).click()
    if (scene.id === 'subtropical-step-5') {
      await page.getByRole('region', { name: '因果链面板' }).getByRole('button', { name: '上一步' }).click()
      await expect(page.getByRole('heading', { name: '空气下沉', exact: true })).toBeVisible()
      await expect(page.getByText('第 5 / 7 步')).toBeVisible()
    }
    if (scene.id === 'exploded') {
      await page.getByRole('slider', { name: '爆炸视图' }).fill('1')
      await expect(page.getByRole('slider', { name: '爆炸视图' })).toHaveValue('1')
    }
    if (scene.id === 'low-tier') {
      await page.getByRole('combobox', { name: '性能档位' }).selectOption('low')
      await expect(page.getByRole('combobox', { name: '标签密度' })).toHaveValue('reduced')
    }
    await expect(page.getByRole('slider', { name: '月份', exact: true })).toHaveValue(scene.month)
    await expect(page.getByRole('checkbox', { name: '开启地转偏向' })).toBeChecked({ checked: scene.coriolis })
    const globe = page.getByRole('region', { name: '三维全球大气环流球面视图' })
    await expect(globe.locator('canvas')).toBeVisible()
    await expect(globe.locator('[data-source-id="label:pressure-belt:equatorial-low"]')).toBeVisible()
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    })
    const path = testInfo.outputPath(`${scene.id}-pending-review.png`)
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
    await testInfo.attach(`${scene.id}-pending-review`, { path, contentType: 'image/png' })
    await testInfo.attach('review-status', {
      body: JSON.stringify({ scene: scene.id, project: testInfo.project.name, status: 'pending-subject-review', approvedBaseline: false }),
      contentType: 'application/json',
    })
    expect(errors).toEqual([])
  })
}
