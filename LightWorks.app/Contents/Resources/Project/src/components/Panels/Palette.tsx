import { useState, useEffect } from 'react'
import { DeviceType } from '../../models/project'
import { deviceRegistry, DeviceConfig } from '../../hardware/deviceRegistry'

export function Palette() {
  const [devices, setDevices] = useState<DeviceConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDevices = async () => {
      try {
        await deviceRegistry.loadDevices()
        const allDevices = deviceRegistry.getAllDeviceConfigs()
        setDevices(allDevices)
      } catch (error) {
        console.error('Failed to load devices:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [])

  const handleDeviceDragStart = (event: React.DragEvent, deviceType: DeviceType) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'device',
      deviceType
    }))
    event.dataTransfer.effectAllowed = 'copy'
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-400">Loading devices...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Device tiles */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {devices.map((device) => (
            <button
              key={device.type}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700"
              draggable
              onDragStart={(e) => handleDeviceDragStart(e, device.type)}
              title={device.description}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-sm"
                style={{ backgroundColor: device.color }}
                aria-hidden
              >
                {device.icon}
              </div>
              <div className="text-slate-100 text-sm">{device.label}</div>
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
