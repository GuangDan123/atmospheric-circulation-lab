import { getCoriolisEffect } from './coriolisModel'
import type { PressureBelt } from './pressureBeltModel'
import type { RotationDirection } from './types'

export type WindBelt = Readonly<{
  name: string
  southLatitude: number
  northLatitude: number
  eastward: boolean | null
  northward: boolean
}>

export type WindBeltInput = Readonly<{
  pressureBelts: readonly PressureBelt[]
  coriolisEnabled: boolean
  rotationDirection: RotationDirection
  rotationStrength: number
  frictionStrength: number
}>

function isHighPressure(belt: PressureBelt): boolean {
  return belt.kind.endsWith('high')
}

function getWindName(
  index: number,
  eastward: boolean | null,
  northward: boolean,
): string {
  if (eastward === null) {
    return northward ? '南风' : '北风'
  }

  const zonalName = eastward ? '西风' : '东风'
  const directionalName = eastward
    ? northward
      ? '西南'
      : '西北'
    : northward
      ? '东南'
      : '东北'

  if (index === 0 || index === 5) {
    return `${directionalName}极地${zonalName}`
  }

  if (index === 1 || index === 4) {
    return `${directionalName}盛行${zonalName}`
  }

  return `${directionalName}信风`
}

export function getWindBelts(
  input: WindBeltInput,
): readonly WindBelt[] {
  return input.pressureBelts.slice(0, -1).map((southern, index) => {
    const northern = input.pressureBelts[index + 1]
    const midpoint =
      (southern.centerLatitude + northern.centerLatitude) / 2
    const northward = isHighPressure(southern)
    const coriolis = getCoriolisEffect({
      latitude: midpoint,
      rotationDirection: input.rotationDirection,
      rotationStrength: input.rotationStrength,
      frictionStrength: input.frictionStrength,
      enabled: input.coriolisEnabled,
    })
    const eastward = coriolis.direction === 'none'
      ? null
      : northward
        ? coriolis.direction === 'right'
        : coriolis.direction === 'left'

    return {
      name: getWindName(index, eastward, northward),
      southLatitude: southern.centerLatitude,
      northLatitude: northern.centerLatitude,
      eastward,
      northward,
    }
  })
}
