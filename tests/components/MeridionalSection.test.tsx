import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month } from '../../src/domain/atmosphere/types'
import { MeridionalSection } from '../../src/features/meridional-section/MeridionalSection'
import { projectSection } from '../../src/features/meridional-section/projectSection'

const snapshot = deriveAtmosphere({
  month: 6 as Month,
  coriolisEnabled: true,
  rotationDirection: 1,
  rotationStrength: 1,
  frictionStrength: 0,
  seasonalShiftScale: 0.25,
})

const singleSnapshot = deriveAtmosphere({
  ...snapshot.parameters,
  coriolisEnabled: false,
})

describe('MeridionalSection', () => {
  it('projects circulation paths directly from the supplied snapshot', () => {
    const projection = projectSection(singleSnapshot)

    expect(projection.source).toBe(singleSnapshot)
    expect(projection.circulationCells).toEqual([
      {
        sourceId: 'circulation-cell:single-southern',
        name: 'single',
        hemisphere: 'southern',
        formation: 'thermal',
        coordinates: [
          { x: 40, y: 280 },
          { x: 400, y: 280 },
          { x: 400, y: 60 },
          { x: 40, y: 60 },
        ],
      },
      {
        sourceId: 'circulation-cell:single-northern',
        name: 'single',
        hemisphere: 'northern',
        formation: 'thermal',
        coordinates: [
          { x: 760, y: 280 },
          { x: 400, y: 280 },
          { x: 400, y: 60 },
          { x: 760, y: 60 },
        ],
      },
    ])
  })

  it('renders two closed single-cell loops and restores six loops when enabled', () => {
    const { container, rerender } = render(
      <MeridionalSection snapshot={singleSnapshot} />,
    )
    const paths = container.querySelectorAll('path[data-source-id^="circulation-cell:"]')

    expect(paths).toHaveLength(2)
    expect(paths[0]).toHaveAttribute('aria-label', '南半球单圈环流')
    expect(paths[1]).toHaveAttribute('aria-label', '北半球单圈环流')
    expect(paths[0]).toHaveAttribute('d', 'M 40 280 L 400 280 L 400 60 L 40 60 Z')
    expect(paths[1]).toHaveAttribute('d', 'M 760 280 L 400 280 L 400 60 L 760 60 Z')

    rerender(<MeridionalSection snapshot={snapshot} />)

    expect(container.querySelectorAll('path[data-source-id^="circulation-cell:"]')).toHaveLength(6)
    expect(container.querySelector('[data-source-id="circulation-cell:single-southern"]')).not.toBeInTheDocument()
  })

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
