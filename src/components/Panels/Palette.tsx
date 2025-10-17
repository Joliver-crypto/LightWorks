import { useState, useEffect, useMemo } from 'react'
import { DeviceType } from '../../models/project'
import { deviceRegistry, DeviceConfig } from '../../../hardware/deviceRegistry'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// Default devices to show when search is empty
const DEFAULT_DEVICES = ['laser.generic', 'mirror.generic', 'splitter.generic', 'polarizer.generic']

// Professional icons to replace emojis
const PROFESSIONAL_ICONS: Record<string, string> = {
  '🔴': '●', // Laser
  '🪞': '◢', // Mirror
  '🔀': '◤', // Splitter
  '◤': '◤', // Polarizer (already professional)
  '📷': '◉', // Camera
  '⚙️': '⚙', // Motor
  '🔧': '⚙', // Jankomotor
  '📐': '◢', // Stage
  '📊': '◯', // Sensor
  '🌈': '◯', // Spectrograph
}

export function Palette() {
  const [devices, setDevices] = useState<DeviceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategorizedList, setShowCategorizedList] = useState(false)

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

  // Filter devices based on search query
  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show only default devices when search is empty
      return devices.filter(device => DEFAULT_DEVICES.includes(device.type))
    }

    const query = searchQuery.toLowerCase()
    return devices.filter(device => 
      device.label.toLowerCase().includes(query) ||
      device.type.toLowerCase().includes(query) ||
      device.category.toLowerCase().includes(query) ||
      device.description.toLowerCase().includes(query)
    )
  }, [devices, searchQuery])

  // Group devices by category for the categorized list
  const categorizedDevices = useMemo(() => {
    const categories: Record<string, DeviceConfig[]> = {}
    devices.forEach(device => {
      if (!categories[device.category]) {
        categories[device.category] = []
      }
      categories[device.category].push(device)
    })
    return categories
  }, [devices])

  // Get professional icon for device
  const getProfessionalIcon = (device: DeviceConfig) => {
    return PROFESSIONAL_ICONS[device.icon] || '◯'
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading devices...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hardware components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        
        {/* Toggle categorized list */}
        <div className="mt-2 flex justify-between items-center">
          <button
            onClick={() => setShowCategorizedList(!showCategorizedList)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showCategorizedList ? 'Hide' : 'Show'} categorized list
          </button>
          <span className="text-xs text-gray-500">
            {filteredDevices.length} component{filteredDevices.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Categorized List */}
      {showCategorizedList && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">All Hardware Components</h3>
          <div className="space-y-3">
            {Object.entries(categorizedDevices).map(([category, categoryDevices]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {categoryDevices.map((device) => (
                    <div
                      key={device.type}
                      className="text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer"
                      onClick={() => setSearchQuery(device.label)}
                    >
                      {device.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device tiles */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredDevices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-sm">No components found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDevices.map((device) => (
              <button
                key={device.type}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
                draggable
                onDragStart={(e) => handleDeviceDragStart(e, device.type)}
                title={device.description}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium text-white"
                  style={{ backgroundColor: device.color }}
                  aria-hidden
                >
                  {getProfessionalIcon(device)}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">{device.label}</div>
                  <div className="text-xs text-gray-500 capitalize">{device.category}</div>
                </div>
              </button>
            ))}
          </div>
        )}
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