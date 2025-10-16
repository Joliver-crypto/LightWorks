import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BenchCanvas } from '../components/Canvas/BenchCanvas'

// Mock Konva components
vi.mock('react-konva', () => ({
  Stage: ({ children, ...props }: any) => (
    <div data-testid="stage" {...props}>
      {children}
    </div>
  ),
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
  Line: (props: any) => <div data-testid="line" {...props} />,
  Circle: (props: any) => <div data-testid="circle" {...props} />,
  Rect: (props: any) => <div data-testid="rect" {...props} />,
  Group: ({ children }: any) => <div data-testid="group">{children}</div>,
  Text: (props: any) => <div data-testid="text" {...props} />,
}))

// Mock stores
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

vi.mock('../state/useSelectionStore', () => ({
  useSelectionStore: () => ({
    selectedIds: [],
    setSelection: vi.fn(),
    clearSelection: vi.fn()
  })
}))

vi.mock('../state/useUiStore', () => ({
  useUiStore: () => ({
    viewport: { x: 0, y: 0, scale: 1 },
    setViewport: vi.fn(),
    snapToGrid: true,
    gridVisible: true,
    startSelection: vi.fn(),
    updateSelection: vi.fn(),
    endSelection: vi.fn(),
    isSelecting: false,
    selectionBox: null
  })
}))

describe('BenchCanvas', () => {
  it('renders canvas components', () => {
    render(<BenchCanvas />)
    
    expect(screen.getByTestId('stage')).toBeInTheDocument()
    expect(screen.getAllByTestId('layer')).toHaveLength(3) // Grid, Device, Selection layers
  })

})


