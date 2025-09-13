// Geometric utility functions for canvas operations

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

// Calculate distance between two points
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

// Calculate angle between two points
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

// Rotate point around center
export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point.x - center.x
  const dy = point.y - center.y
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  }
}

// Check if point is inside rectangle
export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

// Check if two rectangles intersect
export function rectsIntersect(rect1: Rect, rect2: Rect): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  )
}

// Snap point to grid
export function snapToGrid(point: Point, gridSize: number, origin: Point = { x: 0, y: 0 }): Point {
  return {
    x: Math.round((point.x - origin.x) / gridSize) * gridSize + origin.x,
    y: Math.round((point.y - origin.y) / gridSize) * gridSize + origin.y
  }
}

// Normalize angle to 0-360 degrees
export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360
  while (angle >= 360) angle -= 360
  return angle
}

// Convert degrees to radians
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

// Convert radians to degrees
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

// Calculate bounding box for multiple points
export function boundingBox(points: Point[]): Rect {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
  
  let minX = points[0].x
  let maxX = points[0].x
  let minY = points[0].y
  let maxY = points[0].y
  
  for (const point of points) {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

// Calculate center of rectangle
export function rectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  }
}

// Scale point by factor
export function scalePoint(point: Point, factor: number): Point {
  return {
    x: point.x * factor,
    y: point.y * factor
  }
}

// Translate point by offset
export function translatePoint(point: Point, offset: Point): Point {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y
  }
}


