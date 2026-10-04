import type {
  FormationType,
  Hemisphere,
  SimulationParameters,
  VerticalMotion,
} from './types'

export type CirculationCellName = 'hadley' | 'ferrel' | 'polar' | 'single'

export type CirculationPathPoint = Readonly<{
  latitude: number
  normalizedAltitude: number
}>

export type CirculationCell = Readonly<{
  name: CirculationCellName
  hemisphere: Exclude<Hemisphere, 'equator'>
  formation: Extract<FormationType, 'thermal' | 'indirect'>
  path: readonly CirculationPathPoint[]
}>

export type VerticalMotionMarker = Readonly<{
  latitude: number
  motion: Exclude<VerticalMotion, 'none'>
}>

type CellDefinition = Readonly<{
  name: CirculationCellName
  hemisphere: Exclude<Hemisphere, 'equator'>
  formation: Extract<FormationType, 'thermal' | 'indirect'>
  equatorwardLatitude: number
  polewardLatitude: number
  surfaceTowardPole: boolean
}>

const CELL_DEFINITIONS: readonly CellDefinition[] = [
  {
    name: 'polar',
    hemisphere: 'southern',
    formation: 'thermal',
    equatorwardLatitude: -60,
    polewardLatitude: -90,
    surfaceTowardPole: true,
  },
  {
    name: 'ferrel',
    hemisphere: 'southern',
    formation: 'indirect',
    equatorwardLatitude: -30,
    polewardLatitude: -60,
    surfaceTowardPole: true,
  },
  {
    name: 'hadley',
    hemisphere: 'southern',
    formation: 'thermal',
    equatorwardLatitude: 0,
    polewardLatitude: -30,
    surfaceTowardPole: false,
  },
  {
    name: 'hadley',
    hemisphere: 'northern',
    formation: 'thermal',
    equatorwardLatitude: 0,
    polewardLatitude: 30,
    surfaceTowardPole: false,
  },
  {
    name: 'ferrel',
    hemisphere: 'northern',
    formation: 'indirect',
    equatorwardLatitude: 30,
    polewardLatitude: 60,
    surfaceTowardPole: true,
  },
  {
    name: 'polar',
    hemisphere: 'northern',
    formation: 'thermal',
    equatorwardLatitude: 60,
    polewardLatitude: 90,
    surfaceTowardPole: true,
  },
]

const SINGLE_CELL_DEFINITIONS: readonly CellDefinition[] = [
  {
    name: 'single',
    hemisphere: 'southern',
    formation: 'thermal',
    equatorwardLatitude: 0,
    polewardLatitude: -90,
    surfaceTowardPole: false,
  },
  {
    name: 'single',
    hemisphere: 'northern',
    formation: 'thermal',
    equatorwardLatitude: 0,
    polewardLatitude: 90,
    surfaceTowardPole: false,
  },
]

const VERTICAL_MOTIONS: readonly VerticalMotionMarker[] = [
  { latitude: -90, motion: 'sinking' },
  { latitude: -60, motion: 'rising' },
  { latitude: -30, motion: 'sinking' },
  { latitude: 0, motion: 'rising' },
  { latitude: 30, motion: 'sinking' },
  { latitude: 60, motion: 'rising' },
  { latitude: 90, motion: 'sinking' },
]

function createPath(
  definition: CellDefinition,
): readonly CirculationPathPoint[] {
  const surfaceStart = definition.surfaceTowardPole
    ? definition.equatorwardLatitude
    : definition.polewardLatitude
  const surfaceEnd = definition.surfaceTowardPole
    ? definition.polewardLatitude
    : definition.equatorwardLatitude

  return [
    { latitude: surfaceStart, normalizedAltitude: 0 },
    { latitude: surfaceEnd, normalizedAltitude: 0 },
    { latitude: surfaceEnd, normalizedAltitude: 1 },
    { latitude: surfaceStart, normalizedAltitude: 1 },
  ]
}

export function getCirculationCells(
  { coriolisEnabled, rotationStrength = 1 }: Pick<SimulationParameters, 'coriolisEnabled'> &
    Partial<Pick<SimulationParameters, 'rotationStrength'>> = {
    coriolisEnabled: true,
  },
): readonly CirculationCell[] {
  const definitions = coriolisEnabled && rotationStrength !== 0
    ? CELL_DEFINITIONS
    : SINGLE_CELL_DEFINITIONS

  return definitions.map((definition) => ({
    name: definition.name,
    hemisphere: definition.hemisphere,
    formation: definition.formation,
    path: createPath(definition),
  }))
}

export function getVerticalMotions(): readonly VerticalMotionMarker[] {
  return VERTICAL_MOTIONS.map((marker) => ({ ...marker }))
}
