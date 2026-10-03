import type {
  PerformanceSelection,
  PerformanceTier,
} from '../../rendering/performance/profile'

type PerformancePanelProps = Readonly<{
  detectedTier: PerformanceTier
  selectedTier: PerformanceSelection
  onTierChange: (tier: PerformanceSelection) => void
}>

const tierLabels: Record<PerformanceTier, string> = {
  high: '高性能',
  standard: '标准',
  low: '低性能',
}

export function PerformancePanel({
  detectedTier,
  selectedTier,
  onTierChange,
}: PerformancePanelProps) {
  return (
    <section aria-label="性能设置" className="panel performance-panel">
      <h2>性能设置</h2>
      <p>自动检测：{tierLabels[detectedTier]}</p>
      <label>
        性能档位
        <select
          aria-label="性能档位"
          value={selectedTier}
          onChange={(event) =>
            onTierChange(event.target.value as PerformanceSelection)
          }
        >
          <option value="auto">自动</option>
          <option value="high">高性能</option>
          <option value="standard">标准</option>
          <option value="low">低性能</option>
        </select>
      </label>
    </section>
  )
}
