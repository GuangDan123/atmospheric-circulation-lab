import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, expect, it } from 'vitest'
import App from '../../src/App'
import { useSimulationStore } from '../../src/state/simulationStore'

beforeEach(() => useSimulationStore.getState().reset())

it('closes the monsoon exploration loop with mechanisms, shared views, history and reset', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: '南亚夏季风' }))
  expect(screen.getAllByLabelText('季风投影')).toHaveLength(4)
  expect(screen.getAllByText('南亚：西南季风 · 100%').length).toBeGreaterThanOrEqual(3)
  const explorer = within(screen.getByRole('region', { name: '季风机制探究' }))
  expect(explorer.getByText('印度次大陆热低压吸引')).toBeInTheDocument()
  fireEvent.click(explorer.getByRole('checkbox', { name: '越赤道气流' }))
  expect(explorer.getByText('缺失机制：越赤道气流')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '撤销' }))
  expect(explorer.queryByText('缺失机制：越赤道气流')).not.toBeInTheDocument()
  fireEvent.click(explorer.getByRole('checkbox', { name: '季节移动' }))
  expect(explorer.getByText('缺失机制：季节移动')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '东亚冬季风' }))
  expect(screen.getAllByText('东亚：西北季风 · 100%').length).toBeGreaterThanOrEqual(3)
  fireEvent.click(screen.getByRole('button', { name: '复位课堂' }))
  expect(useSimulationStore.getState().landSeaContrast).toBe(0)
})
