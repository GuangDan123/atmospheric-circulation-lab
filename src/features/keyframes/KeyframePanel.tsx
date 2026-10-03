import {
  p0KeyframeLabels,
  p0Keyframes,
} from '../../scenarios/p0/presets'
import type { SimulationPreset } from '../../state/types'

type KeyframePanelProps = Readonly<{
  onApplyPreset: (preset: SimulationPreset) => void
}>

export function KeyframePanel({ onApplyPreset }: KeyframePanelProps) {
  return (
    <section aria-label="关键帧面板" className="panel">
      <h2>关键帧</h2>
      <div className="keyframe-list">
        {p0Keyframes.map((keyframe) => (
          <button
            key={keyframe.keyframeId}
            type="button"
            onClick={() => onApplyPreset(keyframe)}
          >
            {p0KeyframeLabels[keyframe.keyframeId ?? '']}
          </button>
        ))}
      </div>
    </section>
  )
}
