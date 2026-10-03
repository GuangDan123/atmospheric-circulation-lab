import type { ChangeEvent } from 'react'
import type { VisibleLayer } from '../../state/types'

type SimulationControlsProps = Readonly<{
  month: number
  coriolisEnabled: boolean
  frictionStrength: number
  explodedViewProgress: number
  visibleLayers: Readonly<Record<VisibleLayer, boolean>>
  onMonthChange: (month: number) => void
  onCoriolisChange: (enabled: boolean) => void
  onFrictionChange: (strength: number) => void
  onExplodedViewChange: (progress: number) => void
  onLayerChange: (layer: VisibleLayer, visible: boolean) => void
}>

const layerLabels: Readonly<Record<VisibleLayer, string>> = {
  surface: '地球表面',
  'latitude-grid': '纬度网格',
  pressure: '气压带',
  wind: '风带',
  'vertical-motion': '垂直运动',
  labels: '标签',
}

export function SimulationControls({
  month,
  coriolisEnabled,
  frictionStrength,
  explodedViewProgress,
  visibleLayers,
  onMonthChange,
  onCoriolisChange,
  onFrictionChange,
  onExplodedViewChange,
  onLayerChange,
}: SimulationControlsProps) {
  const handleNumber =
    (callback: (value: number) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      callback(Number(event.target.value))
    }

  return (
    <section aria-label="模拟控制面板" className="panel">
      <h2>模拟控制</h2>
      <label>
        月份
        <input
          aria-label="月份"
          type="range"
          min="1"
          max="12"
          step="1"
          value={month}
          onChange={handleNumber(onMonthChange)}
        />
        <output>{month} 月</output>
      </label>
      <label>
        <input
          type="checkbox"
          checked={coriolisEnabled}
          onChange={(event) => onCoriolisChange(event.target.checked)}
        />
        开启地转偏向
      </label>
      <label>
        摩擦强度
        <input
          aria-label="摩擦强度"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={frictionStrength}
          onChange={handleNumber(onFrictionChange)}
        />
      </label>
      <label>
        爆炸视图
        <input
          aria-label="爆炸视图"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={explodedViewProgress}
          onChange={handleNumber(onExplodedViewChange)}
        />
      </label>
      <fieldset>
        <legend>显示图层</legend>
        {(Object.keys(layerLabels) as VisibleLayer[]).map((layer) => (
          <label key={layer}>
            <input
              type="checkbox"
              checked={visibleLayers[layer]}
              onChange={(event) => onLayerChange(layer, event.target.checked)}
            />
            {layerLabels[layer]}
          </label>
        ))}
      </fieldset>
    </section>
  )
}
