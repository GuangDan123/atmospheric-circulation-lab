import type { Month } from '../../domain/atmosphere/types'
import type { SimulationPreset } from '../../state/types'

export const monsoonPresets: readonly Readonly<{ label: string; preset: SimulationPreset }>[] = [
  ['东亚冬季风', 1], ['东亚夏季风', 7], ['南亚冬季风', 1], ['南亚夏季风', 7],
].map(([label, month]) => ({
  label: String(label),
  preset: {
    parameters: { month: Number(month) as Month, coriolisEnabled: true, rotationDirection: 1, rotationStrength: 1, frictionStrength: 0, seasonalShiftScale: 0.25, landSeaContrast: 1, crossEquatorialEnabled: true },
    selectedPressureBeltId: null, keyframeId: `keyframe:monsoon-${label}`, teachingStep: 0,
  },
}))
