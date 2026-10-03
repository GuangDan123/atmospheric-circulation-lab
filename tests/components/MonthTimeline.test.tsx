import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MonthTimeline } from '../../src/features/timeline/MonthTimeline'

describe('MonthTimeline', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('changes the month with arrow keys and wraps across the year boundary', () => {
    const onMonthChange = vi.fn()
    const { rerender } = render(
      <MonthTimeline month={12} onMonthChange={onMonthChange} />,
    )

    fireEvent.keyDown(screen.getByRole('slider', { name: '月份时间轴' }), {
      key: 'ArrowRight',
    })
    expect(onMonthChange).toHaveBeenLastCalledWith(1)

    rerender(<MonthTimeline month={1} onMonthChange={onMonthChange} />)
    fireEvent.keyDown(screen.getByRole('slider', { name: '月份时间轴' }), {
      key: 'ArrowLeft',
    })
    expect(onMonthChange).toHaveBeenLastCalledWith(12)
  })

  it('plays through months and pauses without further changes', () => {
    vi.useFakeTimers()
    const onMonthChange = vi.fn()
    const { rerender } = render(
      <MonthTimeline month={6} onMonthChange={onMonthChange} />,
    )

    fireEvent.click(screen.getByRole('button', { name: '播放月份' }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onMonthChange).toHaveBeenLastCalledWith(7)

    rerender(<MonthTimeline month={7} onMonthChange={onMonthChange} />)
    fireEvent.click(screen.getByRole('button', { name: '暂停月份' }))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onMonthChange).toHaveBeenCalledTimes(1)
  })

  it('jumps directly to January and July', () => {
    const onMonthChange = vi.fn()
    render(<MonthTimeline month={6} onMonthChange={onMonthChange} />)

    fireEvent.click(screen.getByRole('button', { name: '查看 1 月' }))
    expect(onMonthChange).toHaveBeenLastCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: '查看 7 月' }))
    expect(onMonthChange).toHaveBeenLastCalledWith(7)
  })
})
