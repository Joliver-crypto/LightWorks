// Wokwi-inspired navigation utilities for smooth canvas interaction
// Based on patterns from https://github.com/wokwi

export interface NavigationState {
  x: number
  y: number
  scale: number
  isDragging: boolean
  lastPointerPos: { x: number; y: number } | null
  zoomVelocity: number
  panVelocity: { x: number; y: number }
}

export interface NavigationConfig {
  minZoom: number
  maxZoom: number
  zoomSpeed: number
  panSpeed: number
  momentumDecay: number
  bounds?: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

const DEFAULT_CONFIG: NavigationConfig = {
  minZoom: 0.1,
  maxZoom: 10,
  zoomSpeed: 0.1,
  panSpeed: 1.0,
  momentumDecay: 0.85,
}

export class WokwiNavigation {
  private state: NavigationState
  private config: NavigationConfig
  private animationFrameId: number | null = null
  private lastTime = 0

  constructor(initialState: Partial<NavigationState> = {}, config: Partial<NavigationConfig> = {}) {
    this.state = {
      x: 0,
      y: 0,
      scale: 1,
      isDragging: false,
      lastPointerPos: null,
      zoomVelocity: 0,
      panVelocity: { x: 0, y: 0 },
      ...initialState
    }
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // Get current navigation state
  getState(): NavigationState {
    return { ...this.state }
  }

  // Set navigation state (for manual zoom/pan)
  setState(newState: Partial<NavigationState>): void {
    this.state = { ...this.state, ...newState }
  }

  // Update configuration
  updateConfig(newConfig: Partial<NavigationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Start panning (left mouse down)
  startPan(pointerX: number, pointerY: number): void {
    this.state.isDragging = true
    this.state.lastPointerPos = { x: pointerX, y: pointerY }
    this.state.panVelocity = { x: 0, y: 0 }
  }

  // Update panning (mouse move while dragging)
  updatePan(pointerX: number, pointerY: number): void {
    if (!this.state.isDragging || !this.state.lastPointerPos) return

    const deltaX = (pointerX - this.state.lastPointerPos.x) * this.config.panSpeed
    const deltaY = (pointerY - this.state.lastPointerPos.y) * this.config.panSpeed

    // Update position with momentum - FIXED: Add delta instead of subtract for natural panning
    this.state.panVelocity = { x: deltaX, y: deltaY }
    this.state.x += deltaX
    this.state.y += deltaY

    // Apply bounds if configured
    if (this.config.bounds) {
      this.state.x = Math.max(this.config.bounds.minX, Math.min(this.config.bounds.maxX, this.state.x))
      this.state.y = Math.max(this.config.bounds.minY, Math.min(this.config.bounds.maxY, this.state.y))
    }

    this.state.lastPointerPos = { x: pointerX, y: pointerY }
  }

  // End panning (left mouse up)
  endPan(): void {
    this.state.isDragging = false
    this.state.lastPointerPos = null
  }

  // Zoom with momentum (mouse wheel) - inverted for natural behavior
  zoom(pointerX: number, pointerY: number, delta: number): void {
    // Invert delta so scrolling down zooms out (like most apps)
    const invertedDelta = -delta
    const zoomFactor = 1 + (invertedDelta * this.config.zoomSpeed)
    const newScale = Math.max(
      this.config.minZoom,
      Math.min(this.config.maxZoom, this.state.scale * zoomFactor)
    )

    // Calculate zoom velocity for momentum
    this.state.zoomVelocity = (newScale - this.state.scale) * 0.1

    // Zoom centered on pointer position (Wokwi style)
    const scaleRatio = newScale / this.state.scale
    this.state.x = pointerX - (pointerX - this.state.x) * scaleRatio
    this.state.y = pointerY - (pointerY - this.state.y) * scaleRatio
    this.state.scale = newScale

    // Apply bounds if configured
    if (this.config.bounds) {
      this.state.x = Math.max(this.config.bounds.minX, Math.min(this.config.bounds.maxX, this.state.x))
      this.state.y = Math.max(this.config.bounds.minY, Math.min(this.config.bounds.maxY, this.state.y))
    }
  }

  // Smooth zoom to specific scale
  zoomTo(scale: number, centerX?: number, centerY?: number): void {
    const clampedScale = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, scale))
    
    if (centerX !== undefined && centerY !== undefined) {
      const scaleRatio = clampedScale / this.state.scale
      this.state.x = centerX - (centerX - this.state.x) * scaleRatio
      this.state.y = centerY - (centerY - this.state.y) * scaleRatio
    }
    
    this.state.scale = clampedScale
  }

  // Pan to specific position
  panTo(x: number, y: number): void {
    this.state.x = x
    this.state.y = y
    
    // Apply bounds if configured
    if (this.config.bounds) {
      this.state.x = Math.max(this.config.bounds.minX, Math.min(this.config.bounds.maxX, this.state.x))
      this.state.y = Math.max(this.config.bounds.minY, Math.min(this.config.bounds.maxY, this.state.y))
    }
  }

  // Reset to default view
  reset(): void {
    this.state.x = 0
    this.state.y = 0
    this.state.scale = 1
    this.state.zoomVelocity = 0
    this.state.panVelocity = { x: 0, y: 0 }
  }

  // Apply momentum and smooth animations
  update(deltaTime: number): boolean {
    let hasChanges = false

    // Apply zoom momentum
    if (Math.abs(this.state.zoomVelocity) > 0.001) {
      const zoomDelta = this.state.zoomVelocity * deltaTime * 0.016
      this.state.scale = Math.max(
        this.config.minZoom,
        Math.min(this.config.maxZoom, this.state.scale + zoomDelta)
      )
      this.state.zoomVelocity *= this.config.momentumDecay
      hasChanges = true
    }

    // Apply pan momentum
    if (Math.abs(this.state.panVelocity.x) > 0.1 || Math.abs(this.state.panVelocity.y) > 0.1) {
      this.state.x += this.state.panVelocity.x * deltaTime * 0.016
      this.state.y += this.state.panVelocity.y * deltaTime * 0.016
      
      // Apply bounds if configured
      if (this.config.bounds) {
        this.state.x = Math.max(this.config.bounds.minX, Math.min(this.config.bounds.maxX, this.state.x))
        this.state.y = Math.max(this.config.bounds.minY, Math.min(this.config.bounds.maxY, this.state.y))
      }
      
      this.state.panVelocity.x *= this.config.momentumDecay
      this.state.panVelocity.y *= this.config.momentumDecay
      hasChanges = true
    }

    return hasChanges
  }

  // Start momentum animation loop
  startMomentum(): void {
    if (this.animationFrameId) return

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - this.lastTime
      this.lastTime = currentTime

      const hasChanges = this.update(deltaTime)
      
      if (hasChanges) {
        this.animationFrameId = requestAnimationFrame(animate)
      } else {
        this.animationFrameId = null
      }
    }

    this.lastTime = performance.now()
    this.animationFrameId = requestAnimationFrame(animate)
  }

  // Stop momentum animation
  stopMomentum(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.state.x) / this.state.scale,
      y: (screenY - this.state.y) / this.state.scale
    }
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.state.scale + this.state.x,
      y: worldY * this.state.scale + this.state.y
    }
  }
}

// Utility function to create a Wokwi-style navigation instance
export function createWokwiNavigation(
  initialState?: Partial<NavigationState>,
  config?: Partial<NavigationConfig>
): WokwiNavigation {
  return new WokwiNavigation(initialState, config)
}
