import { getLandSeaField, type LandSeaFieldPoint } from '../../domain/atmosphere/landSeaModel'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import type { FormationType, VerticalMotion } from '../../domain/atmosphere/types'
import type { VisibleLayer } from '../../state/types'

export type GlobePressureBelt = Readonly<{
  sourceId: string
  formation: Exclude<FormationType, 'indirect'>
  centerLatitude: number
  verticalMotion: Exclude<VerticalMotion, 'none'>
  adjacentWindBeltIds: readonly string[]
  coordinates: Readonly<{
    radius: number
    height: number
  }>
}>

export type GlobeWindBelt = Readonly<{
  sourceId: string
  southLatitude: number
  northLatitude: number
  coordinates: Readonly<{
    radius: number
    height: number
  }>
}>

export type GlobeLandSeaAnomaly = Readonly<{
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
    z: number
  }>
}>

export type GlobeLayerTransform = Readonly<{
  scale: number
}>

export type GlobeProjection = Readonly<{
  landSeaField: readonly LandSeaFieldPoint[]
  monsoons: AtmosphereSnapshot['monsoons']
  source: AtmosphereSnapshot
  pressureBelts: readonly GlobePressureBelt[]
  windBelts: readonly GlobeWindBelt[]
  landSeaAnomalies: readonly GlobeLandSeaAnomaly[]
  layerTransforms: Readonly<Record<VisibleLayer, GlobeLayerTransform>>
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

const layerExpansion: Readonly<Record<VisibleLayer, number>> = {
  surface: 0,
  'latitude-grid': 0.04,
  pressure: 0.1,
  wind: 0.16,
  'vertical-motion': 0.22,
  labels: 0.28,
}

function sphericalRing(latitude: number, altitude = 0): GlobePressureBelt['coordinates'] {
  const radians = (latitude * Math.PI) / 180
  const sphereRadius = 1 + altitude
  return {
    radius: Math.max(0.01, Math.cos(radians) * sphereRadius),
    height: Math.sin(radians) * sphereRadius,
  }
}

function adjacentWindBeltIds(index: number): readonly string[] {
  return [windBeltIds[index - 1], windBeltIds[index]].filter(
    (id): id is (typeof windBeltIds)[number] => id !== undefined,
  )
}

function sphericalPoint(
  latitude: number,
  longitude: number,
  altitude: number,
): GlobeLandSeaAnomaly['coordinates'] {
  const latitudeRadians = (latitude * Math.PI) / 180
  const longitudeRadians = (longitude * Math.PI) / 180
  const radius = 1 + altitude
  return {
    x: Math.cos(latitudeRadians) * Math.sin(longitudeRadians) * radius,
    y: Math.sin(latitudeRadians) * radius,
    z: Math.cos(latitudeRadians) * Math.cos(longitudeRadians) * radius,
  }
}

export function projectGlobe(
  snapshot: AtmosphereSnapshot,
  explodedViewProgress: number,
): GlobeProjection {
  if (
    !Number.isFinite(explodedViewProgress) ||
    explodedViewProgress < 0 ||
    explodedViewProgress > 1
  ) {
    throw new RangeError('explodedViewProgress must be from 0 to 1')
  }

  return {
    source: snapshot,
    monsoons: snapshot.monsoons,
    landSeaField: getLandSeaField(snapshot.landSeaAnomalies),
    pressureBelts: snapshot.pressureBelts.map((belt, index) => ({
      sourceId: pressureBeltIds[index],
      formation: belt.formation,
      centerLatitude: belt.centerLatitude,
      verticalMotion: snapshot.verticalMotions[index].motion,
      adjacentWindBeltIds: adjacentWindBeltIds(index),
      coordinates: sphericalRing(belt.centerLatitude, 0.035),
    })),
    windBelts: snapshot.windBelts.map((belt, index) => {
      const centerLatitude = (belt.southLatitude + belt.northLatitude) / 2
      return {
        sourceId: windBeltIds[index],
        southLatitude: belt.southLatitude,
        northLatitude: belt.northLatitude,
        coordinates: sphericalRing(centerLatitude, 0.08),
      }
    }),
    landSeaAnomalies: snapshot.landSeaAnomalies.map((anomaly) => ({
      sourceId: anomaly.id,
      kind: anomaly.kind,
      latitude: anomaly.latitude,
      longitude: anomaly.longitude,
      anomalyStrength: anomaly.anomalyStrength,
      evidence: anomaly.evidence,
      name: anomaly.name,
      source: anomaly.source,
      coordinates: sphericalPoint(anomaly.latitude, anomaly.longitude, 0.06),
    })),
    layerTransforms: Object.fromEntries(
      Object.entries(layerExpansion).map(([layer, expansion]) => [
        layer,
        { scale: 1 + expansion * explodedViewProgress },
      ]),
    ) as Record<VisibleLayer, GlobeLayerTransform>,
  }
}
