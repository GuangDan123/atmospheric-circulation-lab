import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import { monsoonLabel } from './monsoonLabels'
import { monsoonPresets } from '../../scenarios/p1/monsoonPresets'
import type { SimulationPreset } from '../../state/types'

const mechanismNames: Readonly<Record<string, string>> = { 'southeast-trades': '东南信风', 'seasonal-shift': '季节移动', 'cross-equatorial': '越赤道气流', coriolis: '地转偏向', 'land-sea': '海陆差异', 'seasonal-transition': '季节过渡' }

export function MonsoonExplorer({ snapshot, onApplyPreset, onSeasonalShiftChange, onCrossEquatorialChange, onCoriolisChange, onLandSeaChange }: Readonly<{
  snapshot: AtmosphereSnapshot
  onApplyPreset: (preset: SimulationPreset) => void
  onSeasonalShiftChange: (scale: number) => void
  onCrossEquatorialChange: (enabled: boolean) => void
  onCoriolisChange: (enabled: boolean) => void
  onLandSeaChange: (contrast: number) => void
}>) {
  return <section aria-label="季风机制探究">
    <h2>季风机制探究</h2>
    <p>参数化教学模型：海陆差异、季节移动与偏转共同作用；不是气压中心的单因解释。</p>
    {monsoonPresets.map(({ label, preset }) => <button key={label} type="button" onClick={() => onApplyPreset(preset)}>{label}</button>)}
    <label><input type="checkbox" checked={(snapshot.parameters.landSeaContrast ?? 0) > 0} onChange={(event) => onLandSeaChange(event.target.checked ? 1 : 0)} />海陆差异</label>
    <label><input type="checkbox" checked={snapshot.parameters.seasonalShiftScale > 0} onChange={(event) => onSeasonalShiftChange(event.target.checked ? 0.25 : 0)} />季节移动</label>
    <label><input type="checkbox" checked={snapshot.parameters.crossEquatorialEnabled ?? true} onChange={(event) => onCrossEquatorialChange(event.target.checked)} />越赤道气流</label>
    <label><input type="checkbox" checked={snapshot.parameters.coriolisEnabled} onChange={(event) => onCoriolisChange(event.target.checked)} />季风地转偏向</label>
    {snapshot.monsoons.map((result) => <article key={result.region}>
      <h3>{monsoonLabel(result)}</h3>
      <p>激活机制：{result.activeMechanisms.map((name) => mechanismNames[name]).join('、') || '无'}</p>
      {result.missingMechanisms.length > 0 && <p>缺失机制：{result.missingMechanisms.map((name) => mechanismNames[name]).join('、')}</p>}
      <ol>{result.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p>{result.evidence.join('；')}</p>
    </article>)}
  </section>
}
