// Animation utilities for smooth camera movements and interactions

export interface EasingFunction {
  (t: number): number
}

// Common easing functions
export const easing = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number) => t * t * t,
  spring: (t: number) => 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 2.5)
}

// Interpolate between two values with easing
export function lerp(start: number, end: number, t: number, easingFn: EasingFunction = easing.easeOut): number {
  return start + (end - start) * easingFn(t)
}

// Interpolate between two points
export function lerpPoint(
  start: { x: number; y: number }, 
  end: { x: number; y: number }, 
  t: number, 
  easingFn: EasingFunction = easing.easeOut
): { x: number; y: number } {
  return {
    x: lerp(start.x, end.x, t, easingFn),
    y: lerp(start.y, end.y, t, easingFn)
  }
}

// Throttle function calls to limit frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Debounce function calls to delay execution
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// Animation frame-based smooth interpolation
export class SmoothInterpolator {
  private startValue: number
  private endValue: number
  private duration: number
  private startTime: number
  private easingFn: EasingFunction
  private onUpdate: (value: number) => void
  private onComplete?: () => void
  private animationId?: number

  constructor(
    startValue: number,
    endValue: number,
    duration: number,
    onUpdate: (value: number) => void,
    onComplete?: () => void,
    easingFn: EasingFunction = easing.easeOut
  ) {
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.startTime = performance.now()
    this.easingFn = easingFn
    this.onUpdate = onUpdate
    this.onComplete = onComplete
  }

  start(): void {
    const animate = (currentTime: number) => {
      const elapsed = currentTime - this.startTime
      const progress = Math.min(elapsed / this.duration, 1)
      
      const value = lerp(this.startValue, this.endValue, progress, this.easingFn)
      this.onUpdate(value)
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        this.onComplete?.()
      }
    }
    
    this.animationId = requestAnimationFrame(animate)
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = undefined
    }
  }
}

// Smooth camera movement utility
export class SmoothCamera {
  private currentViewport: { x: number; y: number; scale: number }
  private targetViewport: { x: number; y: number; scale: number }
  private onUpdate: (viewport: { x: number; y: number; scale: number }) => void
  private animationId?: number
  private isAnimating = false

  constructor(
    initialViewport: { x: number; y: number; scale: number },
    onUpdate: (viewport: { x: number; y: number; scale: number }) => void
  ) {
    this.currentViewport = { ...initialViewport }
    this.targetViewport = { ...initialViewport }
    this.onUpdate = onUpdate
  }

  setTarget(viewport: { x: number; y: number; scale: number }): void {
    this.targetViewport = { ...viewport }
    if (!this.isAnimating) {
      this.startAnimation()
    }
  }

  private startAnimation(): void {
    this.isAnimating = true
    
    const animate = () => {
      const dx = this.targetViewport.x - this.currentViewport.x
      const dy = this.targetViewport.y - this.currentViewport.y
      const dScale = this.targetViewport.scale - this.currentViewport.scale
      
      // Use different speeds for position and scale
      const positionSpeed = 0.1
      const scaleSpeed = 0.15
      
      this.currentViewport.x += dx * positionSpeed
      this.currentViewport.y += dy * positionSpeed
      this.currentViewport.scale += dScale * scaleSpeed
      
      this.onUpdate({ ...this.currentViewport })
      
      // Check if we're close enough to target
      const threshold = 0.1
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold && Math.abs(dScale) < threshold) {
        this.currentViewport = { ...this.targetViewport }
        this.isAnimating = false
        this.onUpdate({ ...this.currentViewport })
      } else {
        this.animationId = requestAnimationFrame(animate)
      }
    }
    
    this.animationId = requestAnimationFrame(animate)
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = undefined
      this.isAnimating = false
    }
  }
}

