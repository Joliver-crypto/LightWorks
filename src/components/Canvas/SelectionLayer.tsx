import { Rect } from 'react-konva'

interface SelectionLayerProps {
  selectionBox: { x: number; y: number; width: number; height: number } | null
  isSelecting: boolean
}

export function SelectionLayer({ selectionBox, isSelecting }: SelectionLayerProps) {
  if (!isSelecting || !selectionBox) {
    return null
  }

  return (
    <Rect
      x={selectionBox.x}
      y={selectionBox.y}
      width={selectionBox.width}
      height={selectionBox.height}
      fill="rgba(79, 70, 229, 0.1)"
      stroke="#4f46e5"
      strokeWidth={1}
      dash={[5, 5]}
    />
  )
}


