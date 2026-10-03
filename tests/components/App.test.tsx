import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
}))

vi.mock('../../src/features/globe/GlobeScene', () => ({
  GlobeScene: ({
    labelDensity,
  }: {
    labelDensity: 'full' | 'standard' | 'reduced'
  }) => (
    <div
      data-testid="globe-scene"
      data-label-density={labelDensity}
    />
  ),
}))

import App from '../../src/App'

afterEach(() => {
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
})

describe('App', () => {
  it('renders the platform title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: '三圈环流因果探究平台' }),
    ).toBeInTheDocument()
  })

  it('uses the performance profile label density until the teacher overrides it', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(
      {} as WebGL2RenderingContext,
    )

    render(<App />)

    fireEvent.change(
      screen.getByRole('combobox', { name: '性能档位' }),
      {
        target: { value: 'low' },
      },
    )

    expect(screen.getByRole('combobox', { name: '标签密度' })).toHaveValue(
      'reduced',
    )
    expect(screen.getByTestId('globe-scene')).toHaveAttribute(
      'data-label-density',
      'reduced',
    )

    fireEvent.change(
      screen.getByRole('combobox', { name: '标签密度' }),
      {
        target: { value: 'full' },
      },
    )

    expect(screen.getByTestId('globe-scene')).toHaveAttribute(
      'data-label-density',
      'full',
    )
  })
})
