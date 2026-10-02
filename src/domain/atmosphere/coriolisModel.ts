import type { RotationDirection } from './types'

export type CoriolisDirection = 'left' | 'right' | 'none'

export type CoriolisEffect = Readonly<{
  direction: CoriolisDirection
  magnitude: number
}>

export type CoriolisInput = Readonly<{
  latitude: number
  rotationDirection: RotationDirection
  rotationStrength: number
  frictionStrength: number
  enabled: boolean
}>

export type HorizontalMotion = Readonly<{
  eastward: boolean
  northward: boolean
}>

function assertFiniteInRange(
  value: number,
  name: string,
  minimum: number,
  maximum: number,
): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be from ${minimum} to ${maximum}`)
  }
}

export function getCoriolisEffect(input: CoriolisInput): CoriolisEffect {
  assertFiniteInRange(input.latitude, 'latitude', -90, 90)
  assertFiniteInRange(input.rotationStrength, 'rotationStrength', 0, 1)
  assertFiniteInRange(input.frictionStrength, 'frictionStrength', 0, 1)

  if (input.rotationDirection !== 1 && input.rotationDirection !== -1) {
    throw new RangeError('rotationDirection must be 1 or -1')
  }

  if (!input.enabled || input.latitude === 0 || input.rotationStrength === 0) {
    return { direction: 'none', magnitude: 0 }
  }

  const hemisphereSign = Math.sign(input.latitude)
  const directionSign = hemisphereSign * input.rotationDirection
  const latitudeRadians = (input.latitude * Math.PI) / 180
  const magnitude = Math.min(
    1,
    Math.abs(Math.sin(latitudeRadians)) *
      input.rotationStrength *
      (1 - input.frictionStrength),
  )

  if (magnitude === 0) {
    return { direction: 'none', magnitude: 0 }
  }

  return {
    direction: directionSign > 0 ? 'right' : 'left',
    magnitude,
  }
}

export function nameWindFromMotion(motion: HorizontalMotion): string {
  if (motion.eastward && !motion.northward) {
    return '西风'
  }

  if (!motion.eastward && !motion.northward) {
    return '东风'
  }

  if (!motion.eastward && motion.northward) {
    return '东南风'
  }

  return '西南风'
}
