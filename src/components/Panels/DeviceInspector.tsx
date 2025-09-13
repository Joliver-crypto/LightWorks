import { useState } from 'react'
import { Component } from '../../models/fileFormat'
import { Tabs } from '../Common/Tabs'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
import { useFileStore } from '../../storage/useFileStore'
import { useSelectionStore } from '../../state/useSelectionStore'
import { snapToHole } from '../../utils/grid'

interface DeviceInspectorProps {
  device?: Component
  devices?: Component[]
}

const tabs = [
  { id: 'properties', label: 'Properties' },
  { id: 'commands', label: 'Commands' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'binding', label: 'Binding' },
]

export function DeviceInspector({ device }: DeviceInspectorProps) {
  const [activeTab, setActiveTab] = useState('properties')
  const [isEditing, setIsEditing] = useState(false)
  
  const { currentTable, updateComponent, removeComponent } = useFileStore()
  const { clearSelection } = useSelectionStore()

  // Handle device deletion
  const handleDeleteDevice = () => {
    if (device) {
      removeComponent(device.id)
      clearSelection()
    }
  }

  // Handle position changes
  const handlePositionChange = (axis: 'x' | 'y', delta: number) => {
    if (device && currentTable) {
      // Use table pitch as increment for better usability
      const increment = currentTable.table.grid.pitch * delta
      const newPos = {
        ...device.pose,
        [axis]: device.pose[axis] + increment
      }
      // Snap to grid hole
      const snapped = snapToHole(newPos, currentTable.table.grid)
      updateComponent(device.id, { pose: { ...snapped, theta: device.pose.theta } })
    }
  }

  // Handle angle changes
  const handleAngleChange = (delta: number) => {
    if (device) {
      const newAngle = device.pose.theta + delta
      updateComponent(device.id, { 
        pose: { ...device.pose, theta: newAngle },
        holePose: { ...device.holePose, theta: newAngle }
      })
    }
  }

  // Handle direct input changes
  const handlePositionInputChange = (axis: 'x' | 'y', value: string) => {
    if (device && currentTable) {
      const numValue = parseFloat(value) || 0
      const newPos = {
        ...device.pose,
        [axis]: numValue
      }
      // Snap to grid hole
      const snapped = snapToHole(newPos, currentTable.table.grid)
      updateComponent(device.id, { pose: { ...snapped, theta: device.pose.theta } })
    }
  }

  const handleAngleInputChange = (value: string) => {
    if (device) {
      const numValue = parseFloat(value) || 0
      updateComponent(device.id, { 
        pose: { ...device.pose, theta: numValue },
        holePose: { ...device.holePose, theta: numValue }
      })
    }
  }

  if (!device) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p>Select a device to inspect</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-900">{device.label || device.type}</h2>
            <p className="text-sm text-gray-500">Device Inspector</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done' : 'Edit'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteDevice}
            >
              Delete
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
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {/* Basic Properties */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Basic Properties</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Badge variant="default">{device.type}</Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <Input
                    value={device.label || ''}
                    onChange={(e) => updateComponent(device.id, { label: e.target.value })}
                    placeholder="Enter device label..."
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locked
                  </label>
                  <Badge variant={device.locked ? 'error' : 'success'}>
                    {device.locked ? 'Locked' : 'Unlocked'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Position</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X (mm)
                  </label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={device.pose.x.toFixed(1)}
                      onChange={(e) => handlePositionInputChange('x', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePositionChange('x', -1)}
                      disabled={!isEditing}
                    >
                      -
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePositionChange('x', 1)}
                      disabled={!isEditing}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y (mm)
                  </label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={device.pose.y.toFixed(1)}
                      onChange={(e) => handlePositionInputChange('y', e.target.value)}
                      disabled={!isEditing}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePositionChange('y', -1)}
                      disabled={!isEditing}
                    >
                      -
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePositionChange('y', 1)}
                      disabled={!isEditing}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Angle (deg)
                </label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={device.pose.theta.toFixed(1)}
                    onChange={(e) => handleAngleInputChange(e.target.value)}
                    disabled={!isEditing}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAngleChange(-5)}
                    disabled={!isEditing}
                  >
                    -5°
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAngleChange(5)}
                    disabled={!isEditing}
                  >
                    +5°
                  </Button>
                </div>
              </div>
            </div>

            {/* Hole Position */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Hole Position</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column (i)
                  </label>
                  <Input
                    value={device.holePose.i}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Row (j)
                  </label>
                  <Input
                    value={device.holePose.j}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Metadata */}
            {device.meta && Object.keys(device.meta).length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Metadata</h3>
                <div className="space-y-2">
                  {Object.entries(device.meta).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">{key}:</span>
                      <span className="text-sm text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚡</div>
            <p>Commands not implemented yet</p>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>Telemetry not implemented yet</p>
          </div>
        )}

        {activeTab === 'binding' && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔗</div>
            <p>Binding not implemented yet</p>
          </div>
        )}
      </div>
    </div>
  )
}