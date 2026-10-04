import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, expect, it } from 'vitest'
import App from '../../src/App'
import { useSimulationStore } from '../../src/state/simulationStore'

beforeEach(() => { localStorage.clear(); useSimulationStore.getState().reset() })

it('diagnoses, redraws through accessible alternatives, verifies and reveals evidence', () => {
  render(<App />)
  const panel = within(screen.getByRole('region', { name: '学生诊断任务' }))
  expect(panel.getByRole('button', { name: '验证答案' })).toBeDisabled()
  fireEvent.change(panel.getByLabelText('气压梯度'), { target: { value: 'low-to-high' } })
  fireEvent.click(panel.getByRole('button', { name: '提交任务预测' }))
  fireEvent.click(panel.getByRole('button', { name: '验证答案' }))
  expect(panel.getByRole('status')).toHaveTextContent('气压梯度方向错误')
  expect(panel.getByRole('status')).toHaveTextContent('wind-belt:trade-north')
  fireEvent.change(panel.getByLabelText('气压梯度'), { target: { value: 'high-to-low' } })
  expect(panel.getByRole('button', { name: '验证答案' })).toBeDisabled()
  fireEvent.click(panel.getByRole('button', { name: '提交任务预测' }))
  fireEvent.click(panel.getByRole('button', { name: '验证答案' }))
  expect(panel.getByRole('status')).toHaveTextContent('答案正确')
  fireEvent.click(panel.getByRole('button', { name: '揭示因果链' }))
  expect(panel.getByText(/高压流向低压 →/)).toBeVisible()
  expect(screen.getByRole('region', { name: '本地学习记录' })).toHaveTextContent('2 条')
  fireEvent.change(screen.getByRole('slider', { name: '月份', exact: true }), { target: { value: '1' } })
  expect(panel.queryByRole('status')).not.toBeInTheDocument()
})

it('synchronizes climate chart, month and multi-factor boundary', () => {
  render(<App />)
  const panel = within(screen.getByRole('region', { name: '气候关联' }))
  fireEvent.change(screen.getByRole('slider', { name: '月份', exact: true }), { target: { value: '7' } })
  expect(panel.getByRole('status')).toHaveTextContent('7 月')
  expect(panel.getByRole('table')).toHaveTextContent('干')
  expect(panel.getByText(/不是气候的唯一原因/)).toBeVisible()
})

it('recovers corruption and clears local records without resetting the simulation', () => {
  localStorage.setItem('circulation-learning-v1', '{broken')
  render(<App />)
  const panel = within(screen.getByRole('region', { name: '本地学习记录' }))
  expect(panel.getByRole('status')).toHaveTextContent('损坏')
  fireEvent.click(panel.getByRole('button', { name: '清除学习记录' }))
  expect(panel.getByRole('status')).toHaveTextContent('0 条')
})

it('draws a directional arrowhead for every selectable destination', () => {
  render(<App />)
  const panel = within(screen.getByRole('region', { name: '学生诊断任务' }))
  for (const direction of ['north', 'south', 'northeast', 'northwest', 'southeast', 'southwest']) {
    fireEvent.change(panel.getByLabelText('气流去向'), { target: { value: direction } })
    const svg = panel.getByRole('img')
    const line = svg.querySelector('line')!
    const markerId = line.getAttribute('marker-end')?.match(/^url\(#(.+)\)$/)?.[1]
    expect(markerId).toBeTruthy()
    const marker = Array.from(svg.querySelectorAll('marker')).find((item) => item.id === markerId)
    expect(marker).toHaveAttribute('orient', 'auto')
    expect(marker?.querySelector('path')).toHaveAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
  }
})
