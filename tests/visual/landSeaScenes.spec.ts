import { expect, test } from '@playwright/test'

type LandSeaScene = Readonly<{
  id: string
  month: string
  contrast: string
  anomalyIds: readonly string[]
}>

const scenes: readonly LandSeaScene[] = [
  {
    id: 'land-sea-disabled',
    month: '1',
    contrast: '0',
    anomalyIds: [],
  },
  {
    id: 'land-sea-january',
    month: '1',
    contrast: '1',
    anomalyIds: [
      'pressure-center:asia-high',
      'pressure-center:north-pacific-low',
      'pressure-center:north-atlantic-low',
    ],
  },
  {
    id: 'land-sea-low-contrast',
    month: '1',
    contrast: '0.5',
    anomalyIds: [
      'pressure-center:asia-high',
      'pressure-center:north-pacific-low',
      'pressure-center:north-atlantic-low',
    ],
  },
  {
    id: 'land-sea-july',
    month: '7',
    contrast: '1',
    anomalyIds: [
      'pressure-center:asia-low',
      'pressure-center:north-pacific-high',
      'pressure-center:north-atlantic-high',
    ],
  },
]

for (const scene of scenes) {
  test(`collects ${scene.id} for subject review`, async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'review-status',
      description: '待学科与视觉审校；仅采集，不代表基线正确',
    })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/')
    await expect(page.getByRole('slider', { name: '月份', exact: true })).toHaveValue(
      '6',
    )
    await page.getByRole('slider', { name: '月份', exact: true }).fill(scene.month)
    await page.getByRole('slider', { name: '海陆差异强度' }).fill(scene.contrast)

    for (const anomalyId of scene.anomalyIds) {
      await expect(page.locator(`[data-source-id="${anomalyId}"]`)).toHaveCount(2)
    }

    if (scene.anomalyIds.length === 0) {
      await expect(page.locator('[data-source-id^="pressure-center:"]')).toHaveCount(0)
    }

    await expect(page.getByRole('region', { name: '海陆差异控制面板' }).getByText(`${Number(scene.contrast) * 100}%`, { exact: true })).toBeVisible()
    await page.evaluate(async () => {
      await document.fonts.ready
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )
    })
    const path = testInfo.outputPath(`${scene.id}-pending-review.png`)
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
    await testInfo.attach(`${scene.id}-pending-review`, {
      path,
      contentType: 'image/png',
    })
    expect(errors).toEqual([])
  })
}
