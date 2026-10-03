import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PerformancePanel } from '../../src/features/settings/PerformancePanel'

describe('PerformancePanel', () => {
  it('shows the detected tier and supports automatic or manual selection', () => {
    const onTierChange = vi.fn()
    render(
      <PerformancePanel
        detectedTier="high"
        selectedTier="auto"
        onTierChange={onTierChange}
      />,
    )

    expect(screen.getByText('自动检测：高性能')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: '性能档位' }), {
      target: { value: 'low' },
    })
    expect(onTierChange).toHaveBeenCalledWith('low')
  })
})
