import { getLandSeaField, type LandSeaFieldPoint } from '../../domain/atmosphere/landSeaModel'
import type { CirculationCell } from '../../domain/atmosphere/circulationModel'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import type { FormationType, VerticalMotion } from '../../domain/atmosphere/types'

export type SectionCoordinates = Readonly<{
  x: number
  y: number
}>

export type SectionPressureBelt = Readonly<{
  sourceId: string
  formation: Exclude<FormationType, 'indirect'>
  centerLatitude: number
  verticalMotion: Exclude<VerticalMotion, 'none'>
  adjacentWindBeltIds: readonly string[]
  coordinates: SectionCoordinates
}>

export type SectionWindBelt = Readonly<{
  sourceId: string
  southLatitude: number
  northLatitude: number
  coordinates: Readonly<{
    x1: number
    x2: number
    y: number
  }>
}>

export type SectionLandSeaAnomaly = Readonly<{
  sourceId: string
  kind: 'high' | 'low'
  latitude: number
  longitude: number
  anomalyStrength: number
  evidence: readonly string[]
  name: string
  source: string
  coordinates: SectionCoordinates
}>

export type SectionCirculationCell = Readonly<
  Omit<CirculationCell, 'path'> & {
    sourceId: string
    coordinates: readonly SectionCoordinates[]
  }
>

export type SectionProjection = Readonly<{
  landSeaField: readonly LandSeaFieldPoint[]
  monsoons: AtmosphereSnapshot['monsoons']
  source: AtmosphereSnapshot
  circulationCells: readonly SectionCirculationCell[]
  pressureBelts: readonly SectionPressureBelt[]
  windBelts: readonly SectionWindBelt[]
  landSeaAnomalies: readonly SectionLandSeaAnomaly[]
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

function sectionX(latitude: number): number {
  return 40 + ((latitude + 90) / 180) * 720
}

function adjacentWindBeltIds(index: number): readonly string[] {
  return [windBeltIds[index - 1], windBeltIds[index]].filter(
    (id): id is (typeof windBeltIds)[number] => id !== undefined,
  )
}

export function projectSection(
  snapshot: AtmosphereSnapshot,
): SectionProjection {
  return {
    source: snapshot,
    monsoons: snapshot.monsoons,
    landSeaField: getLandSeaField(snapshot.landSeaAnomalies),
    circulationCells: snapshot.circulationCells.map((cell) => ({
      sourceId: `circulation-cell:${cell.name}-${cell.hemisphere}`,
      name: cell.name,
      hemisphere: cell.hemisphere,
      formation: cell.formation,
      coordinates: cell.path.map((point) => ({
        x: sectionX(point.latitude),
        y: 280 - point.normalizedAltitude * 220,
      })),
    })),
    pressureBelts: snapshot.pressureBelts.map((belt, index) => ({
      sourceId: pressureBeltIds[index],
      formation: belt.formation,
      centerLatitude: belt.centerLatitude,
      verticalMotion: snapshot.verticalMotions[index].motion,
      adjacentWindBeltIds: adjacentWindBeltIds(index),
      coordinates: {
        x: sectionX(belt.centerLatitude),
        y: 300,
      },
    })),
    windBelts: snapshot.windBelts.map((belt, index) => ({
      sourceId: windBeltIds[index],
      southLatitude: belt.southLatitude,
      northLatitude: belt.northLatitude,
      coordinates: {
        x1: sectionX(belt.southLatitude),
        x2: sectionX(belt.northLatitude),
        y: 330,
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
        x: sectionX(anomaly.latitude),
        y: anomaly.kind === 'high' ? 190 : 230,
      },
    })),
  }
}
