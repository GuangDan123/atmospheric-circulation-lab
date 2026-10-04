import { describe, expect, it } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month } from '../../src/domain/atmosphere/types'
import { climateLocations } from '../../src/data/climateLocations'
import { getClimateControl } from '../../src/domain/climate/climateControlModel'

function snapshot(month: number) {
  return deriveAtmosphere({ month: month as Month, coriolisEnabled: true, rotationDirection: 1, rotationStrength: 1, frictionStrength: 0, seasonalShiftScale: 0.25 })
}

describe('climate evidence chain', () => {
  it.each([
    [0, 7, 'dry', 'pressure-belt:subtropical-north'],
    [0, 1, 'wet', 'wind-belt:westerly-north'],
    [1, 7, 'wet', 'pressure-belt:equatorial-low'],
    [1, 1, 'dry', 'wind-belt:trade-north'],
  ])('ties location %s and month %s to current controls', (index, month, moisture, evidence) => {
    const result = getClimateControl(climateLocations[index], snapshot(month))
    expect(result.month).toBe(month)
    expect(result.moistureTendency).toBe(moisture)
    expect(result.evidenceObjectIds).toContain(evidence)
    expect(result.otherFactors).toContain('地形')
    expect(result.monthlyControls).toHaveLength(12)
    expect(result.monthlyControls[month - 1].moistureTendency).toBe(moisture)
  })
  it('responds to seasonal shift being disabled rather than hardcoding calendar answers', () => {
    const current = snapshot(7)
    const result = getClimateControl(climateLocations[0], deriveAtmosphere({ ...current.parameters, seasonalShiftScale: 0 }))
    expect(result.evidenceObjectIds).not.toEqual(getClimateControl(climateLocations[0], current).evidenceObjectIds)
  })
})
