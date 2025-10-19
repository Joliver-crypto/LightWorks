import { Point, Rect } from './geometry'
import { Grid } from '../models/fileFormat'

// Grid utility functions for hole grid rendering and snapping

export interface GridConfig {
  pitch: number
  origin: Point
  width: number
  height: number
  units: 'mm' | 'inch'
  nx: number  // Number of holes in X direction
  ny: number  // Number of holes in Y direction
  margins?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

// Snap point to nearest grid hole (center-based)
export function snapToHole(p: Point, grid: Grid): Point {
  const pitch = grid.pitch;
  const ox = grid.origin.x;
  const oy = grid.origin.y;

  const gx = Math.round((p.x - ox) / pitch) * pitch + ox;
  const gy = Math.round((p.y - oy) / pitch) * pitch + oy;

  return { x: gx, y: gy };
}

// Convert grid configuration to grid config using hole count
export function gridToGridConfig(grid: Grid, width: number, height: number, units: 'mm' | 'inch'): GridConfig {
  // Calculate actual grid dimensions based on hole count
  const nx = grid.nx || 10  // Default to 10 if not specified
  const ny = grid.ny || 10  // Default to 10 if not specified
  
  // Calculate grid width and height based on hole count
  const gridWidth = (nx - 1) * grid.pitch
  const gridHeight = (ny - 1) * grid.pitch
  
  // Get margins with defaults
  const margins = grid.margins || {
    top: 38.1,    // 1.5 inches default
    bottom: 38.1,
    left: 38.1,
    right: 38.1
  }
  
  return {
    pitch: grid.pitch,
    origin: grid.origin,
    width: gridWidth,      // Use calculated width based on holes
    height: gridHeight,    // Use calculated height based on holes
    units,
    nx,                    // Store hole count
    ny,                    // Store hole count
    margins                // Include margins for border calculation
  }
}

// Generate grid hole positions based on hole count (1-based indexing)
export function generateGridHoles(config: GridConfig): Point[] {
  const holes: Point[] = []
  const { pitch, origin, nx, ny } = config
  
  // Generate holes based on nx and ny with 1-based indexing
  for (let i = 1; i <= nx; i++) {
    for (let j = 1; j <= ny; j++) {
      const x = origin.x + (i - 1) * pitch  // Convert to 0-based for calculation
      const y = origin.y + (j - 1) * pitch  // Convert to 0-based for calculation
      holes.push({ x, y })
    }
  }
  
  return holes
}

// Get grid bounds based on hole count
export function getGridBounds(config: GridConfig): Rect {
  return {
    x: config.origin.x,
    y: config.origin.y,
    width: config.width,
    height: config.height
  }
}

// Get table border bounds including margins
export function getTableBorderBounds(config: GridConfig): Rect {
  const margins = config.margins || {
    top: 38.1,
    bottom: 38.1,
    left: 38.1,
    right: 38.1
  }
  
  return {
    x: config.origin.x - margins.left,
    y: config.origin.y - margins.top,
    width: config.width + margins.left + margins.right,
    height: config.height + margins.top + margins.bottom
  }
}

// Snap point to nearest grid hole
export function snapToGridHole(point: Point, config: GridConfig): Point {
  const { pitch, origin } = config
  return {
    x: Math.round((point.x - origin.x) / pitch) * pitch + origin.x,
    y: Math.round((point.y - origin.y) / pitch) * pitch + origin.y
  }
}

// Check if point is on grid hole
export function isOnGridHole(point: Point, config: GridConfig, tolerance: number = 2): boolean {
  const snapped = snapToGridHole(point, config)
  const distance = Math.sqrt(
    Math.pow(point.x - snapped.x, 2) + Math.pow(point.y - snapped.y, 2)
  )
  return distance <= tolerance
}

// Get grid hole at position
export function getGridHoleAt(point: Point, config: GridConfig): Point | null {
  const snapped = snapToGridHole(point, config)
  const bounds = getGridBounds(config)
  
  if (
    snapped.x >= bounds.x &&
    snapped.x <= bounds.x + bounds.width &&
    snapped.y >= bounds.y &&
    snapped.y <= bounds.y + bounds.height
  ) {
    return snapped
  }
  
  return null
}

// Calculate grid cell size for rendering
export function getGridCellSize(config: GridConfig, viewportScale: number): number {
  return Math.max(1, config.pitch * viewportScale * 0.2) // 20% of pitch as hole size (larger holes)
}

// Generate grid lines for rendering based on hole count (1-based indexing)
export function generateGridLines(config: GridConfig, viewport: Rect): Array<{
  start: Point
  end: Point
  type: 'major' | 'minor'
}> {
  const lines: Array<{ start: Point; end: Point; type: 'major' | 'minor' }> = []
  const { pitch, origin, nx, ny } = config
  
  // Vertical lines - based on nx (number of columns) with 1-based indexing
  for (let i = 1; i <= nx; i++) {
    const x = origin.x + (i - 1) * pitch  // Convert to 0-based for calculation
    if (x >= viewport.x - pitch && x <= viewport.x + viewport.width + pitch) {
      lines.push({
        start: { x, y: origin.y },
        end: { x, y: origin.y + (ny - 1) * pitch },
        type: 'major'
      })
    }
  }
  
  // Horizontal lines - based on ny (number of rows) with 1-based indexing
  for (let j = 1; j <= ny; j++) {
    const y = origin.y + (j - 1) * pitch  // Convert to 0-based for calculation
    if (y >= viewport.y - pitch && y <= viewport.y + viewport.height + pitch) {
      lines.push({
        start: { x: origin.x, y },
        end: { x: origin.x + (nx - 1) * pitch, y },
        type: 'major'
      })
    }
  }
  
  return lines
}

// Convert grid units to pixels
export function gridToPixels(point: Point, _config: GridConfig, scale: number): Point {
  return {
    x: point.x * scale,
    y: point.y * scale
  }
}

// Convert pixels to grid units
export function pixelsToGrid(point: Point, _config: GridConfig, scale: number): Point {
  return {
    x: point.x / scale,
    y: point.y / scale
  }
}

// Get grid units label
export function getGridUnitsLabel(units: 'mm' | 'inch'): string {
  return units === 'mm' ? 'mm' : 'in'
}

// Format grid value with units
export function formatGridValue(value: number, units: 'mm' | 'inch'): string {
  const precision = units === 'mm' ? 1 : 3
  return `${value.toFixed(precision)} ${getGridUnitsLabel(units)}`
}

// Get hole coordinates from world position (1-based indexing)
export function worldToHoleCoords(point: Point, grid: Grid): { i: number; j: number } {
  const i = Math.round((point.x - grid.origin.x) / grid.pitch) + 1  // Convert to 1-based
  const j = Math.round((point.y - grid.origin.y) / grid.pitch) + 1  // Convert to 1-based
  return { i, j }
}

// Get world position from hole coordinates (1-based indexing)
export function holeCoordsToWorld(i: number, j: number, grid: Grid): Point {
  return {
    x: grid.origin.x + (i - 1) * grid.pitch,  // Convert from 1-based to 0-based
    y: grid.origin.y + (j - 1) * grid.pitch   // Convert from 1-based to 0-based
  }
}