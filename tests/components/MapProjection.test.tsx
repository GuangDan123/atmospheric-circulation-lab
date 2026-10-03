import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month } from '../../src/domain/atmosphere/types'
import { MapProjection } from '../../src/features/map-projection/MapProjection'

const snapshot = deriveAtmosphere({
  month: 7 as Month,
  coriolisEnabled: true,
  rotationDirection: 1,
  rotationStrength: 1,
  frictionStrength: 0,
  seasonalShiftScale: 0.25,
})

describe('MapProjection', () => {
  it('renders key latitude references and the requested central longitude', () => {
    render(<MapProjection snapshot={snapshot} centralLongitude={120} />)

    expect(screen.getByRole('img', { name: '全球气压带与风带平面图' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '赤道低压' })).toBeInTheDocument()
    expect(screen.getByText('赤道')).toBeInTheDocument()
    expect(screen.getAllByText(/30°/)).toHaveLength(2)
    expect(screen.getAllByText(/60°/)).toHaveLength(2)
    expect(screen.getAllByText(/极地/)).toHaveLength(2)
    expect(screen.getByText('中央经线 120°E')).toBeInTheDocument()
  })

  it('marks the selected dynamic pressure belt and supports keyboard selection', () => {
    const onSelectPressureBelt = vi.fn()
    render(
      <MapProjection
        snapshot={snapshot}
        selectedPressureBeltId="pressure-belt:subtropical-south"
        onSelectPressureBelt={onSelectPressureBelt}
      />,
    )

    const selected = screen.getByRole('button', {
      name: '南半球副热带高压',
    })
    expect(selected).toHaveAttribute('aria-current', 'true')
    expect(selected).toHaveAccessibleDescription('动力成因，下沉气流')

    const northern = screen.getByRole('button', {
      name: '北半球副热带高压',
    })
    fireEvent.keyDown(northern, { key: 'Enter' })
    expect(onSelectPressureBelt).toHaveBeenCalledWith(
      'pressure-belt:subtropical-north',
    )
  })
})
