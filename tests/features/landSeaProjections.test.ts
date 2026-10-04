import { describe, expect, it } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import { projectGlobe } from '../../src/features/globe/projectGlobe'
import { projectMap } from '../../src/features/map-projection/projectMap'
import { projectSection } from '../../src/features/meridional-section/projectSection'

function createSnapshot() {
  return deriveAtmosphere({
    month: 1,
    coriolisEnabled: true,
    rotationDirection: 1,
    rotationStrength: 1,
    frictionStrength: 0,
    seasonalShiftScale: 0.25,
    landSeaContrast: 1,
  })
}

describe('land-sea anomaly projections', () => {
  it('projects anomalies onto the globe without replacing pressure-belt ids', () => {
    const projection = projectGlobe(createSnapshot(), 0)

    expect(projection.landSeaAnomalies).toHaveLength(3)
    expect(projection.landSeaAnomalies[0]).toMatchObject({
      sourceId: 'pressure-center:asia-high',
      kind: 'high',
      coordinates: expect.objectContaining({ x: expect.any(Number), y: expect.any(Number), z: expect.any(Number) }),
    })
    expect(projection.pressureBelts[0].sourceId).toBe('pressure-belt:polar-south')
  })

  it('projects anomaly longitudes relative to the map central meridian', () => {
    const projection = projectMap(createSnapshot(), 0)

    expect(projection.landSeaAnomalies).toHaveLength(3)
    expect(projection.landSeaAnomalies[0]).toMatchObject({
      sourceId: 'pressure-center:asia-high',
      coordinates: { x: expect.any(Number), y: expect.any(Number) },
    })
    expect(projection.landSeaAnomalies[0].coordinates.x).toBeGreaterThan(0)
    expect(projection.landSeaAnomalies[0].coordinates.x).toBeLessThan(800)
  })

  it('keeps anomaly identity available in the meridional section', () => {
    const projection = projectSection(createSnapshot())

    expect(projection.landSeaAnomalies).toHaveLength(3)
    expect(projection.landSeaAnomalies[0]).toMatchObject({
      sourceId: 'pressure-center:asia-high',
      latitude: 45,
    })
  })
})

it('projects the same sampled smooth field and evidence in all three views', () => {
  const snapshot = createSnapshot()
  const views = [projectGlobe(snapshot, 0), projectMap(snapshot, 0), projectSection(snapshot)]
  for (const view of views) {
    expect(view.landSeaField.length).toBeGreaterThan(100)
    expect(view.landSeaField.map(({ value }) => value)).toEqual(views[0].landSeaField.map(({ value }) => value))
    expect(view.landSeaAnomalies[0].evidence).toEqual(snapshot.landSeaAnomalies[0].evidence)
  }
  const ideal = { ...snapshot, landSeaAnomalies: [] }
  expect(projectMap(ideal, 0).landSeaField).toEqual([])
})
