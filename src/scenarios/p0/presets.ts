import type { Month } from '../../domain/atmosphere/types'
import type { SimulationPreset } from '../../state/types'

const january = 1 as Month
const june = 6 as Month
const july = 7 as Month

function parameters(
  month: Month,
  coriolisEnabled = true,
): SimulationPreset['parameters'] {
  return {
    month,
    coriolisEnabled,
    rotationDirection: 1,
    rotationStrength: 1,
    frictionStrength: 0,
    seasonalShiftScale: 0.25,
  }
}

export const p0Keyframes: readonly SimulationPreset[] = [
  {
    parameters: parameters(june, false),
    selectedPressureBeltId: null,
    keyframeId: 'keyframe:single-cell',
    teachingStep: 0,
  },
  {
    parameters: parameters(june),
    selectedPressureBeltId: null,
    keyframeId: 'keyframe:three-cells',
    teachingStep: 0,
  },
  {
    parameters: parameters(june),
    selectedPressureBeltId: 'pressure-belt:subtropical-north',
    keyframeId: 'keyframe:subtropical-high',
    teachingStep: 5,
  },
  {
    parameters: parameters(june),
    selectedPressureBeltId: 'pressure-belt:subpolar-north',
    keyframeId: 'keyframe:subpolar-low',
    teachingStep: 6,
  },
  {
    parameters: parameters(june),
    selectedPressureBeltId: null,
    keyframeId: 'keyframe:hemisphere-deflection',
    teachingStep: 3,
  },
  {
    parameters: parameters(june),
    selectedPressureBeltId: null,
    keyframeId: 'keyframe:wind-naming',
    teachingStep: 6,
  },
  {
    parameters: parameters(january),
    selectedPressureBeltId: null,
    keyframeId: 'keyframe:january',
    teachingStep: 0,
  },
  {
    parameters: parameters(july),
    selectedPressureBeltId: null,
    keyframeId: 'keyframe:july',
    teachingStep: 0,
  },
  {
    parameters: parameters(july),
    selectedPressureBeltId: 'pressure-belt:subtropical-north',
    keyframeId: 'keyframe:mediterranean',
    teachingStep: 5,
  },
]

export const p0KeyframeLabels: Readonly<Record<string, string>> = {
  'keyframe:single-cell': '无地转偏向单圈环流',
  'keyframe:three-cells': '三圈环流全景',
  'keyframe:subtropical-high': '副热带高压',
  'keyframe:subpolar-low': '副极地低压',
  'keyframe:hemisphere-deflection': '南北半球偏转对比',
  'keyframe:wind-naming': '气流方向与风向名称',
  'keyframe:january': '1 月环流',
  'keyframe:july': '7 月环流',
  'keyframe:mediterranean': '地中海地点追踪',
}
