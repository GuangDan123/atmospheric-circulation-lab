import { useState } from 'react'
import { climateLocations } from '../../data/climateLocations'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import { getClimateControl } from '../../domain/climate/climateControlModel'

const moistureLabels = { dry: '干', wet: '湿', neutral: '过渡' }

export function ClimatePanel({ snapshot }: Readonly<{ snapshot: AtmosphereSnapshot }>) {
  const [index, setIndex] = useState(0)
  const location = climateLocations[index]
  const control = getClimateControl(location, snapshot)
  return <section className="panel" aria-label="气候关联">
    <h2>气候关联证据链</h2>
    <label>气候地点<select aria-label="气候地点" value={index} onChange={(event) => setIndex(Number(event.target.value))}>{climateLocations.map((item, i) => <option key={item.id} value={i}>{item.climate}</option>)}</select></label>
    <p role="status">{control.month} 月 · {location.name}：{moistureLabels[control.moistureTendency]}倾向。{control.evidence.join('；')}。证据：{control.evidenceObjectIds.join('、')}</p>
    <table aria-label="全年气候控制关系">
      <caption>当前参数下的月度干湿倾向，不是实测气温降水量</caption>
      <thead><tr><th>月份</th><th>干湿倾向</th><th>控制证据</th></tr></thead>
      <tbody>{control.monthlyControls.map((item) => <tr key={item.month} aria-current={item.month === control.month ? 'date' : undefined}><th scope="row">{item.month} 月</th><td>{moistureLabels[item.moistureTendency]}</td><td>{item.evidenceObjectIds.join('、')}</td></tr>)}</tbody>
    </table>
    <p>气压带与风带不是气候的唯一原因；还受{control.otherFactors.join('、')}等因素影响。这是理想化环流控制示例，不用于实际气候分类或天气预报。</p>
  </section>
}
