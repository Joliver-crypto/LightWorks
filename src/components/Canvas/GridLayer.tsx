import { useMemo, useState, useCallback } from 'react'
import { Line, Circle, Rect, Text } from 'react-konva'
import { Table } from '../../models/fileFormat'
import { generateGridLines, getGridCellSize, gridToGridConfig, generateGridHoles, worldToHoleCoords, getTableBorderBounds } from '../../utils/grid'

interface GridLayerProps {
  table: Table
  viewport: { x: number; y: number; scale: number }
  stageSize: { width: number; height: number }
  onTableClick?: () => void
  showCoordinates?: boolean
  highlightHoles?: boolean
}

export function GridLayer({ table, viewport, stageSize, onTableClick, showCoordinates = false, highlightHoles = false }: GridLayerProps) {
  const [hoveredHole, setHoveredHole] = useState<{ x: number; y: number } | null>(null)
  const gridConfig = gridToGridConfig(table.grid, table.width, table.height, table.units)

  // Grid lines - only recalculate when viewport changes significantly
  const gridLines = useMemo(() => {
    const viewportRect = {
      x: -viewport.x / viewport.scale,
      y: -viewport.y / viewport.scale,
      width: stageSize.width / viewport.scale,
      height: stageSize.height / viewport.scale
    }
    
    return generateGridLines(gridConfig, viewportRect)
  }, [gridConfig, Math.floor(viewport.x / 100), Math.floor(viewport.y / 100), Math.floor(viewport.scale * 5), stageSize.width, stageSize.height])

  // Fixed hole size for better performance - only changes at major zoom levels
  const holeSize = useMemo(() => {
    // Use discrete size levels instead of continuous scaling
    if (viewport.scale < 0.5) return 2
    if (viewport.scale < 1.0) return 3
    if (viewport.scale < 2.0) return 4
    return 5
  }, [viewport.scale])

  // Generate holes for visible area - only recalculate when viewport changes significantly
  const holes = useMemo(() => {
    const allHoles = generateGridHoles(gridConfig)
    const viewportRect = {
      x: -viewport.x / viewport.scale,
      y: -viewport.y / viewport.scale,
      width: stageSize.width / viewport.scale,
      height: stageSize.height / viewport.scale
    }
    
    // Add more padding to reduce frequent recalculations
    const padding = gridConfig.pitch * 2
    return allHoles.filter(hole => 
      hole.x >= viewportRect.x - padding &&
      hole.x <= viewportRect.x + viewportRect.width + padding &&
      hole.y >= viewportRect.y - padding &&
      hole.y <= viewportRect.y + viewportRect.height + padding
    )
  }, [gridConfig, Math.floor(viewport.x / 50), Math.floor(viewport.y / 50), Math.floor(viewport.scale * 10), stageSize.width, stageSize.height])

  // Handle hole hover for interactive features
  const handleHoleHover = useCallback((hole: { x: number; y: number } | null) => {
    setHoveredHole(hole)
  }, [])

  // Calculate table border bounds including margins
  const tableBorderBounds = getTableBorderBounds(gridConfig)

  return (
    <>
      {/* Table border with enhanced styling - includes margins */}
      <Rect
        x={tableBorderBounds.x}
        y={tableBorderBounds.y}
        width={tableBorderBounds.width}
        height={tableBorderBounds.height}
        stroke="#374151"
        strokeWidth={3}
        fill="transparent"
        shadowColor="black"
        shadowBlur={4}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.15}
        cornerRadius={2}
        onClick={onTableClick}
        onTap={onTableClick}
        listening={true}
      />
      
      {/* Grid lines with improved styling */}
      {gridLines.map((line, index) => (
        <Line
          key={`line-${index}`}
          points={[line.start.x, line.start.y, line.end.x, line.end.y]}
          stroke="#d1d5db"
          strokeWidth={1}
          dash={[4, 4]}
          opacity={0.7}
        />
      ))}
      
      {/* Grid holes - simplified for better performance */}
      {holes.map((hole, index) => {
        const isHovered = hoveredHole && hoveredHole.x === hole.x && hoveredHole.y === hole.y
        
        return (
          <Circle
            key={`hole-${index}`}
            x={hole.x}
            y={hole.y}
            radius={holeSize / 2}
            fill={isHovered ? "#3b82f6" : "#6b7280"}
            opacity={isHovered ? 0.8 : 0.4}
            // Simplified shadows for better performance
            shadowColor={isHovered ? "#3b82f6" : "black"}
            shadowBlur={isHovered ? 2 : 0.5}
            shadowOffset={{ x: 0, y: 0.5 }}
            shadowOpacity={isHovered ? 0.2 : 0.05}
            // Only add hover handlers if coordinates are shown
            onMouseEnter={showCoordinates ? () => handleHoleHover(hole) : undefined}
            onMouseLeave={showCoordinates ? () => handleHoleHover(null) : undefined}
          />
        )
      })}
      
      {/* Hole coordinates display */}
      {showCoordinates && hoveredHole && (
        <Text
          x={hoveredHole.x + 10}
          y={hoveredHole.y - 20}
          text={`(${worldToHoleCoords(hoveredHole, table.grid).i}, ${worldToHoleCoords(hoveredHole, table.grid).j})`}
          fontSize={12}
          fill="#374151"
          fontFamily="monospace"
          shadowColor="white"
          shadowBlur={2}
          shadowOffset={{ x: 1, y: 1 }}
        />
      )}
      
      {/* Snap indicators for better visual feedback */}
      {highlightHoles && holes.map((hole, index) => (
        <Circle
          key={`snap-${index}`}
          x={hole.x}
          y={hole.y}
          radius={holeSize}
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth={1}
          opacity={0.3}
          dash={[2, 2]}
        />
      ))}
    </>
  )
}