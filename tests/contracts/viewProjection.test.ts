import { describe, expect, it } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type {
  Month,
  RotationDirection,
} from '../../src/domain/atmosphere/types'
import { projectGlobe } from '../../src/features/globe/projectGlobe'
import { projectMap } from '../../src/features/map-projection/projectMap'
import { projectSection } from '../../src/features/meridional-section/projectSection'

const cases = [
  { month: 1, coriolisEnabled: true, rotationDirection: 1 },
  { month: 7, coriolisEnabled: true, rotationDirection: 1 },
  { month: 6, coriolisEnabled: false, rotationDirection: 1 },
  { month: 6, coriolisEnabled: true, rotationDirection: -1 },
] as const

function createSnapshot(input: (typeof cases)[number]) {
  return deriveAtmosphere({
    month: input.month as Month,
    coriolisEnabled: input.coriolisEnabled,
    rotationDirection: input.rotationDirection as RotationDirection,
    rotationStrength: 1,
    frictionStrength: 0,
    seasonalShiftScale: 0.25,
  })
}

function scientificProperties(
  pressureBelts: readonly {
    sourceId: string
    formation: string
    centerLatitude: number
    verticalMotion: string
    adjacentWindBeltIds: readonly string[]
  }[],
) {
  return pressureBelts.map((belt) => ({
    sourceId: belt.sourceId,
    formation: belt.formation,
    centerLatitude: belt.centerLatitude,
    verticalMotion: belt.verticalMotion,
    adjacentWindBeltIds: belt.adjacentWindBeltIds,
  }))
}

describe('view projection contract', () => {
  it.each(cases)(
    'preserves scientific properties for month $month, coriolis $coriolisEnabled, rotation $rotationDirection',
    (input) => {
      const snapshot = createSnapshot(input)
      const section = projectSection(snapshot)
      const map = projectMap(snapshot, 120)
      const globe = projectGlobe(snapshot, 0)

      expect(section.source).toBe(snapshot)
      expect(map.source).toBe(snapshot)
      expect(globe.source).toBe(snapshot)
      expect(scientificProperties(map.pressureBelts)).toEqual(
        scientificProperties(section.pressureBelts),
      )
      expect(scientificProperties(globe.pressureBelts)).toEqual(
        scientificProperties(section.pressureBelts),
      )
      expect(map.pressureBelts.map((belt) => belt.sourceId)).toEqual(
        snapshot.pressureBelts.map((_, index) =>
          section.pressureBelts[index].sourceId,
        ),
      )
      expect(map.pressureBelts[4].coordinates).not.toEqual(
        section.pressureBelts[4].coordinates,
      )
    },
  )

  it('projects wind belts without changing their stable source IDs', () => {
    const snapshot = createSnapshot(cases[1])
    const section = projectSection(snapshot)
    const map = projectMap(snapshot, -75)
    const globe = projectGlobe(snapshot, 0)

    expect(map.windBelts.map((belt) => belt.sourceId)).toEqual(
      section.windBelts.map((belt) => belt.sourceId),
    )
    expect(globe.windBelts.map((belt) => belt.sourceId)).toEqual(
      section.windBelts.map((belt) => belt.sourceId),
    )
    expect(map.centralLongitude).toBe(-75)
  })

  it('changes only globe layer transforms in exploded view', () => {
    const snapshot = createSnapshot(cases[0])
    const compact = projectGlobe(snapshot, 0)
    const exploded = projectGlobe(snapshot, 1)

    expect(compact.source).toBe(snapshot)
    expect(exploded.source).toBe(snapshot)
    expect(scientificProperties(exploded.pressureBelts)).toEqual(
      scientificProperties(compact.pressureBelts),
    )
    expect(exploded.layerTransforms).not.toEqual(compact.layerTransforms)
  })
})
