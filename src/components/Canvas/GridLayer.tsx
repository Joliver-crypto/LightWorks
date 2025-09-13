import { useMemo } from 'react'
import { Line, Circle, Rect } from 'react-konva'
import { Table } from '../../models/project'
import { generateGridLines, getGridCellSize } from '../../utils/grid'

interface GridLayerProps {
  table: Table
  viewport: { x: number; y: number; scale: number }
  stageSize: { width: number; height: number }
}

export function GridLayer({ table, viewport, stageSize }: GridLayerProps) {
  const gridConfig = {
    pitch: table.pitch,
    origin: table.origin,
    width: table.width,
    height: table.height,
    units: table.units
  }

  const gridLines = useMemo(() => {
    const viewportRect = {
      x: -viewport.x / viewport.scale,
      y: -viewport.y / viewport.scale,
      width: stageSize.width / viewport.scale,
      height: stageSize.height / viewport.scale
    }
    
    return generateGridLines(gridConfig, viewportRect)
  }, [gridConfig, viewport, stageSize])

  const holeSize = useMemo(() => {
    return getGridCellSize(gridConfig, viewport.scale)
  }, [gridConfig, viewport.scale])

  // Generate holes for visible area
  const holes = useMemo(() => {
    const holes = []
    const { pitch, origin, width, height } = gridConfig
    
    const startX = Math.max(origin.x, -viewport.x / viewport.scale - pitch)
    const endX = Math.min(origin.x + width, (-viewport.x + stageSize.width) / viewport.scale + pitch)
    const startY = Math.max(origin.y, -viewport.y / viewport.scale - pitch)
    const endY = Math.min(origin.y + height, (-viewport.y + stageSize.height) / viewport.scale + pitch)
    
    for (let x = startX; x <= endX; x += pitch) {
      for (let y = startY; y <= endY; y += pitch) {
        holes.push({ x, y })
      }
    }
    
    return holes
  }, [gridConfig, viewport, stageSize])

  return (
    <>
      {/* Table border */}
      <Rect
        x={table.origin.x}
        y={table.origin.y}
        width={table.width}
        height={table.height}
        stroke="#6b7280"
        strokeWidth={2}
        fill="transparent"
        shadowColor="black"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
        shadowOpacity={0.1}
      />
      
      {/* Grid lines */}
      {gridLines.map((line, index) => (
        <Line
          key={`line-${index}`}
          points={[line.start.x, line.start.y, line.end.x, line.end.y]}
          stroke="#e5e7eb"
          strokeWidth={1}
          dash={[2, 2]}
          opacity={0.6}
        />
      ))}
      
      {/* Grid holes */}
      {holes.map((hole, index) => (
        <Circle
          key={`hole-${index}`}
          x={hole.x}
          y={hole.y}
          radius={holeSize / 2}
          fill="#9ca3af"
          opacity={0.4}
        />
      ))}
    </>
  )
}
