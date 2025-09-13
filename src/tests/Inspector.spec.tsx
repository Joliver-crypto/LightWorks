import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Inspector } from '../components/Panels/Inspector'

// Mock stores
vi.mock('../state/useSelectionStore', () => ({
  useSelectionStore: () => ({
    selectedIds: [],
    hasSelection: () => false
  })
}))

vi.mock('../state/useProjectStore', () => ({
  useProjectStore: () => ({
    project: {
      table: {
        units: 'mm',
        width: 900,
        height: 600,
        pitch: 25,
        thread: '1/4-20',
        origin: { x: 0, y: 0 }
      },
      devices: []
    }
  })
}))

describe('Inspector', () => {
  it('renders table inspector when no selection', () => {
    render(<Inspector />)
    
    expect(screen.getByText('Table Properties')).toBeInTheDocument()
    expect(screen.getByText('Configure the optics bench table')).toBeInTheDocument()
  })

  it('renders device inspector when device selected', () => {
    // Mock selection store to return a selected device
    vi.mocked(require('../state/useSelectionStore').useSelectionStore).mockReturnValue({
      selectedIds: ['device1'],
      hasSelection: () => true
    })

    vi.mocked(require('../state/useProjectStore').useProjectStore).mockReturnValue({
      project: {
        table: {
          units: 'mm',
          width: 900,
          height: 600,
          pitch: 25,
          thread: '1/4-20',
          origin: { x: 0, y: 0 }
        },
        devices: [
          {
            id: 'device1',
            type: 'laser.generic',
            name: 'Test Laser',
            pos: { x: 100, y: 100, angle: 0 },
            status: 'green'
          }
        ]
      }
    })

    render(<Inspector />)
    
    expect(screen.getByText('Test Laser')).toBeInTheDocument()
  })
})


