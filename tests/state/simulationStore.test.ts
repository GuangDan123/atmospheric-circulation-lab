import { beforeEach, describe, expect, it } from 'vitest'
import {
  initialSimulationState,
  selectAtmosphereSnapshot,
  selectViewProjection,
  useSimulationStore,
} from '../../src/state/simulationStore'

describe('simulation store', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
  })

  it('updates the month and derives a matching solar declination', () => {
    const firstSnapshot = selectAtmosphereSnapshot(
      useSimulationStore.getState(),
    )

    useSimulationStore.getState().setMonth(12)
    const secondSnapshot = selectAtmosphereSnapshot(
      useSimulationStore.getState(),
    )

    expect(secondSnapshot).not.toBe(firstSnapshot)
    expect(secondSnapshot.parameters.month).toBe(12)
    expect(secondSnapshot.solarDeclination).toBeLessThan(-22)
  })

  it('keeps the scientific snapshot stable for view-only changes', () => {
    const firstSnapshot = selectAtmosphereSnapshot(
      useSimulationStore.getState(),
    )

    useSimulationStore.getState().setVisibleLayer('wind', false)
    useSimulationStore.getState().setExplodedViewProgress(0.75)

    const secondSnapshot = selectAtmosphereSnapshot(
      useSimulationStore.getState(),
    )

    expect(secondSnapshot).toBe(firstSnapshot)
  })

  it('changes performance tier without resetting classroom state', () => {
    useSimulationStore.getState().setMonth(7)
    useSimulationStore
      .getState()
      .selectPressureBelt('pressure-belt:subtropical-north')
    useSimulationStore.getState().setTeachingStep(4)
    const firstSnapshot = selectAtmosphereSnapshot(
      useSimulationStore.getState(),
    )

    useSimulationStore.getState().setPerformanceTier('low')

    const state = useSimulationStore.getState()
    expect(state.performanceTier).toBe('low')
    expect(state.month).toBe(7)
    expect(state.selectedPressureBeltId).toBe(
      'pressure-belt:subtropical-north',
    )
    expect(state.teachingStep).toBe(4)
    expect(selectAtmosphereSnapshot(state)).toBe(firstSnapshot)
  })

  it('shares causal playback state without adding it to teaching history', () => {
    useSimulationStore.getState().setMonth(7)
    useSimulationStore.getState().setPlayback('playing')
    useSimulationStore.getState().setPlaybackSpeed(2)
    useSimulationStore.getState().nextTeachingStep()

    let state = useSimulationStore.getState()
    expect(state.playback).toBe('paused')
    expect(state.playbackSpeed).toBe(2)
    expect(state.teachingStep).toBe(1)

    state.setPlayback('playing')
    state.undo()
    state = useSimulationStore.getState()
    expect(state.month).toBe(7)
    expect(state.teachingStep).toBe(0)
    expect(state.playback).toBe('playing')
    expect(state.playbackSpeed).toBe(2)

    state.undo()
    expect(useSimulationStore.getState().month).toBe(
      initialSimulationState.month,
    )
  })

  it('projects every view from the same snapshot reference', () => {
    const state = useSimulationStore.getState()
    const snapshot = selectAtmosphereSnapshot(state)
    const projection = selectViewProjection(state)

    expect(projection.snapshot).toBe(snapshot)
    expect(projection.selectedPressureBeltId).toBeNull()
    expect(projection.explodedViewProgress).toBe(0)
  })

  it('records scientific and teaching changes for undo and redo', () => {
    useSimulationStore.getState().setMonth(7)
    useSimulationStore.getState().setCoriolisEnabled(false)
    useSimulationStore.getState().selectPressureBelt(
      'pressure-belt:subtropical-north',
    )

    useSimulationStore.getState().undo()
    expect(useSimulationStore.getState().selectedPressureBeltId).toBeNull()

    useSimulationStore.getState().undo()
    expect(useSimulationStore.getState().coriolisEnabled).toBe(true)

    useSimulationStore.getState().redo()
    expect(useSimulationStore.getState().coriolisEnabled).toBe(false)
  })

  it('does not record view-only changes in teaching history', () => {
    useSimulationStore.getState().setMonth(7)
    useSimulationStore.getState().setExplodedViewProgress(0.5)
    useSimulationStore.getState().setVisibleLayer('labels', false)

    useSimulationStore.getState().undo()

    expect(useSimulationStore.getState().month).toBe(
      initialSimulationState.month,
    )
  })

  it('keeps the latest classroom changes available for undo and redo', () => {
    for (let change = 1; change <= 25; change += 1) {
      useSimulationStore.getState().setTeachingStep(change)
    }

    const state = useSimulationStore.getState()
    expect(state.history.past.at(-1)?.teachingStep).toBe(24)
    expect(state.history.past.length).toBeLessThanOrEqual(20)

    state.undo()
    expect(useSimulationStore.getState().teachingStep).toBe(24)
    state.redo()
    expect(useSimulationStore.getState().teachingStep).toBe(25)
  })

  it('restores the initial preset on reset', () => {
    useSimulationStore.getState().setMonth(1)
    useSimulationStore.getState().setFrictionStrength(0.6)
    useSimulationStore.getState().setVisibleLayer('pressure', false)

    useSimulationStore.getState().reset()

    const state = useSimulationStore.getState()
    expect(state.month).toBe(initialSimulationState.month)
    expect(state.frictionStrength).toBe(
      initialSimulationState.frictionStrength,
    )
    expect(state.visibleLayers).toEqual(
      initialSimulationState.visibleLayers,
    )
  })

  it('rejects invalid action inputs', () => {
    expect(() => useSimulationStore.getState().setMonth(0)).toThrow(
      RangeError,
    )
    expect(() =>
      useSimulationStore.getState().setFrictionStrength(1.1),
    ).toThrow(RangeError)
    expect(() =>
      useSimulationStore.getState().setExplodedViewProgress(-0.1),
    ).toThrow(RangeError)
  })
})
