import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TeacherToolbar } from '../../src/features/teacher/TeacherToolbar'

function renderToolbar() {
  const actions = {
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onPlaybackChange: vi.fn(),
    onSpeedChange: vi.fn(),
    onLabelDensityChange: vi.fn(),
    onFullscreen: vi.fn(),
    onReset: vi.fn(),
    onScreenshot: vi.fn(),
  }

  render(
    <TeacherToolbar
      playing={false}
      speed={1}
      labelDensity="standard"
      keyBindings={{ previous: 'PageUp', next: 'PageDown', togglePlayback: ' ' }}
      {...actions}
    />,
  )

  return actions
}

describe('TeacherToolbar', () => {
  it('exposes playback, navigation, display and classroom actions', () => {
    const actions = renderToolbar()

    fireEvent.click(screen.getByRole('button', { name: '上一步' }))
    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    fireEvent.change(screen.getByRole('combobox', { name: '动画速度' }), {
      target: { value: '2' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: '标签密度' }), {
      target: { value: 'reduced' },
    })
    fireEvent.click(screen.getByRole('button', { name: '全屏' }))
    fireEvent.click(screen.getByRole('button', { name: '复位课堂' }))
    fireEvent.click(screen.getByRole('button', { name: '截图' }))

    expect(actions.onPrevious).toHaveBeenCalledOnce()
    expect(actions.onNext).toHaveBeenCalledOnce()
    expect(actions.onPlaybackChange).toHaveBeenCalledWith(true)
    expect(actions.onSpeedChange).toHaveBeenCalledWith(2)
    expect(actions.onLabelDensityChange).toHaveBeenCalledWith('reduced')
    expect(actions.onFullscreen).toHaveBeenCalledOnce()
    expect(actions.onReset).toHaveBeenCalledOnce()
    expect(actions.onScreenshot).toHaveBeenCalledOnce()
  })

  it('uses configurable presentation keys without intercepting browser shortcuts', () => {
    const actions = renderToolbar()

    fireEvent.keyDown(window, { key: 'PageDown' })
    fireEvent.keyDown(window, { key: 'PageUp' })
    fireEvent.keyDown(window, { key: ' ' })
    fireEvent.keyDown(window, { key: 'PageDown', ctrlKey: true })

    expect(actions.onNext).toHaveBeenCalledOnce()
    expect(actions.onPrevious).toHaveBeenCalledOnce()
    expect(actions.onPlaybackChange).toHaveBeenCalledWith(true)
  })
})
