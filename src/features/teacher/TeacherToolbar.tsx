import { useEffect } from 'react'
import type { LabelDensity } from '../../rendering/performance/profile'

export type TeacherKeyBindings = Readonly<{
  previous: string
  next: string
  togglePlayback: string
}>

type TeacherToolbarProps = Readonly<{
  playing: boolean
  speed: number
  labelDensity: LabelDensity
  keyBindings: TeacherKeyBindings
  onPrevious: () => void
  onNext: () => void
  onPlaybackChange: (playing: boolean) => void
  onSpeedChange: (speed: number) => void
  onLabelDensityChange: (density: LabelDensity) => void
  onFullscreen: () => void
  onReset: () => void
  onScreenshot: () => void
}>

export function TeacherToolbar({
  playing,
  speed,
  labelDensity,
  keyBindings,
  onPrevious,
  onNext,
  onPlaybackChange,
  onSpeedChange,
  onLabelDensityChange,
  onFullscreen,
  onReset,
  onScreenshot,
}: TeacherToolbarProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      if (event.key === keyBindings.previous) {
        event.preventDefault()
        onPrevious()
      } else if (event.key === keyBindings.next) {
        event.preventDefault()
        onNext()
      } else if (event.key === keyBindings.togglePlayback) {
        event.preventDefault()
        onPlaybackChange(!playing)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyBindings, onNext, onPlaybackChange, onPrevious, playing])

  return (
    <section aria-label="教师工具栏" className="panel teacher-toolbar">
      <h2>教师工具栏</h2>
      <div className="teacher-toolbar__actions">
        <button type="button" onClick={onPrevious}>上一步</button>
        <button type="button" onClick={onNext}>下一步</button>
        <button
          type="button"
          aria-pressed={playing}
          onClick={() => onPlaybackChange(!playing)}
        >
          {playing ? '暂停' : '播放'}
        </button>
        <label>
          动画速度
          <select
            aria-label="动画速度"
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
          >
            <option value="0.5">0.5×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="4">4×</option>
          </select>
        </label>
        <label>
          标签密度
          <select
            aria-label="标签密度"
            value={labelDensity}
            onChange={(event) =>
              onLabelDensityChange(event.target.value as LabelDensity)
            }
          >
            <option value="full">完整</option>
            <option value="standard">标准</option>
            <option value="reduced">精简</option>
          </select>
        </label>
        <button type="button" onClick={onFullscreen}>全屏</button>
        <button type="button" aria-label="复位课堂" onClick={onReset}>复位</button>
        <button type="button" onClick={onScreenshot}>截图</button>
      </div>
    </section>
  )
}
