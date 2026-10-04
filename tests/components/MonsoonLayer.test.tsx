import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { getMonsoon } from '../../src/domain/atmosphere/monsoonModel'
import { MonsoonLayer } from '../../src/features/globe/layers/MonsoonLayer'

const input = { region: 'south-asia' as const, month: 7, landSeaContrast: 1, seasonalShiftScale: 0.25, crossEquatorialEnabled: true, coriolisEnabled: true, rotationDirection: 1 as const, rotationStrength: 1, terrainInfluence: false }

describe('MonsoonLayer', () => {
  it('renders a tangent northeastward summer flow and hides incomplete mechanisms', () => {
    const result = getMonsoon(input)
    const layer = MonsoonLayer({ monsoons: [result], transform: { scale: 1.16 } })
    const arrows = layer.props.children
    expect(arrows).toHaveLength(1)
    const [direction, origin, length] = arrows[0].props.args as [Vector3, Vector3, number]
    expect(direction.length()).toBeCloseTo(1)
    expect(direction.dot(origin)).toBeCloseTo(0)
    expect(direction.y).toBeGreaterThan(0)
    expect(length).toBeGreaterThan(0)
    expect(layer.props.scale).toBe(1.16)
    const incomplete = getMonsoon({ ...input, crossEquatorialEnabled: false })
    expect(MonsoonLayer({ monsoons: [incomplete], transform: { scale: 1 } }).props.children).toHaveLength(0)
  })
})
