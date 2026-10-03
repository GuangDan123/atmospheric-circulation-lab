import type { TrackedLocation } from '../../data/locations'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import { getLocationControl } from '../../domain/atmosphere/locationControlModel'

type LocationPanelProps = Readonly<{
  location: TrackedLocation
  snapshot: AtmosphereSnapshot
  locked: boolean
  onLockedChange: (locked: boolean) => void
  onMonthChange: (month: number) => void
}>

const sourceLabels: Readonly<Record<string, string>> = {
  'pressure-belt:subtropical-north': '副热带高压',
  'wind-belt:westerly-north': '盛行西风',
}

const motionLabels = {
  rising: '上升',
  sinking: '下沉',
  none: '无显著垂直运动',
} as const

const moistureLabels = {
  dry: '干燥',
  wet: '湿润',
  neutral: '中性',
} as const

export function LocationPanel({
  location,
  snapshot,
  locked,
  onLockedChange,
  onMonthChange,
}: LocationPanelProps) {
  const control = getLocationControl(location, snapshot)

  return (
    <section aria-label="地点追踪面板" className="panel location-panel">
      <h2>{location.name}</h2>
      <p>{location.latitude}°N，{location.longitude}°E</p>
      <dl>
        <div>
          <dt>当前控制</dt>
          <dd>{sourceLabels[control.primaryControlId] ?? control.primaryControlId}</dd>
        </div>
        <div>
          <dt>垂直运动</dt>
          <dd>{motionLabels[control.verticalMotion]}</dd>
        </div>
        <div>
          <dt>干湿倾向</dt>
          <dd>{moistureLabels[control.moistureTendency]}</dd>
        </div>
      </dl>
      <p>{control.primaryControlId}</p>
      <ul>
        {control.evidence.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <label>
        <input
          type="checkbox"
          checked={locked}
          onChange={(event) => onLockedChange(event.target.checked)}
        />
        播放时锁定地点
      </label>
      <div className="location-panel__actions">
        <button type="button" aria-label="对比 1 月" onClick={() => onMonthChange(1)}>
          1 月
        </button>
        <button type="button" aria-label="对比 7 月" onClick={() => onMonthChange(7)}>
          7 月
        </button>
      </div>
    </section>
  )
}
