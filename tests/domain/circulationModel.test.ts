import { describe, expect, it } from 'vitest'
import {
  getCirculationCells,
  getVerticalMotions,
} from '../../src/domain/atmosphere/circulationModel'

describe('getCirculationCells', () => {
  it('returns Hadley, Ferrel, and Polar cells in both hemispheres', () => {
    const cells = getCirculationCells()

    expect(cells).toHaveLength(6)
    expect(
      cells.map(({ hemisphere, name }) => ({ hemisphere, name })),
    ).toEqual([
      { hemisphere: 'southern', name: 'polar' },
      { hemisphere: 'southern', name: 'ferrel' },
      { hemisphere: 'southern', name: 'hadley' },
      { hemisphere: 'northern', name: 'hadley' },
      { hemisphere: 'northern', name: 'ferrel' },
      { hemisphere: 'northern', name: 'polar' },
    ])
  })

  it('classifies direct and indirect circulation correctly', () => {
    const cells = getCirculationCells()

    for (const cell of cells) {
      expect(cell.formation).toBe(
        cell.name === 'ferrel' ? 'indirect' : 'thermal',
      )
    }
  })

  it('uses latitude and normalized altitude for every path point', () => {
    const cells = getCirculationCells()

    for (const cell of cells) {
      expect(cell.path.length).toBeGreaterThan(1)

      for (const point of cell.path) {
        expect(Object.keys(point).sort()).toEqual([
          'latitude',
          'normalizedAltitude',
        ])
        expect(point.latitude).toBeGreaterThanOrEqual(-90)
        expect(point.latitude).toBeLessThanOrEqual(90)
        expect(point.normalizedAltitude).toBeGreaterThanOrEqual(0)
        expect(point.normalizedAltitude).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe('getVerticalMotions', () => {
  it('rises at the equator and subpolar latitudes', () => {
    expect(getVerticalMotions()).toEqual(
      expect.arrayContaining([
        { latitude: -60, motion: 'rising' },
        { latitude: 0, motion: 'rising' },
        { latitude: 60, motion: 'rising' },
      ]),
    )
  })

  it('sinks at subtropical and polar latitudes', () => {
    expect(getVerticalMotions()).toEqual(
      expect.arrayContaining([
        { latitude: -90, motion: 'sinking' },
        { latitude: -30, motion: 'sinking' },
        { latitude: 30, motion: 'sinking' },
        { latitude: 90, motion: 'sinking' },
      ]),
    )
  })
})
