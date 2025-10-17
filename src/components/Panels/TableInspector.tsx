import { useState, useEffect } from 'react'
import { Table } from '../../models/fileFormat'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
import { useFileStore } from '../../storage/useFileStore'
// import { Toggle } from '../Common/Toggle'

interface TableInspectorProps {
  table: Table
}

export function TableInspector({ table }: TableInspectorProps) {
  const { updateGrid, saveTable } = useFileStore()
  const [formData, setFormData] = useState({
    nx: table.grid.nx || Math.floor(table.width / table.grid.pitch) + 1,
    ny: table.grid.ny || Math.floor(table.height / table.grid.pitch) + 1,
  })

  // Update form data when table changes
  useEffect(() => {
    setFormData({
      nx: table.grid.nx || Math.floor(table.width / table.grid.pitch) + 1,
      ny: table.grid.ny || Math.floor(table.height / table.grid.pitch) + 1,
    })
  }, [table])

  const handleValueChange = async (field: 'nx' | 'ny', value: number) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    try {
      // Update the grid with new values
      updateGrid({
        nx: newFormData.nx,
        ny: newFormData.ny,
      })
      
      // Save to file
      await saveTable()
    } catch (error) {
      console.error('Failed to save table:', error)
      // Revert on error
      setFormData({
        nx: table.grid.nx || Math.floor(table.width / table.grid.pitch) + 1,
        ny: table.grid.ny || Math.floor(table.height / table.grid.pitch) + 1,
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Table Properties</h3>
            <p className="text-sm text-gray-500">Configure the optics bench table grid</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Grid Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Grid Settings</h4>
          
          {/* Hole Count Controls */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Holes in X (nx)"
              type="number"
              value={formData.nx}
              onChange={(e) => handleValueChange('nx', Number(e.target.value))}
              helperText="Number of holes horizontally"
            />
            <Input
              label="Holes in Y (ny)"
              type="number"
              value={formData.ny}
              onChange={(e) => handleValueChange('ny', Number(e.target.value))}
              helperText="Number of holes vertically"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Summary</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Table Size:</span>
              <span className="font-medium">{table.width} × {table.height} {table.units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hole Pitch:</span>
              <span className="font-medium">{table.grid.pitch} {table.units}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thread Type:</span>
              <span className="font-medium">{table.grid.thread}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Holes:</span>
              <span className="font-medium">
                {formData.nx} × {formData.ny}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
