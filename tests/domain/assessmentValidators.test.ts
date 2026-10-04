import { describe, expect, it } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month } from '../../src/domain/atmosphere/types'
import { validateAnswer, windTask } from '../../src/domain/assessment/validators'

const snapshot = deriveAtmosphere({ month: 7 as Month, coriolisEnabled: true, rotationDirection: 1, rotationStrength: 1, frictionStrength: 0, seasonalShiftScale: 0.25, landSeaContrast: 1 })
const answer = { gradient: 'high-to-low', deflection: 'right', destination: 'southwest', source: 'northeast', formation: 'dynamic', month: 7, landSea: true } as const

describe('student diagnosis', () => {
  it('accepts independently specified northern trade wind evidence', () => {
    const result = validateAnswer(windTask, snapshot, answer)
    expect(result.correct).toBe(true)
    expect(result.diagnosisCode).toBe('correct')
    expect(result.evidenceObjectIds).toContain('wind-belt:trade-north')
  })
  it.each([
    [{ gradient: 'low-to-high' }, 'pressure-gradient'],
    [{ deflection: 'left' }, 'hemisphere-deflection'],
    [{ destination: 'northeast', source: 'southwest' }, 'wind-source'],
    [{ formation: 'thermal' }, 'formation'],
    [{ month: 1 }, 'month'],
    [{ landSea: false }, 'land-sea'],
  ])('locates a stable error for %j', (change, code) => {
    expect(validateAnswer(windTask, snapshot, { ...answer, ...change }).diagnosisCode).toBe(code)
  })
  it('rejects incomplete and out of range answers', () => {
    for (const invalid of [null, {}, { ...answer, month: NaN }, { ...answer, source: 'invalid' }]) {
      expect(validateAnswer(windTask, snapshot, invalid).diagnosisCode).toBe('invalid-answer')
    }
  })
  it('uses reversed rotation, disabled coriolis and southern hemisphere snapshots', () => {
    const reverse = deriveAtmosphere({ ...snapshot.parameters, rotationDirection: -1 })
    expect(validateAnswer(windTask, reverse, { ...answer, deflection: 'left', destination: 'southeast', source: 'northwest' }).correct).toBe(true)
    const disabled = deriveAtmosphere({ ...snapshot.parameters, coriolisEnabled: false })
    expect(validateAnswer(windTask, disabled, { ...answer, deflection: 'none', destination: 'south', source: 'north' }).correct).toBe(true)
    expect(validateAnswer({ ...windTask, hemisphere: 'southern' }, snapshot, { ...answer, deflection: 'left', destination: 'northwest', source: 'southeast' }).correct).toBe(true)
  })
})
