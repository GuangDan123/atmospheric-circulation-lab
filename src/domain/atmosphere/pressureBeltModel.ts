import type { FormationType } from './types'
import { getSeasonalShift } from './seasonalShiftModel'

export type PressureBeltKind =
  | 'polar-high'
  | 'subpolar-low'
  | 'subtropical-high'
  | 'equatorial-low'

export type PressureBelt = Readonly<{
  kind: PressureBeltKind
  formation: Exclude<FormationType, 'indirect'>
  centerLatitude: number
  southLatitude: number
  northLatitude: number
}>

export type PressureBeltInput = Readonly<{
  month: number
  seasonalShiftScale?: number
}>

type PressureBeltDefinition = Readonly<{
  kind: PressureBeltKind
  formation: Exclude<FormationType, 'indirect'>
  centerLatitude: number
}>

const DEFINITIONS: readonly PressureBeltDefinition[] = [
  { kind: 'polar-high', formation: 'thermal', centerLatitude: -90 },
  { kind: 'subpolar-low', formation: 'dynamic', centerLatitude: -60 },
  {
    kind: 'subtropical-high',
    formation: 'dynamic',
    centerLatitude: -30,
  },
  {
    kind: 'equatorial-low',
    formation: 'thermal',
    centerLatitude: 0,
  },
  {
    kind: 'subtropical-high',
    formation: 'dynamic',
    centerLatitude: 30,
  },
  { kind: 'subpolar-low', formation: 'dynamic', centerLatitude: 60 },
  { kind: 'polar-high', formation: 'thermal', centerLatitude: 90 },
]

function clampLatitude(latitude: number): number {
  return Math.max(-90, Math.min(90, latitude))
}

export function getPressureBelts(
  input: PressureBeltInput,
): readonly PressureBelt[] {
  const shift = getSeasonalShift(input)
  const centers = DEFINITIONS.map(({ centerLatitude }) =>
    clampLatitude(centerLatitude + shift),
  )

  return DEFINITIONS.map((definition, index) => ({
    kind: definition.kind,
    formation: definition.formation,
    centerLatitude: centers[index],
    southLatitude:
      index === 0
        ? -90
        : (centers[index - 1] + centers[index]) / 2,
    northLatitude:
      index === centers.length - 1
        ? 90
        : (centers[index] + centers[index + 1]) / 2,
  }))
}
