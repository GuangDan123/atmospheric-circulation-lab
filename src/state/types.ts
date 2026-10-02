import type { AtmosphereSnapshot } from '../domain/atmosphere/deriveAtmosphere'
import type {
  Month,
  RotationDirection,
  SimulationParameters,
} from '../domain/atmosphere/types'

export type VisibleLayer =
  | 'surface'
  | 'latitude-grid'
  | 'pressure'
  | 'wind'
  | 'vertical-motion'
  | 'labels'

export type VisibleLayers = Readonly<Record<VisibleLayer, boolean>>

export type SimulationPreset = Readonly<{
  parameters: SimulationParameters
  selectedPressureBeltId: string | null
  keyframeId: string | null
  teachingStep: number
}>

export type TeachingState = Readonly<{
  month: Month
  coriolisEnabled: boolean
  rotationDirection: RotationDirection
  rotationStrength: number
  frictionStrength: number
  seasonalShiftScale: number
  selectedPressureBeltId: string | null
  keyframeId: string | null
  teachingStep: number
}>

export type ViewProjection = Readonly<{
  snapshot: AtmosphereSnapshot
  selectedPressureBeltId: string | null
  explodedViewProgress: number
  visibleLayers: VisibleLayers
}>
