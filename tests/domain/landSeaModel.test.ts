import { describe, expect, it } from 'vitest'
import { getLandSeaAnomalies, sampleLandSeaAnomaly, type LandSeaContrast } from '../../src/domain/atmosphere/landSeaModel'

function getAnomalies(month: number, contrast: number) {
  return getLandSeaAnomalies({ month, landSeaContrast: contrast as LandSeaContrast })
}

describe('getLandSeaAnomalies', () => {
  it('returns no anomaly when land-sea contrast is zero', () => {
    for (let month = 1; month <= 12; month += 1) expect(getAnomalies(month, 0)).toEqual([])
  })

  it('rejects invalid months and contrast', () => {
    for (const month of [0, 13, 1.5, NaN]) expect(() => getAnomalies(month, 0.5)).toThrow(RangeError)
    for (const contrast of [-0.1, 1.1, NaN, Infinity]) expect(() => getAnomalies(1, contrast)).toThrow(RangeError)
  })

  it.each([
    [1, ['pressure-center:asia-high', 'pressure-center:north-pacific-low', 'pressure-center:north-atlantic-low']],
    [7, ['pressure-center:asia-low', 'pressure-center:north-pacific-high', 'pressure-center:north-atlantic-high']],
  ])('retains the winter and summer center identities for month %s', (month, ids) => {
    expect(getAnomalies(month as number, 1).map(({ id }) => id)).toEqual(ids)
    expect(getAnomalies(month as number, 1).every(({ anomalyStrength }) => anomalyStrength === 1)).toBe(true)
  })

  it('smooths the autumn hard boundary and retains a delayed ocean response in April', () => {
    const september = getAnomalies(9, 1)
    expect(september.find(({ id }) => id === 'pressure-center:asia-low')?.anomalyStrength).toBeCloseTo(0.5)
    const april = getAnomalies(4, 1)
    expect(april.some(({ id }) => id.includes('asia'))).toBe(false)
    expect(april.find(({ id }) => id === 'pressure-center:north-pacific-low')?.anomalyStrength).toBeGreaterThan(0)
    expect(april[0].evidence.join(' ')).toContain('滞后')
  })

  it('scales continuously and is periodic across December and January', () => {
    for (let month = 1; month <= 12; month += 1) {
      const full = getAnomalies(month, 1)
      const half = getAnomalies(month, 0.5)
      full.forEach((anomaly, index) => expect(half[index].anomalyStrength).toBeCloseTo(anomaly.anomalyStrength / 2))
      expect(full.every(({ anomalyStrength }) => anomalyStrength > 0 && anomalyStrength <= 1)).toBe(true)
    }
    expect(getAnomalies(12, 1)[0].anomalyStrength).toBeCloseTo(getAnomalies(2, 1)[0].anomalyStrength)
  })

  it('uses a signed smooth spatial kernel with longitude wrapping and stronger northern disruption', () => {
    const anomalies = getAnomalies(1, 1)
    const high = [anomalies[0]]
    expect(sampleLandSeaAnomaly(high, 45, 90)).toBe(1)
    expect(sampleLandSeaAnomaly(high, 45, 100)).toBeLessThan(1)
    expect(sampleLandSeaAnomaly(high, 45, 110)).toBeLessThan(sampleLandSeaAnomaly(high, 45, 100))
    expect(sampleLandSeaAnomaly(high, -45, 90)).toBeLessThan(0.01)
    expect(sampleLandSeaAnomaly([anomalies[1]], 45, -165)).toBe(-1)
    expect(sampleLandSeaAnomaly(anomalies, 45, -180)).toBeCloseTo(sampleLandSeaAnomaly(anomalies, 45, 180))
    expect(sampleLandSeaAnomaly([], 0, 0)).toBe(0)
    expect(() => sampleLandSeaAnomaly(high, 91, 0)).toThrow(RangeError)
    expect(() => sampleLandSeaAnomaly(high, 0, NaN)).toThrow(RangeError)
  })
})
