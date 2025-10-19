import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import { useFileStore } from '../../storage/useFileStore'
import { useSelectionStore } from '../../state/useSelectionStore'
import { useUiStore } from '../../state/useUiStore'
import { GridLayer } from './GridLayer'
import { DeviceLayer } from './DeviceLayer'
import { SelectionLayer } from './SelectionLayer'
import { createShortcutHandler, SHORTCUTS } from '../../utils/shortcuts'
import { snapToHole, gridToGridConfig } from '../../utils/grid'
import { ComponentType } from '../../models/fileFormat'
import { deviceRegistry } from '../../../hardware/deviceRegistry'

export function BenchCanvas() {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  
  const { currentTable, addComponent, moveComponent } = useFileStore()
  const { selectedIds, setSelection, clearSelection } = useSelectionStore()
  const { 
    viewport, 
    gridVisible,
    performanceMode,
    startSelection,
    updateSelection,
    endSelection,
    isSelecting,
    selectionBox,
    toggleSidebarLeft,
    toggleSidebarRight,
    setCameraBounds,
    // Wokwi-style navigation
    initWokwiNavigation,
    wokwiStartPan,
    wokwiUpdatePan,
    wokwiEndPan,
    wokwiZoom,
    updateWokwiNavigation
  } = useUiStore()

  // Handle container resize, including sidebar width changes
  useEffect(() => {
    if (!containerRef.current) return

    const update = () => {
      const rect = containerRef.current!.getBoundingClientRect()
      setStageSize({ width: rect.width, height: rect.height })
    }

    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(containerRef.current)

    window.addEventListener('orientationchange', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  // Set up camera bounds and Wokwi navigation when table changes
  useEffect(() => {
    if (currentTable) {
      const table = currentTable.table
      const gridConfig = gridToGridConfig(table.grid, table.width, table.height, table.units)
      
      // Set camera bounds to table area with some padding
      const padding = 200 // pixels
      const bounds = {
        minX: -padding,
        maxX: gridConfig.width + padding,
        minY: -padding,
        maxY: gridConfig.height + padding
      }
      
      setCameraBounds(bounds)
      initWokwiNavigation(bounds)
    } else {
      setCameraBounds(null)
      initWokwiNavigation()
    }
  }, [currentTable, setCameraBounds, initWokwiNavigation])

  // Update Wokwi navigation momentum
  useEffect(() => {
    const interval = setInterval(() => {
      updateWokwiNavigation()
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [updateWokwiNavigation])

  // Handle keyboard shortcuts
  useEffect(() => {
    const shortcuts = {
      [SHORTCUTS.DESELECT]: clearSelection,
      [SHORTCUTS.SELECT_ALL]: () => {
        // TODO: Implement select all
        console.log('Select all')
      },
      [SHORTCUTS.DUPLICATE]: () => {
        // TODO: Implement duplicate
        console.log('Duplicate')
      },
      [SHORTCUTS.DELETE]: () => {
        // TODO: Implement delete
        console.log('Delete')
      },
      [SHORTCUTS.ROTATE]: () => {
        // TODO: Implement rotate
        console.log('Rotate')
      },
      [SHORTCUTS.ROTATE_REVERSE]: () => {
        // TODO: Implement reverse rotate
        console.log('Reverse rotate')
      },
      [SHORTCUTS.TOGGLE_LEFT_SIDEBAR]: () => {
        toggleSidebarLeft()
      },
      [SHORTCUTS.TOGGLE_RIGHT_SIDEBAR]: () => {
        toggleSidebarRight()
      },
    }

    const handler = createShortcutHandler(shortcuts)
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [clearSelection, toggleSidebarLeft, toggleSidebarRight])

  // Handle stage events
  const handleStageClick = (e: any) => {
    const stage = e.target.getStage()
    const clickedOnEmpty = e.target === stage
    // Only clear selection if clicking on empty stage area (not on table or devices)
    if (clickedOnEmpty) {
      clearSelection()
    }
  }

  const handleStageMouseDown = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (pos) {
      // Start Wokwi navigation for panning - allow panning from anywhere
      wokwiStartPan(pos.x, pos.y)
      
      // Only start selection box if clicking on empty space
      const clickedOnEmpty = e.target === stage
      if (clickedOnEmpty) {
        startSelection(pos.x, pos.y)
      }
    }
  }

  const handleStageMouseMove = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (pos) {
      if (isSelecting) {
        updateSelection(pos.x, pos.y)
      }
      // Always update Wokwi navigation for smooth panning
      wokwiUpdatePan(pos.x, pos.y)
    }
  }

  const handleStageMouseUp = (_e: any) => {
    if (isSelecting) {
      endSelection()
    }
    // End Wokwi navigation
    wokwiEndPan()
  }

  // Handle wheel zoom with Wokwi-style smooth zooming
  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    
    const stage = e.target.getStage()
    const pointer = stage.getPointerPosition()
    
    if (pointer) {
      wokwiZoom(pointer.x, pointer.y, e.evt.deltaY)
    }
  }

  /**
   * Handles device drop from the palette
   * Creates new components when devices are dropped onto the canvas
   * @param e - Drag and drop event
   */
  const handleDeviceDrop = (e: any) => {
    e.preventDefault()
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.type === 'device') {
        const stage = stageRef.current
        if (!stage) return
        
        const pointer = stage.getPointerPosition()
        if (!pointer) return
        
        // Snap to grid hole for new device placement
        const snapped = snapToHole(pointer, currentTable?.table.grid || { 
          pitch: 25, 
          thread: '1/4-20',
          origin: { x: 0, y: 0 },
          snapToHoles: true
        })
        
        // Create new component with snapped position
        if (currentTable) {
          // Always create new devices with 1x1 size (building block starts small)
          const deviceSize = { width: 1, height: 1 };
          
          const newComponent = {
            type: data.deviceType as ComponentType,
            label: data.deviceType.split('.').pop() || 'Device',
            pose: { x: snapped.x, y: snapped.y, theta: 0 },
            holePose: { i: Math.round(snapped.x / 25), j: Math.round(snapped.y / 25), theta: 0 },
            locked: false,
            size: deviceSize,
            meta: {}
          }
          
          addComponent(newComponent)
        }
      }
    } catch (error) {
      console.error('Failed to parse drop data:', error)
    }
  }

  const handleDragOver = (e: any) => {
    e.preventDefault()
  }

  /**
   * Device drag handling - camera stays stable during device dragging
   * This follows Tinkercad's approach of keeping camera fixed during component manipulation
   */
  const handleDeviceDragMove = useCallback(() => {
    // Camera remains stable during device dragging
    // This prevents the "jumping" effect that happens when camera follows dragged objects
    // The user can still pan manually if needed, but dragging devices won't move the camera
  }, [])

  /**
   * Reset drag start position when drag ends
   * This cleans up the drag state
   */
  const handleDeviceDragEnd = useCallback(() => {
    // Clean up any drag state if needed
  }, [])

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-gray-100 relative overflow-hidden"
      onDrop={handleDeviceDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        x={viewport.x}
        y={viewport.y}
        onClick={handleStageClick}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onWheel={handleWheel}
        draggable={false}
      >
        <Layer>
          {/* Grid layer - shows the optical table grid */}
          {gridVisible && currentTable && (
            <GridLayer 
              table={currentTable.table}
              viewport={viewport}
              stageSize={stageSize}
              onTableClick={clearSelection}
              showCoordinates={!performanceMode}
              highlightHoles={!performanceMode}
            />
          )}
        </Layer>
        
        <Layer>
          {/* Device layer - renders all optical devices */}
          {currentTable && (
            <DeviceLayer 
              devices={currentTable.components}
              selectedIds={selectedIds}
              onDeviceSelect={(id) => setSelection([id])}
              onDeviceMove={(id, pos) => moveComponent(id, pos)}
              onDeviceRotate={(id, angle) => {
                // TODO: Update device angle
                console.log('Rotate device:', id, angle)
              }}
              onDeviceDragMove={handleDeviceDragMove}
              onDeviceDragEnd={handleDeviceDragEnd}
              grid={currentTable.table.grid}
            />
          )}
        </Layer>
        
        <Layer>
          {/* Selection layer - shows selection box during multi-select */}
          <SelectionLayer 
            selectionBox={selectionBox}
            isSelecting={isSelecting}
          />
        </Layer>
      </Stage>
    </div>
  )
}