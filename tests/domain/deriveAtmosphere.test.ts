import { describe, expect, it } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type {
  Month,
  SimulationParameters,
} from '../../src/domain/atmosphere/types'

function createParameters(
  overrides: Partial<SimulationParameters> = {},
): SimulationParameters {
  return {
    month: 6 as Month,
    coriolisEnabled: true,
    rotationDirection: 1,
    rotationStrength: 1,
    frictionStrength: 0,
    seasonalShiftScale: 0.25,
    ...overrides,
  }
}

describe('deriveAtmosphere', () => {
  it('derives one complete atmosphere snapshot', () => {
    const parameters = createParameters()
    const snapshot = deriveAtmosphere(parameters)

    expect(snapshot.parameters).toEqual(parameters)
    expect(snapshot.solarDeclination).toBeGreaterThan(22)
    expect(snapshot.circulationCells).toHaveLength(6)
    expect(snapshot.pressureBelts).toHaveLength(7)
    expect(snapshot.windBelts).toHaveLength(6)
    expect(snapshot.verticalMotions).toHaveLength(7)
  })

  it('returns deeply equal snapshots for equal inputs', () => {
    expect(deriveAtmosphere(createParameters())).toEqual(
      deriveAtmosphere(createParameters()),
    )
  })

  it('does not expose internal arrays across calls', () => {
    const first = deriveAtmosphere(createParameters())
    const originalFirstPressureLatitude =
      first.pressureBelts[0].centerLatitude

    ;(first.pressureBelts as unknown as Array<{ centerLatitude: number }>)[0]
      .centerLatitude = 0

    const second = deriveAtmosphere(createParameters())

    expect(second.pressureBelts[0].centerLatitude).toBe(
      originalFirstPressureLatitude,
    )
    expect(second.pressureBelts).not.toBe(first.pressureBelts)
    expect(second.circulationCells).not.toBe(first.circulationCells)
    expect(second.windBelts).not.toBe(first.windBelts)
    expect(second.verticalMotions).not.toBe(first.verticalMotions)
  })
})
