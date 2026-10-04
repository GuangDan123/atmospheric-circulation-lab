import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../src/App'
import { selectAtmosphereSnapshot, useSimulationStore } from '../../src/state/simulationStore'

describe('P0 rotation and history controls', () => {
  beforeEach(() => useSimulationStore.getState().reset())

  it('changes rotation direction and strength while paused and restores defaults', () => {
    render(<App />)
    fireEvent.change(screen.getByRole('combobox', { name: '自转方向' }), { target: { value: '-1' } })
    fireEvent.change(screen.getByRole('slider', { name: '自转相对强度' }), { target: { value: '0' } })
    let state = useSimulationStore.getState()
    expect(state.rotationDirection).toBe(-1)
    expect(state.rotationStrength).toBe(0)
    expect(state.playback).toBe('paused')
    expect(selectAtmosphereSnapshot(state).parameters.rotationStrength).toBe(0)
    fireEvent.change(screen.getByRole('slider', { name: '自转相对强度' }), { target: { value: '1' } })
    expect(useSimulationStore.getState().rotationStrength).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: '复位课堂' }))
    state = useSimulationStore.getState()
    expect(state.rotationDirection).toBe(1)
    expect(state.rotationStrength).toBe(1)
  })

  it('rejects invalid strength without changing history', () => {
    const state = useSimulationStore.getState()
    expect(state.setRotationStrength).toBeTypeOf('function')
    for (const value of [-0.1, 1.1, NaN, Infinity]) {
      expect(() => state.setRotationStrength(value)).toThrow(RangeError)
    }
    expect(useSimulationStore.getState().history.past).toHaveLength(0)
  })

  it('exposes bounded undo redo separately from causal previous and clears redo on a new change', () => {
    render(<App />)
    const undo = screen.getByRole('button', { name: '撤销' })
    const redo = screen.getByRole('button', { name: '重做' })
    expect(undo).toBeDisabled()
    expect(redo).toBeDisabled()
    fireEvent.change(screen.getByRole('combobox', { name: '自转方向' }), { target: { value: '-1' } })
    const reversed = selectAtmosphereSnapshot(useSimulationStore.getState())
    fireEvent.click(undo)
    expect(useSimulationStore.getState().rotationDirection).toBe(1)
    expect(useSimulationStore.getState().teachingStep).toBe(0)
    expect(undo).toBeDisabled()
    expect(redo).toBeEnabled()
    fireEvent.click(redo)
    expect(selectAtmosphereSnapshot(useSimulationStore.getState())).toEqual(reversed)
    fireEvent.click(undo)
    fireEvent.change(screen.getByRole('slider', { name: '自转相对强度' }), { target: { value: '0.5' } })
    expect(redo).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '复位课堂' }))
    expect(undo).toBeDisabled()
    expect(redo).toBeDisabled()
  })

  it('does not add a no-op rotation change to history', () => {
    act(() => useSimulationStore.getState().setRotationDirection(1))
    expect(useSimulationStore.getState().history.past).toHaveLength(0)
  })
})

describe('P0 basic prediction', () => {
  beforeEach(() => useSimulationStore.getState().reset())

  it.each([['left', '预测正确'], ['right', '预测与模拟不一致'], ['none', '预测与模拟不一致']])('validates %s only after submitting and applying the actual simulation', (answer, feedback) => {
    render(<App />)
    const panel = within(screen.getByRole('region', { name: '基础预测面板' }))
    expect(panel.getByRole('button', { name: '提交预测' })).toBeDisabled()
    expect(panel.getByRole('button', { name: '运行模拟验证' })).toBeDisabled()
    fireEvent.change(panel.getByRole('combobox', { name: '预测偏转方向' }), { target: { value: answer } })
    fireEvent.click(panel.getByRole('button', { name: '提交预测' }))
    expect(useSimulationStore.getState().rotationDirection).toBe(1)
    expect(panel.queryByRole('status')).not.toBeInTheDocument()
    fireEvent.click(panel.getByRole('button', { name: '运行模拟验证' }))
    const state = useSimulationStore.getState()
    expect(state.rotationDirection).toBe(-1)
    expect(state.rotationStrength).toBe(1)
    expect(state.coriolisEnabled).toBe(true)
    expect(state.frictionStrength).toBe(0)
    expect(state.playback).toBe('paused')
    expect(panel.getByRole('status')).toHaveTextContent(feedback)
    expect(panel.getByRole('status')).toHaveTextContent('实际偏转：左偏')
    expect(panel.getByRole('status')).toHaveTextContent('反向自转')
    fireEvent.click(screen.getByRole('button', { name: '撤销' }))
    expect(useSimulationStore.getState().rotationDirection).toBe(1)
    expect(panel.queryByRole('status')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '复位课堂' }))
    const resetPanel = within(screen.getByRole('region', { name: '基础预测面板' }))
    expect(resetPanel.getByRole('combobox', { name: '预测偏转方向' })).toHaveValue('')
    expect(resetPanel.getByRole('button', { name: '运行模拟验证' })).toBeDisabled()
  })

  it('invalidates submitted prediction when the answer changes', () => {
    render(<App />)
    const panel = within(screen.getByRole('region', { name: '基础预测面板' }))
    fireEvent.change(panel.getByRole('combobox', { name: '预测偏转方向' }), { target: { value: 'left' } })
    fireEvent.click(panel.getByRole('button', { name: '提交预测' }))
    fireEvent.change(panel.getByRole('combobox', { name: '预测偏转方向' }), { target: { value: 'right' } })
    expect(panel.getByRole('button', { name: '运行模拟验证' })).toBeDisabled()
  })
})
