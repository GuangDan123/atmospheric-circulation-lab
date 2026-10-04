import { getLandSeaField, type LandSeaFieldPoint } from '../../domain/atmosphere/landSeaModel'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import type { FormationType, VerticalMotion } from '../../domain/atmosphere/types'

export type MapPressureBelt = Readonly<{
  sourceId: string
  formation: Exclude<FormationType, 'indirect'>
  centerLatitude: number
  verticalMotion: Exclude<VerticalMotion, 'none'>
  adjacentWindBeltIds: readonly string[]
  coordinates: Readonly<{
    x: number
    y: number
    width: number
  }>
}>

export type MapWindBelt = Readonly<{
  sourceId: string
  southLatitude: number
  northLatitude: number
  coordinates: Readonly<{
    x: number
    y1: number
    y2: number
    width: number
  }>
}>

export type MapLandSeaAnomaly = Readonly<{
  sourceId: string
  kind: 'high' | 'low'
  latitude: number
  longitude: number
  anomalyStrength: number
  evidence: readonly string[]
  name: string
  source: string
  coordinates: Readonly<{
    x: number
    y: number
  }>
}>

export type MapProjectionData = Readonly<{
  landSeaField: readonly LandSeaFieldPoint[]
  monsoons: AtmosphereSnapshot['monsoons']
  source: AtmosphereSnapshot
  centralLongitude: number
  pressureBelts: readonly MapPressureBelt[]
  windBelts: readonly MapWindBelt[]
  landSeaAnomalies: readonly MapLandSeaAnomaly[]
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

function mapY(latitude: number): number {
  return 20 + ((90 - latitude) / 180) * 360
}

function adjacentWindBeltIds(index: number): readonly string[] {
  return [windBeltIds[index - 1], windBeltIds[index]].filter(
    (id): id is (typeof windBeltIds)[number] => id !== undefined,
  )
}

function mapX(longitude: number, centralLongitude: number): number {
  const relativeLongitude = ((longitude - centralLongitude + 540) % 360) - 180
  return 50 + ((relativeLongitude + 180) / 360) * 700
}

export function projectMap(
  snapshot: AtmosphereSnapshot,
  centralLongitude: number,
): MapProjectionData {
  if (
    !Number.isFinite(centralLongitude) ||
    centralLongitude < -180 ||
    centralLongitude > 180
  ) {
    throw new RangeError('centralLongitude must be from -180 to 180')
  }

  return {
    source: snapshot,
    monsoons: snapshot.monsoons,
    landSeaField: getLandSeaField(snapshot.landSeaAnomalies),
    centralLongitude,
    pressureBelts: snapshot.pressureBelts.map((belt, index) => ({
      sourceId: pressureBeltIds[index],
      formation: belt.formation,
      centerLatitude: belt.centerLatitude,
      verticalMotion: snapshot.verticalMotions[index].motion,
      adjacentWindBeltIds: adjacentWindBeltIds(index),
      coordinates: {
        x: 0,
        y: mapY(belt.centerLatitude),
        width: 800,
      },
    })),
    windBelts: snapshot.windBelts.map((belt, index) => ({
      sourceId: windBeltIds[index],
      southLatitude: belt.southLatitude,
      northLatitude: belt.northLatitude,
      coordinates: {
        x: 0,
        y1: mapY(belt.southLatitude),
        y2: mapY(belt.northLatitude),
        width: 800,
      },
    })),
    landSeaAnomalies: snapshot.landSeaAnomalies.map((anomaly) => ({
      sourceId: anomaly.id,
      kind: anomaly.kind,
      latitude: anomaly.latitude,
      longitude: anomaly.longitude,
      anomalyStrength: anomaly.anomalyStrength,
      evidence: anomaly.evidence,
      name: anomaly.name,
      source: anomaly.source,
      coordinates: {
        x: mapX(anomaly.longitude, centralLongitude),
        y: mapY(anomaly.latitude),
      },
    })),
  }
}
