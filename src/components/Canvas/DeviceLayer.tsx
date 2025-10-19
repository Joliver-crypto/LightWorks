import React, { memo, useCallback, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import { Component } from '../../models/fileFormat'
import { snapToHole } from '../../utils/grid'
import { KonvaEventObject } from "konva/lib/Node";
import { deviceRegistry } from '../../../hardware/deviceRegistry'

interface DeviceLayerProps {
  devices: Component[]
  selectedIds: string[]
  onDeviceSelect: (id: string) => void
  onDeviceMove: (id: string, pos: { x: number; y: number; theta: number }) => void
  onDeviceRotate: (id: string, angle: number) => void
  onDeviceDragMove?: (id: string, pos: { x: number; y: number }) => void
  onDeviceDragEnd?: () => void
  grid: {
    pitch: number
    thread: '1/4-20' | 'M6'
    origin: { x: number; y: number }
    snapToHoles: boolean
    nx?: number  // Number of holes in X direction (columns)
    ny?: number  // Number of holes in Y direction (rows)
  }
}

const CORNER = 8;

// Professional icons to replace emojis (same as in Palette)
const PROFESSIONAL_ICONS: Record<string, string> = {
  '🔴': '●', // Laser
  '🪞': '◢', // Mirror
  '🔀': '■', // Splitter (changed from triangle to square)
  '◤': '⬬', // Polarizer (oval shape)
  '📷': '◉', // Camera
  '⚙️': '⚙', // Motor
  '🔧': '⚙', // Jankomotor
  '📐': '◢', // Stage
  '📊': '⬬', // Sensor (oval shape)
  '🌈': '⬬', // Spectrograph (oval shape)
  '🔍': '⬬', // Filter (oval shape)
}

// Note: Direction color logic removed - now using black rectangle indicator

// Get professional icon for device
function getProfessionalIcon(deviceType: string): string {
  const deviceConfig = deviceRegistry.getDeviceConfig(deviceType as any);
  if (deviceConfig) {
    return PROFESSIONAL_ICONS[deviceConfig.icon] || '◯';
  }
  return '◯'; // Default fallback
}

// Get device color from registry
function getDeviceColor(deviceType: string): string {
  const deviceConfig = deviceRegistry.getDeviceConfig(deviceType as any);
  if (deviceConfig) {
    return deviceConfig.color;
  }
  return '#6b7280'; // Default gray fallback
}

// Calculate device size based on properties
function getDeviceSize(device: Component, gridPitch: number): { width: number; height: number } {
  const size = device.size || { width: 1, height: 1 };
  return {
    width: size.width * gridPitch,  // Use grid pitch instead of DEVICE_SIZE
    height: size.height * gridPitch  // Use grid pitch instead of DEVICE_SIZE
  };
}

// Note: Device positioning now uses centered approach with Group offset

export const DeviceLayer: React.FC<DeviceLayerProps> = memo(({ 
  devices, 
  selectedIds,
  onDeviceSelect, 
  onDeviceMove, 
  onDeviceDragMove,
  onDeviceDragEnd,
  grid
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  /**
   * Handles device drag start - sets visual feedback
   * @param e - Konva drag event
   * @param id - Device ID being dragged
   */
  const handleDragStart = useCallback((_e: KonvaEventObject<DragEvent>, id: string) => {
    setDraggingId(id)
  }, []);

  /**
   * Handles device drag movement for auto-panning
   * This is called continuously during drag operations
   * @param e - Konva drag event
   * @param id - Device ID being dragged
   */
  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>, id: string) => {
    // Simple drag move - just notify parent for auto-panning
    const stage = e.target.getStage();
    if (stage && onDeviceDragMove) {
      const pointer = stage.getPointerPosition();
      if (pointer) {
        onDeviceDragMove(id, pointer);
      }
    }
  }, [onDeviceDragMove]);

  /**
   * Handles device drag end with grid-based boundary constraints (1-based indexing)
   * This is where we snap to grid and enforce boundary limits
   * @param e - Konva drag event
   * @param id - Device ID being dropped
   */
  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>, id: string) => {
    const stage = e.target.getStage();
    if (!stage) return;
    
    // Get the pointer position in world coordinates
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    // Convert screen coordinates to world coordinates
    const worldPos = {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY()
    };
    
    // Find the device to get its size
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    const deviceSize = device.size || { width: 1, height: 1 };
    
    // Snap to the closest grid hole first
    let snapped = snapToHole(worldPos, grid);
    
    // IMPORTANT: The snapped position represents the FIRST HOLE (mounting point) of the device
    // For multi-hole devices, we need to ensure the device doesn't extend beyond grid boundaries
    // The device grows right and down from the first hole
    
    // Calculate grid boundaries based on hole count (1-based indexing)
    const maxHoleX = grid.nx || 10; // Maximum i value (1-based)
    const maxHoleY = grid.ny || 10; // Maximum j value (1-based)
    
    // Convert hole coordinates to world coordinates (1-based to 0-based conversion)
    const maxWorldX = (maxHoleX - 1) * grid.pitch + grid.origin.x;
    const maxWorldY = (maxHoleY - 1) * grid.pitch + grid.origin.y;
    const minWorldX = grid.origin.x;
    const minWorldY = grid.origin.y;
    
    // For multi-hole devices, ensure the first hole allows the device to fit
    // The device extends (width-1) holes to the right and (height-1) holes down
    const maxAllowedX = maxWorldX - (deviceSize.width - 1) * grid.pitch;
    const maxAllowedY = maxWorldY - (deviceSize.height - 1) * grid.pitch;
    
    // Clamp the snapped position to valid first hole positions
    snapped = {
      x: Math.max(minWorldX, Math.min(maxAllowedX, snapped.x)),
      y: Math.max(minWorldY, Math.min(maxAllowedY, snapped.y))
    };
    
    // Update the device position in the store
    // This will trigger a re-render and update the .lightworks file
    onDeviceMove(id, { 
      x: snapped.x, 
      y: snapped.y, 
      theta: e.target.rotation() 
    });

    // Clear dragging state
    setDraggingId(null)

    // Notify parent that drag ended (for auto-panning cleanup)
    if (onDeviceDragEnd) {
      onDeviceDragEnd();
    }
  }, [grid, onDeviceMove, onDeviceDragEnd, devices]);

  return (
    <>
      {devices.map((d) => {
        const deviceColor = getDeviceColor(d.type);
        const deviceSize = getDeviceSize(d, grid.pitch);
        const isSelected = selectedIds.includes(d.id);
        const isDragging = draggingId === d.id;
        
        return (
          <Group
            key={d.id}
            // Position the device group at the first hole (mounting point)
            x={d.pose.x}
            y={d.pose.y}
            rotation={d.pose.theta ?? 0}
            // No offset - the pose.x and pose.y should be the first hole position
            offsetX={0}
            offsetY={0}
            // Only allow dragging if device is not locked
            draggable={!d.locked}
            onClick={() => onDeviceSelect(d.id)}
            onTap={() => onDeviceSelect(d.id)}
            onDragStart={(e) => handleDragStart(e, d.id)}
            onDragMove={(e) => handleDragMove(e, d.id)}
            onDragEnd={(e) => handleDragEnd(e, d.id)}
            listening
          >
            {/* Device body - starts at first hole, expands right and down */}
            <Rect
              x={-grid.pitch / 2}  // Shift to center on the first hole
              y={-grid.pitch / 2}  // Shift to center on the first hole
              width={deviceSize.width}
              height={deviceSize.height}
              cornerRadius={CORNER}
              fill={isDragging ? deviceColor : deviceColor}
              stroke={isSelected ? "#3b82f6" : isDragging ? "#60a5fa" : "#000000"}
              strokeWidth={isSelected ? 3 : isDragging ? 2 : 1}
              shadowBlur={isDragging ? 8 : 2}
              shadowColor={isDragging ? "#3b82f6" : "black"}
              shadowOffset={{ x: 0, y: isDragging ? 4 : 1 }}
              shadowOpacity={isDragging ? 0.3 : 0.1}
            />
            
            {/* Professional device icon - centered in the first hole (mounting point) */}
            <Text
              text={getProfessionalIcon(d.type)}
              fontSize={16}
              fill="white"
              x={0}  // Center on the first hole
              y={0}  // Center on the first hole
              offsetX={8}
              offsetY={8}
              align="center"
              listening={false}
            />
            
            {/* Direction indicator - small rounded rectangle extending above device */}
            <Rect
              x={-6}  // Center on the first hole, adjusted for 12px width
              y={-grid.pitch / 2 - 3}  // Position above the device edge
              width={12}  // Longer width
              height={6}  // Small height
              fill="#000000"
              cornerRadius={3}  // Fully rounded rectangle
              listening={false}  // Don't interfere with drag events
            />
            
            {/* Device label - centered below the device block */}
            <Text
              text={d.label || d.type}
              fontSize={12}
              fill="#374151"
              x={0}  // Center horizontally
              y={deviceSize.height - grid.pitch / 2 + 8}  // Position below the device
              offsetX={deviceSize.width / 2}  // Center horizontally
              width={deviceSize.width * 2}        // Give some room for text
              align="center"
              listening={false}  // Don't interfere with drag events
            />
          </Group>
        );
      })}
    </>
  );
});