import { useState } from 'react'
import { Table } from '../../models/fileFormat'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
// import { Toggle } from '../Common/Toggle'

interface TableInspectorProps {
  table: Table
}

export function TableInspector({ table }: TableInspectorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    width: table.width,
    height: table.height,
    pitch: table.grid.pitch,
    units: table.units,
    thread: table.grid.thread,
    originX: table.grid.origin.x,
    originY: table.grid.origin.y,
  })

  const handleSave = () => {
    // TODO: Implement table update
    console.log('Saving table:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      width: table.width,
      height: table.height,
      pitch: table.grid.pitch,
      units: table.units,
      thread: table.grid.thread,
      originX: table.grid.origin.x,
      originY: table.grid.origin.y,
    })
    setIsEditing(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Table Properties</h3>
            <p className="text-sm text-gray-500">Configure the optics bench table</p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Dimensions */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Dimensions</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Width"
              type="number"
              value={formData.width}
              onChange={(e) => setFormData(prev => ({ ...prev, width: Number(e.target.value) }))}
              disabled={!isEditing}
            />
            <Input
              label="Height"
              type="number"
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, height: Number(e.target.value) }))}
              disabled={!isEditing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units
            </label>
            <select
              value={formData.units}
              onChange={(e) => setFormData(prev => ({ ...prev, units: e.target.value as 'mm' | 'inch' }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-50"
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="inch">Inches (in)</option>
            </select>
          </div>
        </div>

        {/* Grid Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Grid Settings</h4>
          
          <Input
            label="Hole Pitch"
            type="number"
            value={formData.pitch}
            onChange={(e) => setFormData(prev => ({ ...prev, pitch: Number(e.target.value) }))}
            disabled={!isEditing}
            helperText="Distance between grid holes"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thread Type
            </label>
            <select
              value={formData.thread}
              onChange={(e) => setFormData(prev => ({ ...prev, thread: e.target.value as '1/4-20' | 'M6' }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-50"
            >
              <option value="1/4-20">1/4-20 (Imperial)</option>
              <option value="M6">M6 (Metric)</option>
            </select>
          </div>
        </div>

        {/* Origin */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Origin</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Origin X"
              type="number"
              value={formData.originX}
              onChange={(e) => setFormData(prev => ({ ...prev, originX: Number(e.target.value) }))}
              disabled={!isEditing}
            />
            <Input
              label="Origin Y"
              type="number"
              value={formData.originY}
              onChange={(e) => setFormData(prev => ({ ...prev, originY: Number(e.target.value) }))}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Summary</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Table Size:</span>
              <span className="font-medium">{formData.width} × {formData.height} {formData.units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hole Pitch:</span>
              <span className="font-medium">{formData.pitch} {formData.units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thread Type:</span>
              <span className="font-medium">{formData.thread}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Holes:</span>
              <span className="font-medium">
                {Math.floor(formData.width / formData.pitch) + 1} × {Math.floor(formData.height / formData.pitch) + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
