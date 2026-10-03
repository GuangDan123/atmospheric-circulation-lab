import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month } from '../../src/domain/atmosphere/types'
import { MeridionalSection } from '../../src/features/meridional-section/MeridionalSection'

const snapshot = deriveAtmosphere({
  month: 6 as Month,
  coriolisEnabled: true,
  rotationDirection: 1,
  rotationStrength: 1,
  frictionStrength: 0,
  seasonalShiftScale: 0.25,
})

describe('MeridionalSection', () => {
  it('renders the key latitude references in an accessible SVG', () => {
    render(<MeridionalSection snapshot={snapshot} />)

    expect(screen.getByRole('img', { name: '全球大气环流经向剖面' })).toBeInTheDocument()
    expect(screen.getByText('赤道')).toBeInTheDocument()
    expect(screen.getAllByText(/30°/)).toHaveLength(2)
    expect(screen.getAllByText(/60°/)).toHaveLength(2)
    expect(screen.getAllByText(/极地/)).toHaveLength(2)
  })

  it('exposes selection and dynamic formation semantics', () => {
    render(
      <MeridionalSection
        snapshot={snapshot}
        selectedPressureBeltId="pressure-belt:subtropical-north"
      />,
    )

    const belt = screen.getByRole('button', { name: '北半球副热带高压' })
    expect(belt).toHaveAttribute('aria-current', 'true')
    expect(belt).toHaveAccessibleDescription('动力成因，下沉气流')
  })

  it('selects a pressure belt with Enter', () => {
    const onSelectPressureBelt = vi.fn()
    render(
      <MeridionalSection
        snapshot={snapshot}
        onSelectPressureBelt={onSelectPressureBelt}
      />,
    )

    const belt = screen.getByRole('button', { name: '北半球副热带高压' })
    fireEvent.keyDown(belt, { key: 'Enter' })

    expect(onSelectPressureBelt).toHaveBeenCalledWith(
      'pressure-belt:subtropical-north',
    )
  })
})
