import { describe, expect, it } from 'vitest'
import { getSolarDeclination } from '../../src/domain/atmosphere/solarModel'

describe('getSolarDeclination', () => {
  it.each([0, 13, 1.5, Number.NaN])('rejects invalid month %s', (month) => {
    expect(() => getSolarDeclination(month)).toThrow(RangeError)
  })

  it('places March and September near the equator', () => {
    expect(Math.abs(getSolarDeclination(3))).toBeLessThan(3)
    expect(Math.abs(getSolarDeclination(9))).toBeLessThan(3)
  })

  it('places June north and December south', () => {
    expect(getSolarDeclination(6)).toBeGreaterThan(22)
    expect(getSolarDeclination(12)).toBeLessThan(-22)
  })
})
