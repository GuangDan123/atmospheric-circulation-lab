import { describe, expect, it } from 'vitest'
import { mediterraneanLocation } from '../../src/data/locations'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import { getLocationControl } from '../../src/domain/atmosphere/locationControlModel'
import type { Month } from '../../src/domain/atmosphere/types'

function createSnapshot(month: number) {
  return deriveAtmosphere({
    month: month as Month,
    coriolisEnabled: true,
    rotationDirection: 1,
    rotationStrength: 1,
    frictionStrength: 0,
    seasonalShiftScale: 0.25,
  })
}

describe('getLocationControl', () => {
  it('identifies subtropical sinking and dry conditions over the Mediterranean in July', () => {
    const control = getLocationControl(
      mediterraneanLocation,
      createSnapshot(7),
    )

    expect(control.primaryControlId).toBe(
      'pressure-belt:subtropical-north',
    )
    expect(control.verticalMotion).toBe('sinking')
    expect(control.moistureTendency).toBe('dry')
    expect(control.controls).toContainEqual(
      expect.objectContaining({
        sourceId: 'pressure-belt:subtropical-north',
        sourceType: 'pressure-belt',
      }),
    )
    expect(control.evidence).toEqual(
      expect.arrayContaining([
        expect.stringContaining('副热带高压'),
        expect.stringContaining('下沉'),
      ]),
    )
  })

  it('identifies westerly influence and wet conditions over the Mediterranean in January', () => {
    const control = getLocationControl(
      mediterraneanLocation,
      createSnapshot(1),
    )

    expect(control.primaryControlId).toBe(
      'wind-belt:westerly-north',
    )
    expect(control.verticalMotion).toBe('none')
    expect(control.moistureTendency).toBe('wet')
    expect(control.controls).toContainEqual(
      expect.objectContaining({
        sourceId: 'wind-belt:westerly-north',
        sourceType: 'wind-belt',
      }),
    )
    expect(control.evidence).toEqual(
      expect.arrayContaining([
        expect.stringContaining('盛行西风'),
        expect.stringContaining('湿润'),
      ]),
    )
  })

  it('returns normalized dual controls near a seasonal transition boundary', () => {
    const location = {
      id: 'location:transition-test',
      name: '过渡带测试点',
      latitude: 40,
      longitude: 0,
    } as const
    const control = getLocationControl(location, createSnapshot(4))

    expect(control.controls).toHaveLength(2)
    expect(
      control.controls.reduce((sum, item) => sum + item.weight, 0),
    ).toBeCloseTo(1)
    expect(control.controls.every((item) => item.weight > 0)).toBe(true)
  })
})
