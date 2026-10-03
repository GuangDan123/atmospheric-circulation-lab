import { describe, expect, it } from 'vitest'
import config from '../../playwright.config'
import viteConfig from '../../vite.config'

describe('Task12 browser test entry points', () => {
  it('discovers E2E, visual and performance suites without mixing offline tests', () => {
    expect(config.testDir).toBe('./tests')
    expect(config.testMatch).toEqual([
      'e2e/**/*.spec.ts',
      'visual/**/*.spec.ts',
      'performance/**/*.spec.ts',
    ])
    expect(config.testIgnore).toContain('**/offline.spec.ts')
  })

  it('disables unreviewed baseline updates and fixes desktop capture dimensions', () => {
    expect(config.updateSnapshots).toBe('none')
    expect(config.expect?.toHaveScreenshot?.maxDiffPixelRatio).toBe(0.01)
    expect(config.projects?.find((project) => project.name === 'chromium')?.use?.viewport)
      .toEqual({ width: 1920, height: 1080 })
    expect(config.use?.launchOptions?.args).toContain('--enable-webgl')
  })

  it('keeps browser performance tests out of Vitest', () => {
    expect(viteConfig.test?.exclude).toContain('tests/performance/**')
  })
})
