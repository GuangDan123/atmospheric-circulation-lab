import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { mediterraneanLocation } from '../../src/data/locations'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month } from '../../src/domain/atmosphere/types'
import { LocationPanel } from '../../src/features/location/LocationPanel'

function createSnapshot(month: number) {
  return deriveAtmosphere({
    month: month as Month,
    coriolisEnabled: true,
    rotationDirection: 1,
    rotationStrength: 1,
    frictionStrength: 0,
    seasonalShiftScale: 0.25,
  })
}

describe('LocationPanel', () => {
  it('renders Mediterranean control from the supplied snapshot', () => {
    render(
      <LocationPanel
        location={mediterraneanLocation}
        snapshot={createSnapshot(7)}
        locked
        onLockedChange={vi.fn()}
        onMonthChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: '地中海地区' })).toBeInTheDocument()
    expect(screen.getByText('副热带高压')).toBeInTheDocument()
    expect(screen.getByText('下沉')).toBeInTheDocument()
    expect(screen.getByText('干燥')).toBeInTheDocument()
    expect(screen.getByText('pressure-belt:subtropical-north')).toBeInTheDocument()
  })

  it('toggles location locking and switches the shared month for comparison', () => {
    const onLockedChange = vi.fn()
    const onMonthChange = vi.fn()
    render(
      <LocationPanel
        location={mediterraneanLocation}
        snapshot={createSnapshot(1)}
        locked={false}
        onLockedChange={onLockedChange}
        onMonthChange={onMonthChange}
      />,
    )

    fireEvent.click(screen.getByRole('checkbox', { name: '播放时锁定地点' }))
    expect(onLockedChange).toHaveBeenCalledWith(true)

    fireEvent.click(screen.getByRole('button', { name: '对比 1 月' }))
    expect(onMonthChange).toHaveBeenLastCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: '对比 7 月' }))
    expect(onMonthChange).toHaveBeenLastCalledWith(7)
  })
})
