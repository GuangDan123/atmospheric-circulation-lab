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
  it('switches from six cells to two single cells and back with Coriolis', () => {
    const enabled = deriveAtmosphere(createParameters())
    const disabled = deriveAtmosphere(createParameters({ coriolisEnabled: false }))

    expect(disabled.circulationCells).toHaveLength(2)
    expect(disabled.circulationCells.map((cell) => cell.name)).toEqual([
      'single',
      'single',
    ])
    expect(enabled.circulationCells).toHaveLength(6)
    expect(deriveAtmosphere(createParameters())).toEqual(enabled)
  })

  it.each([1, -1] as const)('matches disabled Coriolis at zero rotation in direction %s', (rotationDirection) => {
    const zero = deriveAtmosphere(createParameters({ rotationDirection, rotationStrength: 0 }))
    const disabled = deriveAtmosphere(createParameters({ rotationDirection, coriolisEnabled: false }))

    expect(zero.circulationCells).toEqual(disabled.circulationCells)
    expect(zero.windBelts).toEqual(disabled.windBelts)
    expect(zero.parameters.rotationStrength).toBe(0)
    expect(zero.parameters.coriolisEnabled).toBe(true)
  })

  it('does not share single-cell path points across snapshots', () => {
    const parameters = createParameters({ coriolisEnabled: false })
    const first = deriveAtmosphere(parameters)
    const expected = deriveAtmosphere(parameters)

    ;(first.circulationCells[0].path as Array<{ latitude: number }>)[0].latitude = 0

    expect(deriveAtmosphere(parameters)).toEqual(expected)
  })

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
