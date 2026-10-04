import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { deriveAtmosphere } from '../../src/domain/atmosphere/deriveAtmosphere'
import { MapProjection } from '../../src/features/map-projection/MapProjection'
import { MeridionalSection } from '../../src/features/meridional-section/MeridionalSection'

it('renders the shared spatial anomaly field and labels the section as a longitude overlay', () => {
  const snapshot = deriveAtmosphere({ month: 1, coriolisEnabled: true, rotationDirection: 1, rotationStrength: 1, frictionStrength: 0, seasonalShiftScale: 0.25, landSeaContrast: 1 })
  render(<><MapProjection snapshot={snapshot} /><MeridionalSection snapshot={snapshot} /></>)
  expect(screen.getAllByLabelText('海陆异常平滑衰减场')).toHaveLength(2)
  expect(screen.getByText('海陆异常为各经度叠加示意，非单一经线剖面')).toBeInTheDocument()
})
