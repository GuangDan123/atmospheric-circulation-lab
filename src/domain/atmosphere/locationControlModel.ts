import type { TrackedLocation } from '../../data/locations'
import type { AtmosphereSnapshot } from './deriveAtmosphere'
import type { VerticalMotion } from './types'

export type LocationControlSource = Readonly<{
  sourceId: string
  sourceType: 'pressure-belt' | 'wind-belt'
  weight: number
}>

export type LocationControl = Readonly<{
  locationId: string
  primaryControlId: string
  controls: readonly LocationControlSource[]
  verticalMotion: VerticalMotion
  moistureTendency: 'dry' | 'wet' | 'neutral'
  evidence: readonly string[]
}>

const pressureBeltIds = [
  'pressure-belt:polar-south',
  'pressure-belt:subpolar-south',
  'pressure-belt:subtropical-south',
  'pressure-belt:equatorial-low',
  'pressure-belt:subtropical-north',
  'pressure-belt:subpolar-north',
  'pressure-belt:polar-north',
] as const

const windBeltIds = [
  'wind-belt:polar-easterly-south',
  'wind-belt:westerly-south',
  'wind-belt:trade-south',
  'wind-belt:trade-north',
  'wind-belt:westerly-north',
  'wind-belt:polar-easterly-north',
] as const

const pressureDominanceDistance = 5
const windDominanceDistance = 10

function pressureMotion(kind: string): VerticalMotion {
  return kind.endsWith('high') ? 'sinking' : 'rising'
}

function pressureName(kind: string): string {
  if (kind === 'subtropical-high') {
    return '副热带高压'
  }

  if (kind === 'subpolar-low') {
    return '副极地低压'
  }

  if (kind === 'equatorial-low') {
    return '赤道低压'
  }

  return '极地高压'
}

export function getLocationControl(
  location: TrackedLocation,
  snapshot: AtmosphereSnapshot,
): LocationControl {
  const pressureIndex = snapshot.pressureBelts.reduce(
    (nearest, belt, index) =>
      Math.abs(belt.centerLatitude - location.latitude) <
      Math.abs(
        snapshot.pressureBelts[nearest].centerLatitude - location.latitude,
      )
        ? index
        : nearest,
    0,
  )
  const pressureBelt = snapshot.pressureBelts[pressureIndex]
  const pressureDistance = Math.abs(
    pressureBelt.centerLatitude - location.latitude,
  )
  const windIndex = snapshot.windBelts.findIndex(
    (belt) =>
      location.latitude >= belt.southLatitude &&
      location.latitude <= belt.northLatitude,
  )
  const windBelt = snapshot.windBelts[windIndex]
  const pressureControl: LocationControlSource = {
    sourceId: pressureBeltIds[pressureIndex],
    sourceType: 'pressure-belt',
    weight: 1,
  }
  const windControl: LocationControlSource | undefined = windBelt
    ? {
        sourceId: windBeltIds[windIndex],
        sourceType: 'wind-belt',
        weight: 1,
      }
    : undefined

  if (!windControl || pressureDistance <= pressureDominanceDistance) {
    const motion = pressureMotion(pressureBelt.kind)

    return {
      locationId: location.id,
      primaryControlId: pressureControl.sourceId,
      controls: [pressureControl],
      verticalMotion: motion,
      moistureTendency: motion === 'sinking' ? 'dry' : 'wet',
      evidence: [
        `${pressureName(pressureBelt.kind)}控制`,
        `${motion === 'sinking' ? '下沉' : '上升'}气流影响当地干湿状况`,
      ],
    }
  }

  if (pressureDistance >= windDominanceDistance) {
    return {
      locationId: location.id,
      primaryControlId: windControl.sourceId,
      controls: [windControl],
      verticalMotion: 'none',
      moistureTendency: windBelt.name.includes('盛行西风') ? 'wet' : 'dry',
      evidence: [
        `${windBelt.name}控制`,
        windBelt.name.includes('盛行西风')
          ? '盛行西风带来湿润气流'
          : '近地面风带影响当地干湿状况',
      ],
    }
  }

  const pressureWeight =
    (windDominanceDistance - pressureDistance) /
    (windDominanceDistance - pressureDominanceDistance)
  const controls = [
    { ...pressureControl, weight: pressureWeight },
    { ...windControl, weight: 1 - pressureWeight },
  ]
  const primaryControl = controls.reduce((primary, control) =>
    control.weight > primary.weight ? control : primary,
  )

  return {
    locationId: location.id,
    primaryControlId: primaryControl.sourceId,
    controls,
    verticalMotion: pressureMotion(pressureBelt.kind),
    moistureTendency: primaryControl.sourceType === 'pressure-belt' ? 'dry' : 'wet',
    evidence: [
      `${pressureName(pressureBelt.kind)}与${windBelt.name}共同影响`,
      '地点位于季节性控制过渡带',
    ],
  }
}
