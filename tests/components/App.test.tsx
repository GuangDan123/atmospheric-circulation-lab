import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

describe('App', () => {
  it('renders the platform title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '三圈环流因果探究平台' })).toBeInTheDocument()
  })
})
