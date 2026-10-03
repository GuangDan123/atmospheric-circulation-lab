import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { GlobePressureBelt } from '../../src/features/globe/projectGlobe'
import { LabelLayer } from '../../src/features/globe/layers/LabelLayer'

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: ReactNode }) => (
    <div data-testid="label-node">{children}</div>
  ),
}))

const pressureBelts = Array.from({ length: 6 }, (_, index) => ({
  sourceId: [
    'pressure-belt:polar-south',
    'pressure-belt:subpolar-south',
    'pressure-belt:subtropical-south',
    'pressure-belt:equatorial-low',
    'pressure-belt:subtropical-north',
    'pressure-belt:polar-north',
  ][index],
  formation: 'direct',
  centerLatitude: index * 10,
  verticalMotion: 'descending',
  adjacentWindBeltIds: [],
  coordinates: { radius: 1, height: index / 10 },
})) as GlobePressureBelt[]

const transform = { scale: 1 }

describe('LabelLayer', () => {
  it('keeps every Html node mounted when density changes from full to reduced', () => {
    const view = render(
      <LabelLayer
        pressureBelts={pressureBelts}
        transform={transform}
        density="full"
        selectedPressureBeltId={null}
      />,
    )
    const fullNodes = screen.getAllByTestId('label-node')

    view.rerender(
      <LabelLayer
        pressureBelts={pressureBelts}
        transform={transform}
        density="reduced"
        selectedPressureBeltId={null}
      />,
    )

    const reducedNodes = screen.getAllByTestId('label-node')
    expect(reducedNodes).toHaveLength(6)
    expect(reducedNodes).toEqual(fullNodes)
  })
})
