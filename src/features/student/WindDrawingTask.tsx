import { useId } from 'react'
import type { CompassDirection } from '../../domain/assessment/types'

export const compassLabels: Record<CompassDirection, string> = { north: '北', south: '南', northeast: '东北', northwest: '西北', southeast: '东南', southwest: '西南' }
const vectors: Record<CompassDirection, readonly [number, number]> = { north: [0, -40], south: [0, 40], northeast: [40, -40], northwest: [-40, -40], southeast: [40, 40], southwest: [-40, 40] }

type Props = Readonly<{ destination: CompassDirection; source: CompassDirection; onChange: (field: 'destination' | 'source', value: CompassDirection) => void }>

export function WindDrawingTask({ destination, source, onChange }: Props) {
  const markerId = useId()
  const [x, y] = vectors[destination]
  return <fieldset>
    <legend>绘制近地面信风</legend>
    <p>选择方向生成箭头，可用键盘或触摸完成，无需手势绘图。箭头表示气流去向，风名表示来源。</p>
    <svg role="img" aria-label={`气流箭头指向${compassLabels[destination]}`} viewBox="0 0 120 120" width="120" height="120">
      <defs><marker id={markerId} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
      <line x1="60" y1="60" x2={60 + x} y2={60 + y} stroke="currentColor" strokeWidth="3" markerEnd={`url(#${markerId})`} />
      <text x="60" y="12" textAnchor="middle">北</text>
      <text x="60" y="116" textAnchor="middle">南</text>
    </svg>
    {(['destination', 'source'] as const).map((field) => <label key={field}>
      {field === 'destination' ? '气流去向' : '风向来源'}
      <select aria-label={field === 'destination' ? '气流去向' : '风向来源'} value={field === 'destination' ? destination : source} onChange={(event) => onChange(field, event.target.value as CompassDirection)}>
        {Object.entries(compassLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>)}
  </fieldset>
}
