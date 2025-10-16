import React, { memo, useCallback } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { Component } from '../../models/fileFormat'
import { snapToHole } from '../../utils/grid'
import { KonvaEventObject } from "konva/lib/Node";

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

const DEVICE_SIZE = 36;
const CORNER = 8;
const DOT_SIZE = 6;

// Determine if device is an input device (like laser) or output device (like detector)
function isInputDevice(deviceType: string): boolean {
  return deviceType.includes('laser') || deviceType.includes('source');
}

// Determine if device is an output device (like detector, camera)
function isOutputDevice(deviceType: string): boolean {
  return deviceType.includes('camera') || deviceType.includes('detector') || 
         deviceType.includes('sensor') || deviceType.includes('spectrograph');
}

// Get device direction color based on type
function getDirectionColor(deviceType: string): string {
  if (isInputDevice(deviceType)) return "#ef4444"; // Red for input (lasers)
  if (isOutputDevice(deviceType)) return "#22c55e"; // Green for output (detectors)
  return "#3b82f6"; // Blue for other devices (mirrors, splitters)
}

export const DeviceLayer: React.FC<DeviceLayerProps> = memo(({ 
  devices, 
  onDeviceSelect, 
  onDeviceMove, 
  onDeviceDragMove,
  onDeviceDragEnd,
  grid
}) => {
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
    
    // Snap to the closest grid hole first
    let snapped = snapToHole(worldPos, grid);
    
    // IMPORTANT: Use grid coordinate system for boundaries with 1-based indexing
    // The grid system is defined by:
    // - grid.nx: number of holes in X direction (columns) - 1-based
    // - grid.ny: number of holes in Y direction (rows) - 1-based
    // - grid.pitch: distance between holes (e.g., 25mm)
    // - grid.origin: starting position of the grid (usually 0,0)
    
    // Calculate grid boundaries based on hole count (1-based indexing)
    const maxHoleX = grid.nx || 10; // Maximum i value (1-based)
    const maxHoleY = grid.ny || 10; // Maximum j value (1-based)
    
    // Convert hole coordinates to world coordinates (1-based to 0-based conversion)
    const maxWorldX = (maxHoleX - 1) * grid.pitch + grid.origin.x;
    const maxWorldY = (maxHoleY - 1) * grid.pitch + grid.origin.y;
    const minWorldX = grid.origin.x;
    const minWorldY = grid.origin.y;
    
    // Clamp the snapped position to grid boundaries
    // This ensures devices can only be placed on valid grid holes
    snapped = {
      x: Math.max(minWorldX, Math.min(maxWorldX, snapped.x)),
      y: Math.max(minWorldY, Math.min(maxWorldY, snapped.y))
    };
    
    // Update the device position in the store
    // This will trigger a re-render and update the .lightworks file
    onDeviceMove(id, { 
      x: snapped.x, 
      y: snapped.y, 
      theta: e.target.rotation() 
    });

    // Notify parent that drag ended (for auto-panning cleanup)
    if (onDeviceDragEnd) {
      onDeviceDragEnd();
    }
  }, [grid, onDeviceMove, onDeviceDragEnd]);

  return (
    <>
      {devices.map((d) => {
        const directionColor = getDirectionColor(d.type);
        
        return (
          <Group
            key={d.id}
            // Position the device group at the device's center coordinates
            // d.pose.x and d.pose.y are already the center coordinates
            x={d.pose.x}
            y={d.pose.y}
            rotation={d.pose.theta ?? 0}
            // Offset the group so rotation happens around the center
            offsetX={DEVICE_SIZE / 2}
            offsetY={DEVICE_SIZE / 2}
            // Only allow dragging if device is not locked
            draggable={!d.locked}
            onClick={() => onDeviceSelect(d.id)}
            onTap={() => onDeviceSelect(d.id)}
            onDragMove={(e) => handleDragMove(e, d.id)}
            onDragEnd={(e) => handleDragEnd(e, d.id)}
            listening
          >
            {/* Device body - visual representation */}
            <Rect
              width={DEVICE_SIZE}
              height={DEVICE_SIZE}
              cornerRadius={CORNER}
              fill="#0f172a"
              stroke="#94a3b8"
              strokeWidth={2}
              shadowBlur={2}
              shadowColor="black"
            />
            
            {/* Direction indicator - shows device orientation */}
            <Circle
              x={DEVICE_SIZE / 2 + DOT_SIZE / 2}  // Position at the right edge
              y={0}                               // Center vertically
              radius={DOT_SIZE / 2}
              fill={directionColor}
              stroke="white"
              strokeWidth={1}
              listening={false}  // Don't interfere with drag events
            />
            
            {/* Device label - shows below the device */}
            <Text
              text={d.label || d.type}
              fontSize={12}
              fill="#cbd5e1"
              y={DEVICE_SIZE / 2 + 2}
              offsetX={DEVICE_SIZE / 2}
              width={DEVICE_SIZE * 2}        // Give some room for text
              align="center"
              listening={false}  // Don't interfere with drag events
            />
          </Group>
        );
      })}
    </>
  );
});