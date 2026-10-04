import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LandSeaControls } from '../../src/features/land-sea/LandSeaControls'

describe('LandSeaControls', () => {
  it('exposes a bounded land-sea contrast slider', () => {
    const onChange = vi.fn()

    render(<LandSeaControls landSeaContrast={0} onChange={onChange} />)

    const slider = screen.getByRole('slider', { name: '海陆差异强度' })
    expect(slider).toHaveValue('0')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '1')

    fireEvent.change(slider, { target: { value: '0.5' } })
    expect(onChange).toHaveBeenCalledWith(0.5)
  })
})
