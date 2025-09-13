import React, { memo, useCallback } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { DeviceBinding } from '../../models/project'
import { snapToHole } from '../../utils/grid'
import { KonvaEventObject } from "konva/lib/Node";

interface DeviceLayerProps {
  devices: DeviceBinding[]
  selectedIds: string[]
  onDeviceSelect: (id: string) => void
  onDeviceMove: (id: string, pos: { x: number; y: number }) => void
  onDeviceRotate: (id: string, angle: number) => void
  tablePitch: number
  tableOrigin?: { x: number; y: number }
}

const DEVICE_SIZE = 36;
const CORNER = 8;
const DOT_SIZE = 6;

function statusStroke(status: "green" | "red" | "gray") {
  switch (status) {
    case "green": return "#22c55e";
    case "red": return "#ef4444";
    default: return "#94a3b8";
  }
}

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
  tablePitch,
  tableOrigin
}) => {
  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    const pointer = e.target.getStage()?.getPointerPosition();
    if (!pointer) return;
    const snapped = snapToHole(pointer, { pitch: tablePitch, origin: tableOrigin });
    // Live snap while dragging:
    e.target.position({ x: snapped.x, y: snapped.y });
  }, [tablePitch, tableOrigin]);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>, id: string) => {
    const { x, y } = e.target.position();
    // Persist snapped center position:
    onDeviceMove(id, { x, y });
  }, [onDeviceMove]);

  return (
    <>
      {devices.map((d) => {
        const directionColor = getDirectionColor(d.type);
        
        return (
          <Group
            key={d.id}
            x={d.pos.x}
            y={d.pos.y}
            rotation={d.pos.angle ?? 0}
            offsetX={DEVICE_SIZE / 2}       // center-based positioning
            offsetY={DEVICE_SIZE / 2}
            draggable
            onClick={() => onDeviceSelect(d.id)}
            onTap={() => onDeviceSelect(d.id)}
            onDragMove={handleDragMove}
            onDragEnd={(e) => handleDragEnd(e, d.id)}
            listening
          >
            {/* Device body */}
            <Rect
              width={DEVICE_SIZE}
              height={DEVICE_SIZE}
              cornerRadius={CORNER}
              fill="#0f172a"                 // slate-900
              stroke={statusStroke(d.status)}
              strokeWidth={2}
              shadowBlur={2}
              shadowColor="black"
            />
            
            {/* Direction indicator - dot at the edge */}
            <Circle
              x={DEVICE_SIZE / 2 + DOT_SIZE / 2}  // Position at the right edge
              y={0}                               // Center vertically
              radius={DOT_SIZE / 2}
              fill={directionColor}
              stroke="white"
              strokeWidth={1}
              listening={false}
            />
            
            {/* Label below the box */}
            <Text
              text={d.name}
              fontSize={12}
              fill="#cbd5e1"                 // slate-300
              y={DEVICE_SIZE / 2 + 2}
              offsetX={DEVICE_SIZE / 2}
              width={DEVICE_SIZE * 2}        // give some room for text
              align="center"
              listening={false}
            />
          </Group>
        );
      })}
    </>
  );
});
