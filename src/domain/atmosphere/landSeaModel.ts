import { pressureCenterDefinitions } from '../../data/pressureCenters'

export type LandSeaContrast = number & {
  readonly __landSeaContrast: unique symbol
}

export type PressureCenterKind = 'high' | 'low'

export type PressureCenterDefinition = Readonly<{
  id: string
  kind: PressureCenterKind
  latitude: number
  longitude: number
  activeMonths: readonly number[]
  name: string
  source: string
}>

export type LandSeaAnomaly = Readonly<{
  id: string
  kind: PressureCenterKind
  latitude: number
  longitude: number
  anomalyStrength: number
  name: string
  source: string
}>

export type LandSeaAnomalyInput = Readonly<{
  month: number
  landSeaContrast: LandSeaContrast
}>

function assertMonth(month: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('month must be an integer from 1 to 12')
  }
}

function assertLandSeaContrast(contrast: number): asserts contrast is LandSeaContrast {
  if (!Number.isFinite(contrast) || contrast < 0 || contrast > 1) {
    throw new RangeError('landSeaContrast must be from 0 to 1')
  }
}

export function getLandSeaAnomalies(
  input: LandSeaAnomalyInput,
): readonly LandSeaAnomaly[] {
  assertMonth(input.month)
  assertLandSeaContrast(input.landSeaContrast)

  if (input.landSeaContrast === 0) {
    return []
  }

  return pressureCenterDefinitions
    .filter(({ activeMonths }) => activeMonths.includes(input.month))
    .map((center) => ({
      id: center.id,
      kind: center.kind,
      latitude: center.latitude,
      longitude: center.longitude,
      anomalyStrength: input.landSeaContrast,
      name: center.name,
      source: center.source,
    }))
}
