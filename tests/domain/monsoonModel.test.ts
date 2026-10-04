import { describe, expect, it } from 'vitest'
import { getMonsoon, type MonsoonInput } from '../../src/domain/atmosphere/monsoonModel'

const summer: MonsoonInput = { region: 'south-asia', month: 7, landSeaContrast: 1, seasonalShiftScale: 0.25, crossEquatorialEnabled: true, coriolisEnabled: true, rotationDirection: 1, rotationStrength: 1, terrainInfluence: false }

describe('monsoon composition', () => {
  it('orders the South Asian summer chain and outputs evidence', () => {
    const result = getMonsoon(summer)
    expect(result.direction).toBe('southwest')
    expect(result.relativeStrength).toBe(1)
    expect(result.activeMechanisms).toEqual(['southeast-trades', 'seasonal-shift', 'cross-equatorial', 'coriolis', 'land-sea'])
    expect(result.steps).toEqual(['东南信风', '越赤道', '北半球右偏', '印度次大陆热低压吸引', '西南季风'])
    expect(result.missingMechanisms).toEqual([])
    expect(result.evidence.join(' ')).toContain('参数化')
  })
  it.each(['landSeaContrast', 'seasonalShiftScale', 'rotationStrength'] as const)('does not form complete summer monsoon with %s zero', (key) => {
    const result = getMonsoon({ ...summer, [key]: 0 })
    expect(result.direction).toBe('incomplete')
    expect(result.relativeStrength).toBeLessThan(0.3)
    expect(result.missingMechanisms.length).toBeGreaterThan(0)
  })
  it.each([{ coriolisEnabled: false }, { crossEquatorialEnabled: false }, { rotationDirection: -1 as const }])('withholds the real-world southwest result for %s', (change) => {
    expect(getMonsoon({ ...summer, ...change }).direction).toBe('incomplete')
  })
  it('distinguishes East Asian summer and winter from South Asian winter', () => {
    expect(getMonsoon({ ...summer, region: 'east-asia' }).direction).toBe('southeast')
    expect(getMonsoon({ ...summer, region: 'east-asia', month: 1 }).direction).toBe('northwest')
    expect(getMonsoon({ ...summer, month: 1, crossEquatorialEnabled: false, seasonalShiftScale: 0 }).direction).toBe('northeast')
    const east = getMonsoon({ ...summer, region: 'east-asia', landSeaContrast: 0 })
    expect(east.relativeStrength).toBeLessThan(0.3)
    expect(east.missingMechanisms).toContain('land-sea')
  })
  it('does not claim a full monsoon in transition months and scales strength', () => {
    expect(getMonsoon({ ...summer, month: 4 }).direction).toBe('transition')
    expect(getMonsoon({ ...summer, month: 10 }).relativeStrength).toBe(0)
    expect(getMonsoon({ ...summer, landSeaContrast: 0.5 }).relativeStrength).toBeCloseTo(0.5)
    expect(getMonsoon({ ...summer, month: 6 }).relativeStrength).toBeLessThan(1)
  })
  it('rejects invalid inputs and unsupported terrain rather than silently enabling it', () => {
    for (const change of [{ month: 13 }, { month: NaN }, { landSeaContrast: -1 }, { seasonalShiftScale: Infinity }, { rotationStrength: 2 }, { rotationDirection: 0 }, { terrainInfluence: true }, { region: 'unknown' }]) {
      expect(() => getMonsoon({ ...summer, ...change } as MonsoonInput)).toThrow(RangeError)
    }
  })
})
