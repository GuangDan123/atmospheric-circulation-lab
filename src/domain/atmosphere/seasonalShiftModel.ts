import { getSolarDeclination } from './solarModel'

export const DEFAULT_SEASONAL_SHIFT_SCALE = 0.25

export type SeasonalShiftInput = Readonly<{
  month: number
  seasonalShiftScale?: number
}>

export function getSeasonalShift(
  input: SeasonalShiftInput,
): number {
  const scale =
    input.seasonalShiftScale ?? DEFAULT_SEASONAL_SHIFT_SCALE

  if (!Number.isFinite(scale) || scale < 0 || scale > 1) {
    throw new RangeError('seasonalShiftScale must be from 0 to 1')
  }

  return getSolarDeclination(input.month) * scale
}
