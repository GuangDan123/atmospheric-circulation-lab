declare const monthBrand: unique symbol
declare const latitudeBrand: unique symbol

export type Month = number & { readonly [monthBrand]: 'Month' }
export type Latitude = number & { readonly [latitudeBrand]: 'Latitude' }
export type Hemisphere = 'northern' | 'southern' | 'equator'
export type FormationType = 'thermal' | 'dynamic' | 'indirect'
export type VerticalMotion = 'rising' | 'sinking' | 'none'
export type RotationDirection = 1 | -1

export type SimulationParameters = Readonly<{
  month: Month
  coriolisEnabled: boolean
  rotationDirection: RotationDirection
  rotationStrength: number
  frictionStrength: number
  seasonalShiftScale: number
}>
