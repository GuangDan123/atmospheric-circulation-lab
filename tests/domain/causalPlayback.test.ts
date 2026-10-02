import { describe, expect, it } from 'vitest'
import {
  createPlaybackState,
  getActiveCausalStep,
  nextStep,
  previousStep,
  resetPlayback,
  setPlayback,
  setPlaybackSpeed,
} from '../../src/domain/causality/causalPlayback'
import { validateCausalScenario } from '../../src/domain/causality/causalGraph'
import { subtropicalHighScenario } from '../../src/scenarios/p0/subtropicalHigh'

const expectedTitles = [
  '赤道受热上升',
  '高空向两极运动',
  '地转偏向增强',
  '30°附近高空气流堆积',
  '空气下沉',
  '副热带高压形成',
  '分流形成信风与西风',
]

describe('subtropical high causal scenario', () => {
  it('defines the fixed seven-step causal order', () => {
    expect(subtropicalHighScenario.steps.map(({ title }) => title)).toEqual(
      expectedTitles,
    )
    expect(validateCausalScenario(subtropicalHighScenario)).toEqual([])
  })

  it('provides teaching data for every step', () => {
    for (const step of subtropicalHighScenario.steps) {
      expect(step.activeObjectIds.length).toBeGreaterThan(0)
      expect(step.explanation.length).toBeGreaterThan(0)
      expect(step.cameraPresetId.length).toBeGreaterThan(0)
      expect(typeof step.pauseAfter).toBe('boolean')
    }
  })

  it('derives the active step without storing highlights in playback state', () => {
    const state = nextStep(
      createPlaybackState(subtropicalHighScenario.id),
      subtropicalHighScenario,
    )

    expect(Object.keys(state).sort()).toEqual([
      'playback',
      'scenarioId',
      'speed',
      'stepIndex',
    ])
    expect(getActiveCausalStep(state, subtropicalHighScenario)).toBe(
      subtropicalHighScenario.steps[1],
    )
  })

  it('moves forward and backward within scenario boundaries', () => {
    const initial = createPlaybackState(subtropicalHighScenario.id)
    const afterFirst = nextStep(initial, subtropicalHighScenario)
    const afterLast = Array.from({ length: 10 }).reduce(
      (state) => nextStep(state, subtropicalHighScenario),
      initial,
    )

    expect(previousStep(initial).stepIndex).toBe(0)
    expect(afterFirst.stepIndex).toBe(1)
    expect(previousStep(afterFirst).stepIndex).toBe(0)
    expect(afterLast.stepIndex).toBe(6)
  })

  it('resets playback while preserving scenario and speed', () => {
    const state = setPlaybackSpeed(
      setPlayback(
        nextStep(
          createPlaybackState(subtropicalHighScenario.id),
          subtropicalHighScenario,
        ),
        'playing',
      ),
      1.5,
    )

    expect(resetPlayback(state)).toEqual({
      scenarioId: subtropicalHighScenario.id,
      stepIndex: 0,
      playback: 'paused',
      speed: 1.5,
    })
  })

  it('rejects invalid playback speed', () => {
    const state = createPlaybackState(subtropicalHighScenario.id)

    expect(() => setPlaybackSpeed(state, 0)).toThrow(RangeError)
    expect(() => setPlaybackSpeed(state, Number.NaN)).toThrow(RangeError)
  })

  it('never describes subtropical highs as surface-heating pressure systems', () => {
    const teachingText = subtropicalHighScenario.steps
      .flatMap(({ title, explanation, labels }) => [
        title,
        explanation,
        ...labels,
      ])
      .join('')

    expect(teachingText).not.toContain('副热带高压由地面受热形成')
    expect(teachingText).toContain('动力')
  })

  it('uses comparison content when coriolis is disabled', () => {
    const coriolisStep = subtropicalHighScenario.steps[2]

    expect(coriolisStep.whenCoriolisDisabled.title).toBe(
      '偏转关闭后的对照观察',
    )
    expect(coriolisStep.whenCoriolisDisabled.activeObjectIds).not.toContain(
      'pressure-belt:subtropical-north',
    )
    expect(coriolisStep.whenCoriolisDisabled.explanation).not.toContain(
      '副热带高压形成',
    )
  })
})
