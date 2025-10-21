import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { WokwiNavigation, createWokwiNavigation } from '../utils/wokwiNavigation'

interface Viewport {
  x: number
  y: number
  scale: number
}

interface CameraBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

interface CameraSettings {
  minZoom: number
  maxZoom: number
  zoomSpeed: number
  panSpeed: number
  easing: boolean
  bounds: CameraBounds | null
}

interface UiState {
  // Canvas state
  viewport: Viewport
  isPanning: boolean
  isSelecting: boolean
  selectionBox: { x: number; y: number; width: number; height: number } | null
  
  // Camera settings
  cameraSettings: CameraSettings
  isDragging: boolean
  dragStartPos: { x: number; y: number } | null
  
  // Wokwi-style navigation
  wokwiNavigation: WokwiNavigation | null
  
  // UI state
  snapToGrid: boolean
  gridVisible: boolean
  performanceMode: boolean
  sidebarLeftWidth: number
  sidebarRightWidth: number
  sidebarLeftCollapsed: boolean
  sidebarRightCollapsed: boolean
  
  // Canvas dimensions
  canvasWidth: number
  canvasHeight: number
  
  // Modals and panels
  commandPaletteOpen: boolean
  settingsOpen: boolean
  aboutOpen: boolean
  
  // Canvas actions
  setViewport: (viewport: Partial<Viewport>) => void
  resetViewport: () => void
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
  zoomToFitWithViewport: (viewportWidth: number, viewportHeight: number) => void
  zoomToSelection: () => void
  zoomToCursor: (cursorX: number, cursorY: number, delta: number) => void
  panTo: (x: number, y: number) => void
  startPanning: () => void
  stopPanning: () => void
  updatePan: (deltaX: number, deltaY: number) => void
  
  // Enhanced camera controls
  setCameraBounds: (bounds: CameraBounds | null) => void
  clampViewport: (viewport: Viewport) => Viewport
  startDragging: (x: number, y: number) => void
  updateDragging: (x: number, y: number) => void
  stopDragging: () => void
  
  // Wokwi-style navigation methods
  initWokwiNavigation: (bounds?: CameraBounds) => void
  wokwiStartPan: (x: number, y: number) => void
  wokwiUpdatePan: (x: number, y: number) => void
  wokwiEndPan: () => void
  wokwiZoom: (x: number, y: number, delta: number) => void
  updateWokwiNavigation: () => void
  
  // Selection box
  startSelection: (x: number, y: number) => void
  updateSelection: (x: number, y: number) => void
  endSelection: () => void
  
  // UI toggles
  toggleSnapToGrid: () => void
  toggleGridVisible: () => void
  togglePerformanceMode: () => void
  setSidebarLeftWidth: (width: number) => void
  setSidebarRightWidth: (width: number) => void
  toggleSidebarLeft: () => void
  toggleSidebarRight: () => void
  
  // Canvas actions
  setCanvasSize: (width: number, height: number) => void
  
  // Modal actions
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openSettings: () => void
  closeSettings: () => void
  openAbout: () => void
  closeAbout: () => void
}

const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  scale: 1
}

const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  minZoom: 0.1,
  maxZoom: 5.0,
  zoomSpeed: 1.1,
  panSpeed: 1.0,
  easing: true,
  bounds: null
}

export const useUiStore = create<UiState>()(
  devtools(
    (set) => ({
      // Initial state
      viewport: DEFAULT_VIEWPORT,
      isPanning: false,
      isSelecting: false,
      selectionBox: null,
      
      // Camera settings
      cameraSettings: DEFAULT_CAMERA_SETTINGS,
      isDragging: false,
      dragStartPos: null,
      
      // Wokwi-style navigation
      wokwiNavigation: null,
      
      // UI state
      snapToGrid: true,
      gridVisible: true,
      performanceMode: true,
      sidebarLeftWidth: 300,
      sidebarRightWidth: 350,
      sidebarLeftCollapsed: false,
      sidebarRightCollapsed: false,
      
      // Canvas dimensions
      canvasWidth: 800,
      canvasHeight: 600,
      
      // Modals
      commandPaletteOpen: false,
      settingsOpen: false,
      aboutOpen: false,
      
      // Canvas actions
      setViewport: (viewport) => set((state) => ({
        viewport: { ...state.viewport, ...viewport }
      })),
      
      resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),
      
      zoomIn: () => set((state) => {
        const newScale = Math.min(
          state.viewport.scale * state.cameraSettings.zoomSpeed,
          state.cameraSettings.maxZoom
        )
        
        const newViewport = {
          ...state.viewport,
          scale: newScale
        }
        
        // Update Wokwi navigation state to match
        if (state.wokwiNavigation) {
          state.wokwiNavigation.setState({
            x: newViewport.x,
            y: newViewport.y,
            scale: newViewport.scale
          })
        }
        
        return {
          viewport: newViewport
        }
      }),
      
      zoomOut: () => set((state) => {
        const newScale = Math.max(
          state.viewport.scale / state.cameraSettings.zoomSpeed,
          state.cameraSettings.minZoom
        )
        
        const newViewport = {
          ...state.viewport,
          scale: newScale
        }
        
        // Update Wokwi navigation state to match
        if (state.wokwiNavigation) {
          state.wokwiNavigation.setState({
            x: newViewport.x,
            y: newViewport.y,
            scale: newViewport.scale
          })
        }
        
        return {
          viewport: newViewport
        }
      }),
      
      zoomToFit: () => set((state) => {
        // Use the stored canvas dimensions
        const bounds = state.cameraSettings.bounds
        
        if (!bounds) {
          // Fallback to default viewport if no bounds are set
          return { viewport: DEFAULT_VIEWPORT }
        }
        
        // Calculate content dimensions from bounds
        const contentWidth = bounds.maxX - bounds.minX
        const contentHeight = bounds.maxY - bounds.minY
        
        // Calculate scale to fit content in viewport with some padding
        const padding = 50
        const scaleX = (state.canvasWidth - padding * 2) / contentWidth
        const scaleY = (state.canvasHeight - padding * 2) / contentHeight
        const scale = Math.min(scaleX, scaleY, state.cameraSettings.maxZoom)
        
        // Center the content
        const scaledWidth = contentWidth * scale
        const scaledHeight = contentHeight * scale
        const x = (state.canvasWidth - scaledWidth) / 2 - bounds.minX * scale
        const y = (state.canvasHeight - scaledHeight) / 2 - bounds.minY * scale
        
        const newViewport = {
          x,
          y,
          scale: Math.max(scale, state.cameraSettings.minZoom)
        }
        
        
        // Update Wokwi navigation state to match
        if (state.wokwiNavigation) {
          state.wokwiNavigation.setState({
            x: newViewport.x,
            y: newViewport.y,
            scale: newViewport.scale
          })
        }
        
        return {
          viewport: newViewport
        }
      }),
      
      zoomToFitWithViewport: (viewportWidth, viewportHeight) => set((state) => {
        // Get the current camera bounds from the state
        const bounds = state.cameraSettings.bounds
        
        if (!bounds) {
          // Fallback to default viewport if no bounds are set
          return { viewport: DEFAULT_VIEWPORT }
        }
        
        // Calculate content dimensions from bounds
        const contentWidth = bounds.maxX - bounds.minX
        const contentHeight = bounds.maxY - bounds.minY
        
        // Calculate scale to fit content in viewport with some padding
        const padding = 50
        const scaleX = (viewportWidth - padding * 2) / contentWidth
        const scaleY = (viewportHeight - padding * 2) / contentHeight
        const scale = Math.min(scaleX, scaleY, state.cameraSettings.maxZoom)
        
        // Center the content
        const scaledWidth = contentWidth * scale
        const scaledHeight = contentHeight * scale
        const x = (viewportWidth - scaledWidth) / 2 - bounds.minX * scale
        const y = (viewportHeight - scaledHeight) / 2 - bounds.minY * scale
        
        return {
          viewport: {
            x,
            y,
            scale: Math.max(scale, state.cameraSettings.minZoom)
          }
        }
      }),
      
      zoomToSelection: () => {
        // This will be implemented when we have selection bounds
        set({ viewport: DEFAULT_VIEWPORT })
      },
      
      zoomToCursor: (cursorX, cursorY, delta) => set((state) => {
        const { cameraSettings } = state
        const scaleBy = delta > 0 ? cameraSettings.zoomSpeed : 1 / cameraSettings.zoomSpeed
        const newScale = Math.max(
          cameraSettings.minZoom,
          Math.min(cameraSettings.maxZoom, state.viewport.scale * scaleBy)
        )
        
        // Calculate new camera position to keep cursor position stable
        const scaleRatio = newScale / state.viewport.scale
        const newX = cursorX - (cursorX - state.viewport.x) * scaleRatio
        const newY = cursorY - (cursorY - state.viewport.y) * scaleRatio
        
        const newViewport = { x: newX, y: newY, scale: newScale }
        const clampedViewport = state.clampViewport(newViewport)
        
        return { viewport: clampedViewport }
      }),
      
      panTo: (x, y) => set((state) => ({
        viewport: { ...state.viewport, x, y }
      })),
      
      startPanning: () => set({ isPanning: true }),
      stopPanning: () => set({ isPanning: false }),
      
      updatePan: (deltaX, deltaY) => set((state) => {
        const newViewport = {
          ...state.viewport,
          x: state.viewport.x + deltaX * state.cameraSettings.panSpeed,
          y: state.viewport.y + deltaY * state.cameraSettings.panSpeed
        }
        const clampedViewport = state.clampViewport(newViewport)
        return { viewport: clampedViewport }
      }),
      
      // Selection box
      startSelection: (x, y) => set({
        isSelecting: true,
        selectionBox: { x, y, width: 0, height: 0 }
      }),
      
      updateSelection: (x, y) => set((state) => {
        if (!state.isSelecting || !state.selectionBox) return state
        
        const startX = state.selectionBox.x
        const startY = state.selectionBox.y
        const width = x - startX
        const height = y - startY
        
        return {
          selectionBox: {
            x: Math.min(startX, x),
            y: Math.min(startY, y),
            width: Math.abs(width),
            height: Math.abs(height)
          }
        }
      }),
      
      endSelection: () => set({
        isSelecting: false,
        selectionBox: null
      }),
      
      // UI toggles
      toggleSnapToGrid: () => set((state) => ({
        snapToGrid: !state.snapToGrid
      })),
      
      toggleGridVisible: () => set((state) => ({
        gridVisible: !state.gridVisible
      })),
      
      togglePerformanceMode: () => set((state) => ({
        performanceMode: !state.performanceMode
      })),
      
      setSidebarLeftWidth: (width) => set({ sidebarLeftWidth: Math.max(200, Math.min(600, width)) }),
      setSidebarRightWidth: (width) => set({ sidebarRightWidth: Math.max(200, Math.min(600, width)) }),
      
      toggleSidebarLeft: () => set((state) => ({ 
        sidebarLeftCollapsed: !state.sidebarLeftCollapsed 
      })),
      toggleSidebarRight: () => set((state) => ({ 
        sidebarRightCollapsed: !state.sidebarRightCollapsed 
      })),
      
      // Enhanced camera controls
      setCameraBounds: (bounds) => set((state) => ({
        cameraSettings: { ...state.cameraSettings, bounds }
      })),
      
      clampViewport: (viewport: Viewport): Viewport => {
        const state = useUiStore.getState()
        const { bounds } = state.cameraSettings
        
        if (!bounds) return viewport
        
        // Calculate dynamic bounds based on zoom level
        // When zoomed in more, allow more panning to see the full content
        const zoomFactor = Math.max(1, viewport.scale)
        const dynamicPadding = Math.max(200, (bounds.maxX - bounds.minX) * 0.3 * zoomFactor)
        
        const dynamicBounds = {
          minX: bounds.minX - dynamicPadding,
          maxX: bounds.maxX + dynamicPadding,
          minY: bounds.minY - dynamicPadding,
          maxY: bounds.maxY + dynamicPadding
        }
        
        return {
          x: Math.max(dynamicBounds.minX, Math.min(dynamicBounds.maxX, viewport.x)),
          y: Math.max(dynamicBounds.minY, Math.min(dynamicBounds.maxY, viewport.y)),
          scale: Math.max(
            state.cameraSettings.minZoom,
            Math.min(state.cameraSettings.maxZoom, viewport.scale)
          )
        }
      },
      
      startDragging: (x: number, y: number) => set({
        isDragging: true,
        dragStartPos: { x, y }
      }),
      
      updateDragging: (x: number, y: number) => set((state) => {
        if (!state.isDragging || !state.dragStartPos) return state
        
        const deltaX = x - state.dragStartPos.x
        const deltaY = y - state.dragStartPos.y
        
        // Only update if movement is significant enough (throttling)
        if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) return state
        
        const newViewport = {
          ...state.viewport,
          x: state.viewport.x - deltaX,
          y: state.viewport.y - deltaY
        }
        
        const clampedViewport = state.clampViewport(newViewport)
        
        return {
          viewport: clampedViewport,
          dragStartPos: { x, y }
        }
      }),
      
      stopDragging: () => set({
        isDragging: false,
        dragStartPos: null
      }),
      
      // Wokwi-style navigation methods
      initWokwiNavigation: (bounds?: CameraBounds) => set((state) => {
        const navigation = createWokwiNavigation(
          {
            x: state.viewport.x,
            y: state.viewport.y,
            scale: state.viewport.scale
          },
          {
            minZoom: state.cameraSettings.minZoom,
            maxZoom: state.cameraSettings.maxZoom,
            zoomSpeed: 0.1,
            panSpeed: 1.0,
            momentumDecay: 0.85,
            bounds: bounds ? {
              minX: bounds.minX,
              maxX: bounds.maxX,
              minY: bounds.minY,
              maxY: bounds.maxY
            } : undefined
          }
        )
        
        // Start momentum animation loop
        navigation.startMomentum()
        
        return { wokwiNavigation: navigation }
      }),
      
      wokwiStartPan: (x: number, y: number) => set((state) => {
        if (state.wokwiNavigation) {
          state.wokwiNavigation.startPan(x, y)
        }
        return state
      }),
      
      wokwiUpdatePan: (x: number, y: number) => set((state) => {
        if (state.wokwiNavigation) {
          state.wokwiNavigation.updatePan(x, y)
          const navState = state.wokwiNavigation!.getState()
          const newViewport = {
            x: navState.x,
            y: navState.y,
            scale: navState.scale
          }
          const clampedViewport = state.clampViewport(newViewport)
          return {
            viewport: clampedViewport
          }
        }
        return state
      }),
      
      wokwiEndPan: () => set((state) => {
        if (state.wokwiNavigation) {
          state.wokwiNavigation.endPan()
        }
        return state
      }),
      
      wokwiZoom: (x: number, y: number, delta: number) => set((state) => {
        if (state.wokwiNavigation) {
          state.wokwiNavigation.zoom(x, y, delta)
          const navState = state.wokwiNavigation!.getState()
          const newViewport = {
            x: navState.x,
            y: navState.y,
            scale: navState.scale
          }
          const clampedViewport = state.clampViewport(newViewport)
          return {
            viewport: clampedViewport
          }
        }
        return state
      }),
      
      updateWokwiNavigation: () => set((state) => {
        if (state.wokwiNavigation) {
          const navState = state.wokwiNavigation.getState()
          const newViewport = {
            x: navState.x,
            y: navState.y,
            scale: navState.scale
          }
          // Apply bounds clamping to the viewport
          const clampedViewport = state.clampViewport(newViewport)
          return {
            viewport: clampedViewport
          }
        }
        return state
      }),
      
      // Canvas actions
      setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
      
      // Modal actions
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      openAbout: () => set({ aboutOpen: true }),
      closeAbout: () => set({ aboutOpen: false })
    }),
    {
      name: 'ui-store',
    }
  )
)
