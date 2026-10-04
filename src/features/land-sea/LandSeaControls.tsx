import type { ChangeEvent } from 'react'

type LandSeaControlsProps = Readonly<{
  landSeaContrast: number
  onChange: (contrast: number) => void
}>

export function LandSeaControls({
  landSeaContrast,
  onChange,
}: LandSeaControlsProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange(Number(event.target.value))
  }

  return (
    <section aria-label="海陆差异控制面板" className="panel">
      <h2>海陆差异</h2>
      <label>
        海陆差异强度
        <input
          aria-label="海陆差异强度"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={landSeaContrast}
          onChange={handleChange}
        />
        <output>{Math.round(landSeaContrast * 100)}%</output>
      </label>
      <p>参数化教学模型：仅显示季节性海陆气压中心异常。</p>
    </section>
  )
}
