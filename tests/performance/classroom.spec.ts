import { expect, test } from '@playwright/test'
import { hasSustainedHeapGrowth, percentile } from './metrics'

test('samples classroom feedback, frame cadence, long tasks and retained heap', async ({ page, context }, testInfo) => {
  test.setTimeout(120_000)
  const tablet = testInfo.project.name === 'tablet'
  const realGPU = process.env.CLASSROOM_REAL_GPU === '1' && !process.env.CI
  const tier = tablet ? 'low' : 'standard'
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.getByRole('combobox', { name: '性能档位' }).selectOption(tier)
  await page.getByRole('button', { name: '三圈环流全景', exact: true }).click()
  await expect(page.locator('canvas')).toBeVisible()
  const session = await context.newCDPSession(page)
  await session.send('Performance.enable')
  await page.evaluate(() => {
    const data = { frames: [] as number[], feedback: [] as number[], longTasks: [] as number[], start: performance.now(), done: false }
    Object.assign(window, { classroomMeasurements: data })
    const observer = new PerformanceObserver((list) => {
      data.longTasks.push(...list.getEntries().map((entry) => entry.duration))
    })
    observer.observe({ type: 'longtask', buffered: false })
    let previous = performance.now()
    const frame = (now: number) => {
      data.frames.push(now - previous)
      previous = now
      if (now - data.start < 30_000) requestAnimationFrame(frame)
      else { data.done = true; observer.disconnect() }
    }
    requestAnimationFrame(frame)
    document.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.getAttribute('aria-label')?.startsWith('查看 ')) return
      const start = performance.now()
      const expected = target.getAttribute('aria-label') === '查看 7 月' ? '7' : '1'
      const changed = () => {
        const month = document.querySelector<HTMLInputElement>('input[aria-label="月份"]')
        if (month?.value === expected) {
          requestAnimationFrame(() => data.feedback.push(performance.now() - start))
          return true
        }
        return false
      }
      const mutation = new MutationObserver(() => { if (changed()) mutation.disconnect() })
      mutation.observe(document.querySelector('main')!, { subtree: true, attributes: true, childList: true, characterData: true })
      if (changed()) mutation.disconnect()
    }, { capture: true })
  })
  for (let index = 0; index < 40; index += 1) {
    const month = index % 2 === 0 ? 7 : 1
    await page.getByRole('button', { name: `查看 ${month} 月` }).click()
    await expect(page.getByRole('slider', { name: '月份', exact: true })).toHaveValue(String(month))
  }
  await page.waitForFunction(() => (window as unknown as { classroomMeasurements: { done: boolean } }).classroomMeasurements.done, undefined, { timeout: 40_000 })
  const measurements = await page.evaluate(() => (window as unknown as {
    classroomMeasurements: { frames: number[], feedback: number[], longTasks: number[] }
  }).classroomMeasurements)
  const heaps: number[] = []
  const heapSamplingCycles = 8
  for (let cycle = 0; cycle < heapSamplingCycles; cycle += 1) {
    for (const name of ['无地转偏向单圈环流', '7 月环流', '副热带高压', '三圈环流全景']) {
      await page.getByRole('button', { name, exact: true }).click()
    }
    await session.send('HeapProfiler.collectGarbage')
    const result = await session.send('Performance.getMetrics')
    heaps.push(result.metrics.find((metric) => metric.name === 'JSHeapUsedSize')!.value)
  }
  const heapBudgetBytes = 2 * 1024 * 1024
  const feedbackP95 = percentile(measurements.feedback, 0.95)
  const medianFPS = 1000 / percentile(measurements.frames.filter((interval) => interval > 0), 0.5)
  const report = {
    durationMs: 30_000, tier, viewport: page.viewportSize(), feedbackSamples: measurements.feedback.length,
    feedbackP95, medianFPS, longTasks: measurements.longTasks, heaps,
    heapSamplingCycles, heapBudgetBytes, heapGrowthDetected: hasSustainedHeapGrowth(heaps, { maxGrowthBytes: heapBudgetBytes }),
    fpsAcceptance: realGPU ? 'target-device-enforced' : 'not-accepted-software-rendering',
    fpsTarget: tablet ? 30 : 60, fpsMinimum: tablet ? 30 : 45,
    longTaskBudget: 'collect-only-no-approved-budget',
  }
  await testInfo.attach('classroom-performance', { body: JSON.stringify(report, null, 2), contentType: 'application/json' })
  testInfo.annotations.push({ type: 'fps-acceptance', description: report.fpsAcceptance })
  expect(measurements.feedback.length).toBe(40)
  expect(feedbackP95).toBeLessThan(100)
  expect(hasSustainedHeapGrowth(heaps, { maxGrowthBytes: heapBudgetBytes }), `retained heap exceeded ${heapBudgetBytes} bytes: ${heaps.join(', ')}`).toBe(false)
  if (realGPU) expect(medianFPS).toBeGreaterThanOrEqual(tablet ? 30 : 45)
  expect(errors).toEqual([])
})
