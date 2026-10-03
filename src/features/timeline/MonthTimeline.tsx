import { useEffect, useState, type KeyboardEvent } from 'react'

type MonthTimelineProps = Readonly<{
  month: number
  onMonthChange: (month: number) => void
}>

function nextMonth(month: number, direction: 1 | -1): number {
  return ((month - 1 + direction + 12) % 12) + 1
}

export function MonthTimeline({
  month,
  onMonthChange,
}: MonthTimelineProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) {
      return
    }

    const timer = window.setTimeout(() => {
      onMonthChange(nextMonth(month, 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [month, onMonthChange, playing])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      onMonthChange(nextMonth(month, 1))
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      onMonthChange(nextMonth(month, -1))
    }
  }

  return (
    <section aria-label="月份时间轴面板" className="panel month-timeline">
      <h2>月份时间轴</h2>
      <label>
        当前月份
        <input
          aria-label="月份时间轴"
          type="range"
          min="1"
          max="12"
          step="1"
          value={month}
          onChange={(event) => onMonthChange(Number(event.target.value))}
          onKeyDown={handleKeyDown}
        />
        <output>{month} 月</output>
      </label>
      <div className="month-timeline__actions">
        <button
          type="button"
          aria-label={playing ? '暂停月份' : '播放月份'}
          aria-pressed={playing}
          onClick={() => setPlaying((current) => !current)}
        >
          {playing ? '暂停' : '播放'}
        </button>
        <button type="button" aria-label="查看 1 月" onClick={() => onMonthChange(1)}>
          1 月
        </button>
        <button type="button" aria-label="查看 7 月" onClick={() => onMonthChange(7)}>
          7 月
        </button>
      </div>
    </section>
  )
}
