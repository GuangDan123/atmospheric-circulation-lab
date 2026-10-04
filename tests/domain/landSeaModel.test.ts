import { describe, expect, it } from 'vitest'
import {
  getLandSeaAnomalies,
  type LandSeaContrast,
} from '../../src/domain/atmosphere/landSeaModel'

function getAnomalies(month: number, contrast: number) {
  return getLandSeaAnomalies({
    month,
    landSeaContrast: contrast as LandSeaContrast,
  })
}

describe('getLandSeaAnomalies', () => {
  it('returns no anomaly when land-sea contrast is zero', () => {
    expect(getAnomalies(1, 0)).toEqual([])
  })

  it('rejects months outside the teaching calendar and contrast outside 0..1', () => {
    expect(() => getAnomalies(0, 0.5)).toThrow(RangeError)
    expect(() => getAnomalies(13, 0.5)).toThrow(RangeError)
    expect(() => getAnomalies(1, -0.1)).toThrow(RangeError)
    expect(() => getAnomalies(1, 1.1)).toThrow(RangeError)
  })

  it('models January continental high and northern oceanic lows', () => {
    const anomalies = getAnomalies(1, 1)

    expect(anomalies.map(({ id }) => id)).toEqual([
      'pressure-center:asia-high',
      'pressure-center:north-pacific-low',
      'pressure-center:north-atlantic-low',
    ])
    expect(anomalies[0]).toMatchObject({
      kind: 'high',
      latitude: 45,
      longitude: 90,
      anomalyStrength: 1,
    })
    expect(anomalies[1]).toMatchObject({ kind: 'low', latitude: 45 })
    expect(anomalies[2]).toMatchObject({ kind: 'low', latitude: 45 })
  })

  it('models July continental low and northern oceanic highs', () => {
    const anomalies = getAnomalies(7, 1)

    expect(anomalies.map(({ id }) => id)).toEqual([
      'pressure-center:asia-low',
      'pressure-center:north-pacific-high',
      'pressure-center:north-atlantic-high',
    ])
    expect(anomalies[0]).toMatchObject({
      kind: 'low',
      latitude: 30,
      longitude: 90,
      anomalyStrength: 1,
    })
    expect(anomalies[1]).toMatchObject({ kind: 'high', latitude: 30 })
    expect(anomalies[2]).toMatchObject({ kind: 'high', latitude: 30 })
  })

  it('scales anomaly strength linearly and preserves southern-hemisphere continuity', () => {
    const anomalies = getAnomalies(1, 0.5)

    expect(anomalies.every(({ anomalyStrength }) => anomalyStrength === 0.5)).toBe(
      true,
    )
    expect(anomalies.every(({ latitude }) => latitude > 0)).toBe(true)
  })
})
