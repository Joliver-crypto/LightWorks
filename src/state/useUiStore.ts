import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Viewport {
  x: number
  y: number
  scale: number
}

interface UiState {
  // Canvas state
  viewport: Viewport
  isPanning: boolean
  isSelecting: boolean
  selectionBox: { x: number; y: number; width: number; height: number } | null
  
  // UI state
  snapToGrid: boolean
  gridVisible: boolean
  sidebarLeftWidth: number
  sidebarRightWidth: number
  sidebarLeftCollapsed: boolean
  sidebarRightCollapsed: boolean
  
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
  zoomToSelection: () => void
  panTo: (x: number, y: number) => void
  startPanning: () => void
  stopPanning: () => void
  updatePan: (deltaX: number, deltaY: number) => void
  
  // Selection box
  startSelection: (x: number, y: number) => void
  updateSelection: (x: number, y: number) => void
  endSelection: () => void
  
  // UI toggles
  toggleSnapToGrid: () => void
  toggleGridVisible: () => void
  setSidebarLeftWidth: (width: number) => void
  setSidebarRightWidth: (width: number) => void
  toggleSidebarLeft: () => void
  toggleSidebarRight: () => void
  
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

export const useUiStore = create<UiState>()(
  devtools(
    (set) => ({
      // Initial state
      viewport: DEFAULT_VIEWPORT,
      isPanning: false,
      isSelecting: false,
      selectionBox: null,
      
      // UI state
      snapToGrid: true,
      gridVisible: true,
      sidebarLeftWidth: 300,
      sidebarRightWidth: 350,
      sidebarLeftCollapsed: false,
      sidebarRightCollapsed: false,
      
      // Modals
      commandPaletteOpen: false,
      settingsOpen: false,
      aboutOpen: false,
      
      // Canvas actions
      setViewport: (viewport) => set((state) => ({
        viewport: { ...state.viewport, ...viewport }
      })),
      
      resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),
      
      zoomIn: () => set((state) => ({
        viewport: {
          ...state.viewport,
          scale: Math.min(state.viewport.scale * 1.2, 10)
        }
      })),
      
      zoomOut: () => set((state) => ({
        viewport: {
          ...state.viewport,
          scale: Math.max(state.viewport.scale / 1.2, 0.1)
        }
      })),
      
      zoomToFit: () => {
        // This will be implemented when we have access to project bounds
        set({ viewport: DEFAULT_VIEWPORT })
      },
      
      zoomToSelection: () => {
        // This will be implemented when we have selection bounds
        set({ viewport: DEFAULT_VIEWPORT })
      },
      
      panTo: (x, y) => set((state) => ({
        viewport: { ...state.viewport, x, y }
      })),
      
      startPanning: () => set({ isPanning: true }),
      stopPanning: () => set({ isPanning: false }),
      
      updatePan: (deltaX, deltaY) => set((state) => ({
        viewport: {
          ...state.viewport,
          x: state.viewport.x + deltaX,
          y: state.viewport.y + deltaY
        }
      })),
      
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
      
      setSidebarLeftWidth: (width) => set({ sidebarLeftWidth: Math.max(200, Math.min(600, width)) }),
      setSidebarRightWidth: (width) => set({ sidebarRightWidth: Math.max(200, Math.min(600, width)) }),
      
      toggleSidebarLeft: () => set((state) => ({ 
        sidebarLeftCollapsed: !state.sidebarLeftCollapsed 
      })),
      toggleSidebarRight: () => set((state) => ({ 
        sidebarRightCollapsed: !state.sidebarRightCollapsed 
      })),
      
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
