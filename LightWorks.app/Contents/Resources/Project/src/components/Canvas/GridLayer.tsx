import { useMemo } from 'react'
import { Line, Circle, Rect } from 'react-konva'
import { Table } from '../../models/fileFormat'
import { generateGridLines, getGridCellSize, gridToGridConfig, generateGridHoles } from '../../utils/grid'

interface GridLayerProps {
  table: Table
  viewport: { x: number; y: number; scale: number }
  stageSize: { width: number; height: number }
}

export function GridLayer({ table, viewport, stageSize }: GridLayerProps) {
  const gridConfig = gridToGridConfig(table.grid, table.width, table.height, table.units)

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

  // Generate holes for visible area based on hole count
  const holes = useMemo(() => {
    const allHoles = generateGridHoles(gridConfig)
    const viewportRect = {
      x: -viewport.x / viewport.scale,
      y: -viewport.y / viewport.scale,
      width: stageSize.width / viewport.scale,
      height: stageSize.height / viewport.scale
    }
    
    // Filter holes to only show those in the visible viewport
    return allHoles.filter(hole => 
      hole.x >= viewportRect.x - gridConfig.pitch &&
      hole.x <= viewportRect.x + viewportRect.width + gridConfig.pitch &&
      hole.y >= viewportRect.y - gridConfig.pitch &&
      hole.y <= viewportRect.y + viewportRect.height + gridConfig.pitch
    )
  }, [gridConfig, viewport, stageSize])

  return (
    <>
      {/* Table border - now based on actual grid dimensions */}
      <Rect
        x={gridConfig.origin.x}
        y={gridConfig.origin.y}
        width={gridConfig.width}
        height={gridConfig.height}
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