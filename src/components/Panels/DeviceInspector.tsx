import { useState } from 'react'
import { DeviceBinding } from '../../models/project'
import { getDeviceTypeInfo } from '../../models/deviceTypes'
import { Tabs } from '../Common/Tabs'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
import { getDeviceStatusColors } from '../../utils/colors'
import { useProjectStore } from '../../state/useProjectStore'
import { useSelectionStore } from '../../state/useSelectionStore'
import { snapToHole } from '../../utils/grid'

interface DeviceInspectorProps {
  device?: DeviceBinding
  devices?: DeviceBinding[]
}

const tabs = [
  { id: 'properties', label: 'Properties' },
  { id: 'commands', label: 'Commands' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'binding', label: 'Binding' },
]

export function DeviceInspector({ device, devices }: DeviceInspectorProps) {
  const [activeTab, setActiveTab] = useState('properties')
  const [isEditing, setIsEditing] = useState(false)
  
  const { project, updateDevicePos, rotateDevice, removeDevice } = useProjectStore()
  const { clearSelection } = useSelectionStore()

  // Handle device deletion
  const handleDeleteDevice = () => {
    if (device) {
      removeDevice(device.id)
      clearSelection()
    }
  }

  // Handle position changes
  const handlePositionChange = (axis: 'x' | 'y', delta: number) => {
    if (device && project) {
      // Use table pitch as increment for better usability
      const increment = project.table.pitch * delta
      const newPos = {
        ...device.pos,
        [axis]: device.pos[axis] + increment
      }
      // Snap to grid hole
      const snapped = snapToHole(newPos, { 
        pitch: project.table.pitch,
        origin: project.table.origin
      })
      updateDevicePos(device.id, snapped)
    }
  }

  // Handle angle changes
  const handleAngleChange = (delta: number) => {
    if (device) {
      const newAngle = device.pos.angle + delta
      rotateDevice(device.id, newAngle)
    }
  }

  // Handle direct input changes
  const handlePositionInputChange = (axis: 'x' | 'y', value: string) => {
    if (device && project) {
      const numValue = parseFloat(value) || 0
      const newPos = {
        ...device.pos,
        [axis]: numValue
      }
      // Snap to grid hole
      const snapped = snapToHole(newPos, { 
        pitch: project.table.pitch,
        origin: project.table.origin
      })
      updateDevicePos(device.id, snapped)
    }
  }

  const handleAngleInputChange = (value: string) => {
    if (device) {
      const numValue = parseFloat(value) || 0
      rotateDevice(device.id, numValue)
    }
  }

  // Handle single device
  if (device) {
    const deviceInfo = getDeviceTypeInfo(device.type)
    const statusColors = getDeviceStatusColors(device.status)

    const renderProperties = () => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <Input
            value={device.name}
            onChange={() => {}} // TODO: Implement name editing
            disabled={!isEditing}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{deviceInfo.icon}</span>
            <span className="text-sm text-gray-600">{deviceInfo.label}</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Badge variant={device.status === 'green' ? 'success' : device.status === 'red' ? 'error' : 'default'}>
            {device.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position X
            </label>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePositionChange('x', -1)}
                className="px-2 py-1"
              >
                ←
              </Button>
              <Input
                type="number"
                value={device.pos.x}
                onChange={(e) => handlePositionInputChange('x', e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePositionChange('x', 1)}
                className="px-2 py-1"
              >
                →
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position Y
            </label>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePositionChange('y', -1)}
                className="px-2 py-1"
              >
                ↑
              </Button>
              <Input
                type="number"
                value={device.pos.y}
                onChange={(e) => handlePositionInputChange('y', e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePositionChange('y', 1)}
                className="px-2 py-1"
              >
                ↓
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Angle
          </label>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAngleChange(-15)}
              className="px-2 py-1"
            >
              ↶
            </Button>
            <Input
              type="number"
              value={device.pos.angle}
              onChange={(e) => handleAngleInputChange(e.target.value)}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAngleChange(15)}
              className="px-2 py-1"
            >
              ↷
            </Button>
          </div>
        </div>
        
        {/* Delete Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="danger"
            onClick={handleDeleteDevice}
            className="w-full"
          >
            Delete Device
          </Button>
        </div>
      </div>
    )

    const renderCommands = () => (
      <div className="space-y-2">
        {deviceInfo.commands.map((command) => (
          <div key={command.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-sm">{command.label}</div>
              <div className="text-xs text-gray-500">{command.description}</div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {}} // TODO: Implement command execution
            >
              Execute
            </Button>
          </div>
        ))}
      </div>
    )

    const renderTelemetry = () => (
      <div className="space-y-4">
        {deviceInfo.telemetry.map((telemetry) => (
          <div key={telemetry.name} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{telemetry.label}</span>
              {telemetry.unit && (
                <span className="text-xs text-gray-500">{telemetry.unit}</span>
              )}
            </div>
            <div className="text-2xl font-mono">
              {telemetry.type === 'number' ? '--' : 'No data'}
            </div>
          </div>
        ))}
      </div>
    )

    const renderBinding = () => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Driver Module
          </label>
          <Input
            value={device.driver?.module || ''}
            onChange={() => {}} // TODO: Implement driver editing
            disabled={!isEditing}
            placeholder="No driver bound"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <Input
            value={device.driver?.address || ''}
            onChange={() => {}} // TODO: Implement address editing
            disabled={!isEditing}
            placeholder="No address set"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parameters
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={JSON.stringify(device.driver?.params || {}, null, 2)}
            onChange={() => {}} // TODO: Implement params editing
            disabled={!isEditing}
            rows={4}
            placeholder="No parameters set"
          />
        </div>
      </div>
    )

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{deviceInfo.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{device.name}</h3>
                <p className="text-sm text-gray-500">{deviceInfo.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors.dot}`} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'properties' && renderProperties()}
          {activeTab === 'commands' && renderCommands()}
          {activeTab === 'telemetry' && renderTelemetry()}
          {activeTab === 'binding' && renderBinding()}
        </div>
      </div>
    )
  }

  // Handle multiple devices
  if (devices && devices.length > 1) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">
            {devices.length} devices selected
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {devices.map((device) => {
              const deviceInfo = getDeviceTypeInfo(device.type)
              const statusColors = getDeviceStatusColors(device.status)
              
              return (
                <div key={device.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{deviceInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{device.name}</div>
                    <div className="text-xs text-gray-500">{deviceInfo.label}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${statusColors.dot}`} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}
