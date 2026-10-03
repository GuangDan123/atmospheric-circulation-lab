import { describe, expect, it } from 'vitest'
import {
  createPerformanceProfile,
  getPerformanceProfile,
  type DeviceCapabilities,
} from '../../src/rendering/performance/profile'

const capableDevice: DeviceCapabilities = {
  hardwareConcurrency: 12,
  deviceMemory: 16,
  devicePixelRatio: 2,
  webgl2: true,
  prefersReducedPerformance: false,
}

describe('performance profile', () => {
  it('selects a low profile without removing teaching information', () => {
    const profile = createPerformanceProfile({
      hardwareConcurrency: 2,
      deviceMemory: 2,
      devicePixelRatio: 3,
      webgl2: false,
      prefersReducedPerformance: true,
    })

    expect(profile.tier).toBe('low')
    expect(profile.pixelRatio).toBeLessThanOrEqual(1)
    expect(profile.postprocessing).toBe(false)
    expect(profile.labelDensity).toBe('reduced')
    expect(profile.windRendering).toBe('streamlines')
    expect(profile.teachingLayers).toEqual({
      pressure: true,
      wind: true,
      verticalMotion: true,
      causalChain: true,
    })
  })

  it('selects high and standard tiers deterministically from capabilities', () => {
    expect(createPerformanceProfile(capableDevice).tier).toBe('high')
    expect(
      createPerformanceProfile({
        ...capableDevice,
        hardwareConcurrency: 6,
        deviceMemory: 8,
      }).tier,
    ).toBe('standard')
  })

  it('applies a manual tier without changing the detected capabilities', () => {
    const profile = getPerformanceProfile(capableDevice, 'low')

    expect(profile.tier).toBe('low')
    expect(profile.windRendering).toBe('streamlines')
    expect(profile.pixelRatio).toBe(1)
  })
})
