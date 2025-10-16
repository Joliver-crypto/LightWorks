import { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import { useFileStore } from '../../storage/useFileStore'
import { useSelectionStore } from '../../state/useSelectionStore'
import { useUiStore } from '../../state/useUiStore'
import { GridLayer } from './GridLayer'
import { DeviceLayer } from './DeviceLayer'
import { SelectionLayer } from './SelectionLayer'
import { createShortcutHandler, SHORTCUTS } from '../../utils/shortcuts'
import { snapToHole } from '../../utils/grid'
import { ComponentType } from '../../models/fileFormat'

export function BenchCanvas() {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  
  const { currentTable, addComponent, moveComponent } = useFileStore()
  const { selectedIds, setSelection, clearSelection } = useSelectionStore()
  const { 
    viewport, 
    setViewport, 
    gridVisible,
    startSelection,
    updateSelection,
    endSelection,
    isSelecting,
    selectionBox,
    toggleSidebarLeft,
    toggleSidebarRight,
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    sidebarLeftWidth,
    sidebarRightWidth
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
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      clearSelection()
    }
  }

  const handleStageMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      const pos = e.target.getPointerPosition()
      startSelection(pos.x, pos.y)
    }
  }

  const handleStageMouseMove = (e: any) => {
    if (isSelecting) {
      const pos = e.target.getPointerPosition()
      updateSelection(pos.x, pos.y)
    }
  }

  const handleStageMouseUp = (_e: any) => {
    if (isSelecting) {
      endSelection()
    }
  }

  // Handle wheel zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault()
    
    const scaleBy = 1.1
    const stage = e.target.getStage()
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clampedScale = Math.max(0.1, Math.min(10, newScale))
    
    setViewport({
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    })
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
          const newComponent = {
            type: data.deviceType as ComponentType,
            label: data.deviceType.split('.').pop() || 'Device',
            pose: { x: snapped.x, y: snapped.y, theta: 0 },
            holePose: { i: Math.round(snapped.x / 25), j: Math.round(snapped.y / 25), theta: 0 },
            locked: false,
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
   * Auto-panning when device is dragged outside visible area
   * This provides smooth navigation when dragging devices near screen edges
   * @param id - Device ID being dragged
   * @param pos - Current screen position of the device
   */
  const handleDeviceDragMove = useCallback((id: string, pos: { x: number; y: number }) => {
    if (!stageRef.current) return

    // Track drag start position for sensitivity
    if (!dragStartPos) {
      setDragStartPos(pos)
      return
    }

    // Calculate how far the device has been dragged
    const dragDistance = Math.sqrt(
      Math.pow(pos.x - dragStartPos.x, 2) + Math.pow(pos.y - dragStartPos.y, 2)
    )

    // Only trigger auto-panning if dragged at least 50 pixels
    // This prevents accidental panning during small movements
    if (dragDistance < 50) return

    // pos is already in screen coordinates from the pointer position
    const screenX = pos.x
    const screenY = pos.y
    
    // Calculate visible area considering sidebars
    const leftSidebarWidth = sidebarLeftCollapsed ? 0 : sidebarLeftWidth
    const rightSidebarWidth = sidebarRightCollapsed ? 0 : sidebarRightWidth
    const visibleWidth = stageSize.width - leftSidebarWidth - rightSidebarWidth
    const visibleHeight = stageSize.height
    
    // Much smaller margins for auto-panning (5% of visible area instead of 15%)
    const marginX = visibleWidth * 0.05
    const marginY = visibleHeight * 0.05
    
    let newViewportX = viewport.x
    let newViewportY = viewport.y
    let needsUpdate = false
    
    // Check if device is very close to left edge (accounting for left sidebar)
    if (screenX < leftSidebarWidth + marginX) {
      newViewportX = viewport.x + 5 // Pan right to show more left content (slower)
      needsUpdate = true
    }
    // Check if device is very close to right edge (accounting for right sidebar)
    else if (screenX > visibleWidth + leftSidebarWidth - marginX) {
      newViewportX = viewport.x - 5 // Pan left to show more right content (slower)
      needsUpdate = true
    }
    
    // Check if device is very close to top edge
    if (screenY < marginY) {
      newViewportY = viewport.y + 5 // Pan down to show more top content (slower)
      needsUpdate = true
    }
    // Check if device is very close to bottom edge
    else if (screenY > visibleHeight - marginY) {
      newViewportY = viewport.y - 5 // Pan up to show more bottom content (slower)
      needsUpdate = true
    }
    
    if (needsUpdate) {
      setViewport({
        x: newViewportX,
        y: newViewportY
      })
    }
  }, [viewport, stageSize, sidebarLeftCollapsed, sidebarRightCollapsed, sidebarLeftWidth, sidebarRightWidth, setViewport, dragStartPos])

  /**
   * Reset drag start position when drag ends
   * This cleans up the auto-panning state
   */
  const handleDeviceDragEnd = useCallback(() => {
    setDragStartPos(null)
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
        draggable={true}
        onDragEnd={(e) => {
          setViewport({
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
      >
        <Layer>
          {/* Grid layer - shows the optical table grid */}
          {gridVisible && currentTable && (
            <GridLayer 
              table={currentTable.table}
              viewport={viewport}
              stageSize={stageSize}
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