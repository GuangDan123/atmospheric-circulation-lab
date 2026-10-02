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
