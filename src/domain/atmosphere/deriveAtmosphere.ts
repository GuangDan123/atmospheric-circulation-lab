import {
  getCirculationCells,
  getVerticalMotions,
  type CirculationCell,
  type VerticalMotionMarker,
} from './circulationModel'
import {
  getLandSeaAnomalies,
  type LandSeaAnomaly,
  type LandSeaContrast,
} from './landSeaModel'
import {
  getPressureBelts,
  type PressureBelt,
} from './pressureBeltModel'
import { getSolarDeclination } from './solarModel'
import type { SimulationParameters } from './types'
import { getWindBelts, type WindBelt } from './windBeltModel'

export type AtmosphereSnapshot = Readonly<{
  parameters: SimulationParameters
  solarDeclination: number
  circulationCells: readonly CirculationCell[]
  pressureBelts: readonly PressureBelt[]
  windBelts: readonly WindBelt[]
  verticalMotions: readonly VerticalMotionMarker[]
  landSeaAnomalies: readonly LandSeaAnomaly[]
}>

export function deriveAtmosphere(
  parameters: SimulationParameters,
): AtmosphereSnapshot {
  const pressureBelts = getPressureBelts({
    month: parameters.month,
    seasonalShiftScale: parameters.seasonalShiftScale,
  })
  const landSeaContrast = parameters.landSeaContrast ?? 0
  const landSeaAnomalies = getLandSeaAnomalies({
    month: parameters.month,
    landSeaContrast: landSeaContrast as LandSeaContrast,
  })

  return {
    parameters: { ...parameters },
    solarDeclination: getSolarDeclination(parameters.month),
    circulationCells: getCirculationCells(parameters),
    pressureBelts,
    windBelts: getWindBelts({
      pressureBelts,
      coriolisEnabled: parameters.coriolisEnabled,
      rotationDirection: parameters.rotationDirection,
      rotationStrength: parameters.rotationStrength,
      frictionStrength: parameters.frictionStrength,
    }),
    verticalMotions: getVerticalMotions(),
    landSeaAnomalies,
  }
}
