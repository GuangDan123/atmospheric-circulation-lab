import { describe, expect, it } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month, SimulationParameters } from '../../src/domain/atmosphere/types'

function createParameters(
  overrides: Partial<SimulationParameters> = {},
): SimulationParameters {
  return {
    month: 1 as Month,
    coriolisEnabled: true,
    rotationDirection: 1,
    rotationStrength: 1,
    frictionStrength: 0,
    seasonalShiftScale: 0.25,
    landSeaContrast: 1,
    ...overrides,
  }
}

describe('deriveAtmosphere land-sea projection', () => {
  it('includes seasonal land-sea anomalies in the shared snapshot', () => {
    const snapshot = deriveAtmosphere(createParameters())

    expect(snapshot.landSeaAnomalies).toHaveLength(3)
    expect(snapshot.landSeaAnomalies[0]).toMatchObject({
      id: 'pressure-center:asia-high',
      kind: 'high',
    })
  })

  it('keeps the P0 snapshot unchanged when land-sea contrast is disabled', () => {
    const snapshot = deriveAtmosphere(createParameters({ landSeaContrast: 0 }))

    expect(snapshot.landSeaAnomalies).toEqual([])
    expect(snapshot.pressureBelts).toHaveLength(7)
    expect(snapshot.windBelts).toHaveLength(6)
  })
})
