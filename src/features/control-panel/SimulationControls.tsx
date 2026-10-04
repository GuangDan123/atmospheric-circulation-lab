import type { ChangeEvent } from 'react'
import type { RotationDirection } from '../../domain/atmosphere/types'
import type { VisibleLayer } from '../../state/types'

type SimulationControlsProps = Readonly<{
  month: number
  coriolisEnabled: boolean
  rotationDirection: RotationDirection
  rotationStrength: number
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onRotationDirectionChange: (direction: RotationDirection) => void
  onRotationStrengthChange: (strength: number) => void
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
  rotationDirection,
  rotationStrength,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRotationDirectionChange,
  onRotationStrengthChange,
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
      <div className="causal-panel__actions">
        <button type="button" disabled={!canUndo} onClick={onUndo}>撤销</button>
        <button type="button" disabled={!canRedo} onClick={onRedo}>重做</button>
      </div>
      <p>撤销/重做恢复教学操作；因果链上一步/下一步用于讲解步进。</p>
      <label>
        自转方向
        <select aria-label="自转方向" value={rotationDirection}
          onChange={(event) => onRotationDirectionChange(Number(event.target.value) as RotationDirection)}>
          <option value="1">正常自转（自西向东）</option>
          <option value="-1">反向自转（自东向西）</option>
        </select>
      </label>
      <label>
        自转相对强度
        <input aria-label="自转相对强度" type="range" min="0" max="1" step="0.05"
          value={rotationStrength} onChange={handleNumber(onRotationStrengthChange)} />
        <output>{rotationStrength.toFixed(2)}（教学相对量，0 表示无自转偏转）</output>
      </label>
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
