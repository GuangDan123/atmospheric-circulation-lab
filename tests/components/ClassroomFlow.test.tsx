import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'
import { useSimulationStore } from '../../src/state/simulationStore'

describe('课堂主流程', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the three-view classroom layout and shared controls', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '三圈环流因果探究平台' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '经向剖面视图' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '三维全球大气环流球面视图' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '因果链面板' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '模拟控制面板' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '关键帧面板' })).toBeInTheDocument()
  })

  it('shares playback controls with the teacher toolbar', () => {
    render(<App />)

    const toolbar = within(
      screen.getByRole('region', { name: '教师工具栏' }),
    )
    const causalPanel = within(
      screen.getByRole('region', { name: '因果链面板' }),
    )

    fireEvent.click(toolbar.getByRole('button', { name: '播放' }))
    expect(
      causalPanel.getByRole('button', { name: '播放' }),
    ).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(toolbar.getByRole('button', { name: '下一步' }))
    expect(screen.getByText('高空向两极运动')).toBeInTheDocument()
    expect(useSimulationStore.getState().teachingStep).toBe(1)
  })

  it('selects the subtropical high and exposes its dynamic cause', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: '北半球副热带高压' })[0])

    expect(useSimulationStore.getState().selectedPressureBeltId).toBe(
      'pressure-belt:subtropical-north',
    )
    expect(screen.getByLabelText('当前选中气压带成因')).toHaveTextContent('动力成因')
  })

  it('plays all seven causal steps, supports pause and rewind, then resets', () => {
    render(<App />)
    const causalPanel = within(
      screen.getByRole('region', { name: '因果链面板' }),
    )

    fireEvent.click(causalPanel.getByRole('button', { name: '播放' }))
    expect(causalPanel.getByRole('button', { name: '播放' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    for (let index = 0; index < 6; index += 1) {
      fireEvent.click(causalPanel.getByRole('button', { name: '下一步' }))
    }

    expect(screen.getByText('分流形成信风与西风')).toBeInTheDocument()
    expect(useSimulationStore.getState().teachingStep).toBe(6)

    fireEvent.click(causalPanel.getByRole('button', { name: '上一步' }))
    expect(screen.getByText('副热带高压形成')).toBeInTheDocument()
    expect(useSimulationStore.getState().teachingStep).toBe(5)

    fireEvent.click(causalPanel.getByRole('button', { name: '暂停' }))
    expect(causalPanel.getByRole('button', { name: '播放' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    fireEvent.click(causalPanel.getByRole('button', { name: '重置因果链' }))
    expect(screen.getByText('赤道受热上升')).toBeInTheDocument()
    expect(useSimulationStore.getState().teachingStep).toBe(0)
  })

  it('automatically advances while playback is running', () => {
    vi.useFakeTimers()
    render(<App />)
    const causalPanel = within(
      screen.getByRole('region', { name: '因果链面板' }),
    )

    fireEvent.click(causalPanel.getByRole('button', { name: '播放' }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('高空向两极运动')).toBeInTheDocument()
    expect(useSimulationStore.getState().teachingStep).toBe(1)
  })

  it('syncs the causal panel when a keyframe changes the teaching step', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '副热带高压' }))

    expect(screen.getByText('副热带高压形成')).toBeInTheDocument()
    expect(useSimulationStore.getState().teachingStep).toBe(5)
  })

  it('exposes the selected pressure belt as a shared visual selection', () => {
    render(<App />)

    fireEvent.click(screen.getAllByRole('button', { name: '北半球副热带高压' })[0])

    expect(screen.getAllByRole('button', { name: '北半球副热带高压' }).every((button) =>
      button.getAttribute('aria-current') === 'true'
    )).toBe(true)

    const unrelatedBelt = screen.getAllByRole('button', { name: '北半球极地高压' })[0]
    expect(unrelatedBelt).toHaveAttribute('data-dimmed', 'true')
  })
})
