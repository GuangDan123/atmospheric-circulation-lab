import { describe, expect, it } from 'vitest'
import {
  getCoriolisEffect,
  nameWindFromMotion,
} from '../../src/domain/atmosphere/coriolisModel'

describe('getCoriolisEffect', () => {
  it('is zero at the equator', () => {
    expect(
      getCoriolisEffect({
        latitude: 0,
        rotationDirection: 1,
        rotationStrength: 1,
        frictionStrength: 0,
        enabled: true,
      }),
    ).toEqual({ direction: 'none', magnitude: 0 })
  })

  it.each([
    [30, 'right'],
    [-30, 'left'],
  ] as const)('uses hemisphere at latitude %s', (latitude, direction) => {
    expect(
      getCoriolisEffect({
        latitude,
        rotationDirection: 1,
        rotationStrength: 1,
        frictionStrength: 0,
        enabled: true,
      }).direction,
    ).toBe(direction)
  })

  it('reverses when rotation reverses', () => {
    expect(
      getCoriolisEffect({
        latitude: 30,
        rotationDirection: -1,
        rotationStrength: 1,
        frictionStrength: 0,
        enabled: true,
      }).direction,
    ).toBe('left')
  })

  it('is zero when disabled', () => {
    expect(
      getCoriolisEffect({
        latitude: 45,
        rotationDirection: 1,
        rotationStrength: 1,
        frictionStrength: 0,
        enabled: false,
      }),
    ).toEqual({ direction: 'none', magnitude: 0 })
  })

  it('friction weakens magnitude without changing direction', () => {
    const withoutFriction = getCoriolisEffect({
      latitude: 45,
      rotationDirection: 1,
      rotationStrength: 1,
      frictionStrength: 0,
      enabled: true,
    })
    const withFriction = getCoriolisEffect({
      latitude: 45,
      rotationDirection: 1,
      rotationStrength: 1,
      frictionStrength: 0.5,
      enabled: true,
    })

    expect(withFriction.direction).toBe(withoutFriction.direction)
    expect(withFriction.magnitude).toBeCloseTo(withoutFriction.magnitude * 0.5)
  })

  it('preserves magnitude symmetry across hemispheres', () => {
    for (let latitude = 5; latitude <= 90; latitude += 5) {
      const northern = getCoriolisEffect({
        latitude,
        rotationDirection: 1,
        rotationStrength: 1,
        frictionStrength: 0,
        enabled: true,
      })
      const southern = getCoriolisEffect({
        latitude: -latitude,
        rotationDirection: 1,
        rotationStrength: 1,
        frictionStrength: 0,
        enabled: true,
      })

      expect(northern.magnitude).toBeGreaterThanOrEqual(0)
      expect(northern.magnitude).toBeCloseTo(southern.magnitude)
    }
  })

  it.each([
    { latitude: 91, rotationStrength: 1, frictionStrength: 0 },
    { latitude: Number.NaN, rotationStrength: 1, frictionStrength: 0 },
    { latitude: 30, rotationStrength: 1.1, frictionStrength: 0 },
    { latitude: 30, rotationStrength: 1, frictionStrength: -0.1 },
  ])('rejects invalid numeric input %#', (values) => {
    expect(() =>
      getCoriolisEffect({
        ...values,
        rotationDirection: 1,
        enabled: true,
      }),
    ).toThrow(RangeError)
  })

  it('is zero when rotation strength is zero or friction is complete', () => {
    expect(
      getCoriolisEffect({
        latitude: 45,
        rotationDirection: 1,
        rotationStrength: 0,
        frictionStrength: 0,
        enabled: true,
      }),
    ).toEqual({ direction: 'none', magnitude: 0 })
    expect(
      getCoriolisEffect({
        latitude: 45,
        rotationDirection: 1,
        rotationStrength: 1,
        frictionStrength: 1,
        enabled: true,
      }),
    ).toEqual({ direction: 'none', magnitude: 0 })
  })

  it('rejects an invalid rotation direction at runtime', () => {
    expect(() =>
      getCoriolisEffect({
        latitude: 30,
        rotationDirection: 0 as 1,
        rotationStrength: 1,
        frictionStrength: 0,
        enabled: true,
      }),
    ).toThrow(RangeError)
  })

  it.each([
    [{ eastward: true, northward: false }, '西风'],
    [{ eastward: false, northward: false }, '东风'],
    [{ eastward: false, northward: true }, '东南风'],
    [{ eastward: true, northward: true }, '西南风'],
  ] as const)('names wind by where it comes from', (motion, name) => {
    expect(nameWindFromMotion(motion)).toBe(name)
  })
})
