import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import type { Month } from '../../src/domain/atmosphere/types'
import { GlobeView } from '../../src/features/globe/GlobeView'
import { getPerformanceProfile } from '../../src/rendering/performance/profile'
import type { VisibleLayers } from '../../src/state/types'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    dpr,
  }: {
    children: ReactNode
    dpr?: number
  }) => (
    <div data-testid="mock-canvas" data-dpr={dpr}>
      {children}
    </div>
  ),
}))

vi.mock('../../src/features/globe/GlobeScene', () => ({
  GlobeScene: ({
    projection,
    visibleLayers,
    selectedPressureBeltId,
    onSelectPressureBelt,
  }: {
    projection: {
      pressureBelts: readonly { sourceId: string }[]
    }
    visibleLayers: VisibleLayers
    selectedPressureBeltId: string | null
    onSelectPressureBelt?: (id: string) => void
  }) => (
    <>
      {visibleLayers.surface && <div data-testid="globe-layer-surface" />}
      {visibleLayers['latitude-grid'] && (
        <div data-testid="globe-layer-latitude-grid" />
      )}
      {visibleLayers.pressure && (
        <div data-testid="globe-layer-pressure">
          {projection.pressureBelts.map(({ sourceId }) => (
            <button
              key={sourceId}
              type="button"
              data-testid={`globe-${sourceId.replaceAll(':', '-')}`}
              data-selected={selectedPressureBeltId === sourceId ? 'true' : 'false'}
              onClick={() => onSelectPressureBelt?.(sourceId)}
            />
          ))}
        </div>
      )}
      {visibleLayers.wind && <div data-testid="globe-layer-wind" />}
      {visibleLayers['vertical-motion'] && (
        <div data-testid="globe-layer-vertical-motion" />
      )}
      {visibleLayers.labels && <div data-testid="globe-layer-labels" />}
    </>
  ),
}))

const snapshot = deriveAtmosphere({
  month: 6 as Month,
  coriolisEnabled: true,
  rotationDirection: 1,
  rotationStrength: 1,
  frictionStrength: 0,
  seasonalShiftScale: 0.25,
})

const visibleLayers = {
  surface: true,
  'latitude-grid': true,
  pressure: true,
  wind: true,
  'vertical-motion': true,
  labels: true,
} as const

const lowProfile = getPerformanceProfile(
  {
    hardwareConcurrency: 2,
    deviceMemory: 2,
    devicePixelRatio: 3,
    webgl2: true,
    prefersReducedPerformance: false,
  },
  'low',
)

describe('GlobeView', () => {
  it('renders independent scientific layers in WebGL mode', () => {
    render(
      <GlobeView
        snapshot={snapshot}
        visibleLayers={visibleLayers}
        webGLAvailable
      />,
    )

    expect(screen.getByLabelText('三维全球大气环流球面视图')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-surface')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-latitude-grid')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-pressure')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-wind')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-vertical-motion')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-labels')).toBeInTheDocument()
  })

  it('uses the low profile pixel ratio without removing teaching layers', () => {
    render(
      <GlobeView
        snapshot={snapshot}
        visibleLayers={visibleLayers}
        performanceProfile={lowProfile}
        webGLAvailable
      />,
    )

    const canvas = screen.getByTestId('mock-canvas')
    expect(canvas).toHaveAttribute('data-dpr', '1')
    expect(Number(canvas.getAttribute('data-dpr'))).toBeLessThan(3)
    expect(screen.getByTestId('globe-layer-pressure')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-wind')).toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-vertical-motion')).toBeInTheDocument()
  })

  it('dispatches the stable pressure-belt ID when a belt is selected', () => {
    const onSelectPressureBelt = vi.fn()
    render(
      <GlobeView
        snapshot={snapshot}
        visibleLayers={visibleLayers}
        webGLAvailable
        onSelectPressureBelt={onSelectPressureBelt}
      />,
    )

    fireEvent.click(
      screen.getByTestId('globe-pressure-belt-subtropical-north'),
    )

    expect(onSelectPressureBelt).toHaveBeenCalledWith(
      'pressure-belt:subtropical-north',
    )
  })

  it('highlights the selected belt without changing layer availability', () => {
    render(
      <GlobeView
        snapshot={snapshot}
        visibleLayers={visibleLayers}
        webGLAvailable
        selectedPressureBeltId="pressure-belt:subtropical-north"
      />,
    )

    expect(
      screen.getByTestId('globe-pressure-belt-subtropical-north'),
    ).toHaveAttribute('data-selected', 'true')
    expect(screen.getAllByTestId(/^globe-layer-/)).toHaveLength(6)
  })

  it('offers SVG views with the same snapshot when WebGL is unavailable', () => {
    render(
      <GlobeView
        snapshot={snapshot}
        visibleLayers={visibleLayers}
        webGLAvailable={false}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('三维视图不可用')
    expect(
      screen.getByRole('img', { name: '全球大气环流经向剖面' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '全球气压带与风带平面图' }),
    ).toBeInTheDocument()
  })

  it('omits hidden layers without changing the snapshot', () => {
    render(
      <GlobeView
        snapshot={snapshot}
        visibleLayers={{ ...visibleLayers, wind: false, labels: false }}
        webGLAvailable
      />,
    )

    expect(screen.queryByTestId('globe-layer-wind')).not.toBeInTheDocument()
    expect(screen.queryByTestId('globe-layer-labels')).not.toBeInTheDocument()
    expect(screen.getByTestId('globe-layer-pressure')).toBeInTheDocument()
  })
})
