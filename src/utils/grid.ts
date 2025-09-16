import { Point, Rect } from './geometry'
import { Grid } from '../models/fileFormat'

// Grid utility functions for hole grid rendering and snapping

export interface GridConfig {
  pitch: number
  origin: Point
  width: number
  height: number
  units: 'mm' | 'inch'
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

// Convert grid configuration to grid config
export function gridToGridConfig(grid: Grid, width: number, height: number, units: 'mm' | 'inch'): GridConfig {
  return {
    pitch: grid.pitch,
    origin: grid.origin,
    width,
    height,
    units
  }
}

// Generate grid hole positions
export function generateGridHoles(config: GridConfig): Point[] {
  const holes: Point[] = []
  const { pitch, origin, width, height } = config
  
  for (let x = origin.x; x <= origin.x + width; x += pitch) {
    for (let y = origin.y; y <= origin.y + height; y += pitch) {
      holes.push({ x, y })
    }
  }
  
  return holes
}

// Get grid bounds
export function getGridBounds(config: GridConfig): Rect {
  return {
    x: config.origin.x,
    y: config.origin.y,
    width: config.width,
    height: config.height
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

// Generate grid lines for rendering
export function generateGridLines(config: GridConfig, viewport: Rect): Array<{
  start: Point
  end: Point
  type: 'major' | 'minor'
}> {
  const lines: Array<{ start: Point; end: Point; type: 'major' | 'minor' }> = []
  const { pitch, origin, width, height } = config
  
  // Vertical lines
  for (let x = origin.x; x <= origin.x + width; x += pitch) {
    if (x >= viewport.x - pitch && x <= viewport.x + viewport.width + pitch) {
      lines.push({
        start: { x, y: origin.y },
        end: { x, y: origin.y + height },
        type: 'major'
      })
    }
  }
  
  // Horizontal lines
  for (let y = origin.y; y <= origin.y + height; y += pitch) {
    if (y >= viewport.y - pitch && y <= viewport.y + viewport.height + pitch) {
      lines.push({
        start: { x: origin.x, y },
        end: { x: origin.x + width, y },
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
