import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../src/App'
import { useSimulationStore } from '../../src/state/simulationStore'

const keyframeLabels = [
  '无地转偏向单圈环流',
  '三圈环流全景',
  '副热带高压',
  '副极地低压',
  '南北半球偏转对比',
  '气流方向与风向名称',
  '1 月环流',
  '7 月环流',
  '地中海地点追踪',
] as const

describe('Stage 2 classroom flow', () => {
  beforeEach(() => {
    useSimulationStore.getState().reset()
  })

  it('renders the month timeline and location tracking panels', () => {
    render(<App />)

    expect(screen.getByRole('region', { name: '月份时间轴面板' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '地点追踪面板' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '地中海地区' })).toBeInTheDocument()
  })

  it('offers every P0 keyframe and applies the January snapshot', () => {
    render(<App />)

    keyframeLabels.forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '1 月环流' }))
    expect(useSimulationStore.getState().month).toBe(1)
    expect(useSimulationStore.getState().keyframeId).toBe('keyframe:january')
  })

  it('keeps the tracked location synchronized with the shared month snapshot', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '查看 7 月' }))
    expect(useSimulationStore.getState().month).toBe(7)
    expect(within(screen.getByRole('region', { name: '地点追踪面板' })).getByText('pressure-belt:subtropical-north')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '查看 1 月' }))
    expect(useSimulationStore.getState().month).toBe(1)
    expect(within(screen.getByRole('region', { name: '地点追踪面板' })).getByText('wind-belt:westerly-north')).toBeInTheDocument()
  })
})
