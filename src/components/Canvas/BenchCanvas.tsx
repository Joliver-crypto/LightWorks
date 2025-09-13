import { useRef, useEffect, useState } from 'react'
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
    toggleSidebarRight
  } = useUiStore()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setStageSize({ width: rect.width, height: rect.height })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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


  // Handle device drop
  const handleDeviceDrop = (e: any) => {
    e.preventDefault()
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.type === 'device') {
        const stage = stageRef.current
        if (!stage) return
        
        const pointer = stage.getPointerPosition()
        if (!pointer) return
        
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
          {/* Grid layer */}
          {gridVisible && currentTable && (
            <GridLayer 
              table={currentTable.table}
              viewport={viewport}
              stageSize={stageSize}
            />
          )}
        </Layer>
        
        <Layer>
          {/* Device layer */}
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
              grid={currentTable.table.grid}
            />
          )}
        </Layer>
        
        <Layer>
          {/* Selection layer */}
          <SelectionLayer 
            selectionBox={selectionBox}
            isSelecting={isSelecting}
          />
        </Layer>
      </Stage>
    </div>
  )
}
