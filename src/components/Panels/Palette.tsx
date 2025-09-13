import { DeviceType } from '../../models/project'

const DEVICE_PALETTE: Array<{ type: DeviceType; label: string; color: string }> = [
  { type: "laser.generic", label: "Laser", color: "#1d4ed8" },
  { type: "mirror.generic", label: "Mirror", color: "#047857" },
  { type: "splitter.generic", label: "Splitter", color: "#7c3aed" },
  { type: "camera.andor", label: "Camera", color: "#0ea5e9" },
  { type: "spectrograph.andor.sr750", label: "SR-750", color: "#a855f7" },
  { type: "motor.thorlabs.kdc101", label: "Motor", color: "#f59e0b" },
  { type: "stage.newport.esp", label: "Stage", color: "#ef4444" },
  { type: "sensor.generic", label: "Sensor", color: "#10b981" },
];

export function Palette() {

  const handleDeviceDragStart = (event: React.DragEvent, deviceType: DeviceType) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'device',
      deviceType
    }))
    event.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Device tiles */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {DEVICE_PALETTE.map((item) => (
            <button
              key={item.type}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
              draggable
              onDragStart={(e) => handleDeviceDragStart(e, item.type)}
            >
              <div
                className="w-6 h-6 rounded-md"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <div className="text-slate-100 text-sm">{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Drag devices to the canvas to add them to your project
        </p>
      </div>
    </div>
  )
}
