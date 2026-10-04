import { beforeEach, expect, it } from 'vitest'
import { selectAtmosphereSnapshot, useSimulationStore } from '../../src/state/simulationStore'
import { projectGlobe } from '../../src/features/globe/projectGlobe'
import { projectMap } from '../../src/features/map-projection/projectMap'
import { projectSection } from '../../src/features/meridional-section/projectSection'

beforeEach(() => useSimulationStore.getState().reset())

it('shares seasonal monsoon truth across projections and restores mechanisms with history', () => {
  const state = useSimulationStore.getState()
  state.setMonth(7)
  state.setLandSeaContrast(1)
  let snapshot = selectAtmosphereSnapshot(useSimulationStore.getState())
  expect(snapshot.monsoons.map(({ direction }) => direction)).toEqual(['southeast', 'southwest'])
  for (const view of [projectGlobe(snapshot, 0), projectMap(snapshot, 90), projectSection(snapshot)]) {
    expect(view.monsoons).toBe(snapshot.monsoons)
  }
  state.setCrossEquatorialEnabled(false)
  snapshot = selectAtmosphereSnapshot(useSimulationStore.getState())
  expect(snapshot.monsoons[1].missingMechanisms).toContain('cross-equatorial')
  state.undo()
  expect(selectAtmosphereSnapshot(useSimulationStore.getState()).monsoons[1].direction).toBe('southwest')
  state.redo()
  expect(selectAtmosphereSnapshot(useSimulationStore.getState()).monsoons[1].direction).toBe('incomplete')
  state.setSeasonalShiftScale(0)
  expect(selectAtmosphereSnapshot(useSimulationStore.getState()).monsoons[1].missingMechanisms).toContain('seasonal-shift')
  expect(() => state.setSeasonalShiftScale(NaN)).toThrow(RangeError)
  state.reset()
  expect(useSimulationStore.getState().crossEquatorialEnabled).toBe(true)
  expect(selectAtmosphereSnapshot(useSimulationStore.getState()).landSeaAnomalies).toEqual([])
})
