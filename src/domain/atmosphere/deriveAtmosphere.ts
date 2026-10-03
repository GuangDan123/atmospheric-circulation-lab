import {
  getCirculationCells,
  getVerticalMotions,
  type CirculationCell,
  type VerticalMotionMarker,
} from './circulationModel'
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
}>

export function deriveAtmosphere(
  parameters: SimulationParameters,
): AtmosphereSnapshot {
  const pressureBelts = getPressureBelts({
    month: parameters.month,
    seasonalShiftScale: parameters.seasonalShiftScale,
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
  }
}
