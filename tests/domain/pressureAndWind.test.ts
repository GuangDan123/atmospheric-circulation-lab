import { describe, expect, it } from 'vitest'
import { getPressureBelts } from '../../src/domain/atmosphere/pressureBeltModel'
import { getWindBelts } from '../../src/domain/atmosphere/windBeltModel'

describe('getPressureBelts', () => {
  it('classifies thermal and dynamic pressure belts', () => {
    const belts = getPressureBelts({
      month: 3,
      seasonalShiftScale: 0.25,
    })

    expect(
      belts.map(({ kind, formation }) => ({ kind, formation })),
    ).toEqual([
      { kind: 'polar-high', formation: 'thermal' },
      { kind: 'subpolar-low', formation: 'dynamic' },
      { kind: 'subtropical-high', formation: 'dynamic' },
      { kind: 'equatorial-low', formation: 'thermal' },
      { kind: 'subtropical-high', formation: 'dynamic' },
      { kind: 'subpolar-low', formation: 'dynamic' },
      { kind: 'polar-high', formation: 'thermal' },
    ])
  })

  it('moves north in June and south in December by less than solar declination', () => {
    const march = getPressureBelts({
      month: 3,
      seasonalShiftScale: 0.25,
    })
    const june = getPressureBelts({
      month: 6,
      seasonalShiftScale: 0.25,
    })
    const december = getPressureBelts({
      month: 12,
      seasonalShiftScale: 0.25,
    })
    const marchEquator = march.find(
      ({ kind }) => kind === 'equatorial-low',
    )
    const juneEquator = june.find(
      ({ kind }) => kind === 'equatorial-low',
    )
    const decemberEquator = december.find(
      ({ kind }) => kind === 'equatorial-low',
    )

    expect(marchEquator?.centerLatitude).toBeCloseTo(0)
    expect(juneEquator?.centerLatitude).toBeGreaterThan(0)
    expect(juneEquator?.centerLatitude).toBeLessThan(23.44)
    expect(decemberEquator?.centerLatitude).toBeLessThan(0)
    expect(decemberEquator?.centerLatitude).toBeGreaterThan(-23.44)
  })

  it.each([1, 3, 6, 9, 12])(
    'keeps belts ordered and non-overlapping in month %s',
    (month) => {
      const belts = getPressureBelts({
        month,
        seasonalShiftScale: 0.25,
      })

      for (let index = 1; index < belts.length; index += 1) {
        expect(belts[index].southLatitude).toBeGreaterThanOrEqual(
          belts[index - 1].northLatitude,
        )
      }
    },
  )

  it.each([
    { month: 0, seasonalShiftScale: 0.25 },
    { month: 6, seasonalShiftScale: -0.1 },
    { month: 6, seasonalShiftScale: 1.1 },
  ])('rejects invalid input %#', (input) => {
    expect(() => getPressureBelts(input)).toThrow(RangeError)
  })
})

describe('getWindBelts', () => {
  it('derives six surface wind belts from adjacent pressure belts', () => {
    const pressureBelts = getPressureBelts({
      month: 3,
      seasonalShiftScale: 0.25,
    })
    const winds = getWindBelts({
      pressureBelts,
      coriolisEnabled: true,
      rotationDirection: 1,
      rotationStrength: 1,
      frictionStrength: 0,
    })

    expect(winds.map(({ name }) => name)).toEqual([
      '东南极地东风',
      '西北盛行西风',
      '东南信风',
      '东北信风',
      '西南盛行西风',
      '东北极地东风',
    ])
    expect(winds).toHaveLength(pressureBelts.length - 1)
  })

  it('uses the current adjacent belt boundaries', () => {
    const pressureBelts = getPressureBelts({
      month: 6,
      seasonalShiftScale: 0.25,
    })
    const winds = getWindBelts({
      pressureBelts,
      coriolisEnabled: true,
      rotationDirection: 1,
      rotationStrength: 1,
      frictionStrength: 0,
    })

    for (let index = 0; index < winds.length; index += 1) {
      expect(winds[index].southLatitude).toBe(
        pressureBelts[index].centerLatitude,
      )
      expect(winds[index].northLatitude).toBe(
        pressureBelts[index + 1].centerLatitude,
      )
    }
  })
})
