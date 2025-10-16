import { useState, useEffect } from 'react'
import { Component } from '../../models/fileFormat'
import { Tabs } from '../Common/Tabs'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
import { useFileStore } from '../../storage/useFileStore'
import { useSelectionStore } from '../../state/useSelectionStore'
import { deviceRegistry, DeviceConfig } from '../../hardware/deviceRegistry'
import { executeArduinoCommand, connectToArduino, disconnectFromArduino } from '../../hardware/arduinoClient'

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
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Jankomotor8812 specific state
  const [jankomotorInputs, setJankomotorInputs] = useState({
    cornerA: '',
    cornerB: '',
    cornerC: ''
  })
  const [tipTiltInputs, setTipTiltInputs] = useState({
    tip: '',
    tilt: ''
  })
  const [jankomotorStatus, setJankomotorStatus] = useState('')
  const [arduinoConnected, setArduinoConnected] = useState(false)
  
  const { currentTable, updateComponent, removeComponent } = useFileStore()
  const { clearSelection } = useSelectionStore()

  // Arduino command execution functions
  const handleArduinoCommand = async (command: string) => {
    try {
      setJankomotorStatus('Executing...')
      
      console.log(`Executing Arduino command: ${command}`)
      
      // Execute the command using the Arduino client
      const response = await executeArduinoCommand(command)
      
      if (response.success) {
        setJankomotorStatus(response.message)
      } else {
        setJankomotorStatus(`Error: ${response.message}`)
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setJankomotorStatus(''), 3000)
      
    } catch (error) {
      console.error('Failed to execute Arduino command:', error)
      setJankomotorStatus(`Error: ${error}`)
    }
  }

  const handleCornerRun = async () => {
    const { cornerA, cornerB, cornerC } = jankomotorInputs
    
    // Validate inputs
    if (!cornerA && !cornerB && !cornerC) {
      setJankomotorStatus('Please enter at least one corner value')
      return
    }
    
    // Execute corner actuator commands
    if (cornerA) {
      await handleArduinoCommand(`MOVE A ${cornerA}`)
    }
    if (cornerB) {
      await handleArduinoCommand(`MOVE B ${cornerB}`)
    }
    if (cornerC) {
      await handleArduinoCommand(`MOVE C ${cornerC}`)
    }
  }

  const handleTipTiltRun = async () => {
    const { tip, tilt } = tipTiltInputs
    
    // Validate inputs
    if (!tip && !tilt) {
      setJankomotorStatus('Please enter at least one tip/tilt value')
      return
    }
    
    // Execute tip/tilt commands (these would need to be mapped to corner actuators)
    if (tip) {
      await handleArduinoCommand(`TIP ${tip}`)
    }
    if (tilt) {
      await handleArduinoCommand(`TILT ${tilt}`)
    }
  }

  const handleJankomotorEnable = async () => {
    await handleArduinoCommand('ENABLE')
  }

  const handleJankomotorDisable = async () => {
    await handleArduinoCommand('DISABLE')
  }

  const handleJankomotorHome = async () => {
    await handleArduinoCommand('HOME')
  }

  const handleJankomotorStop = async () => {
    await handleArduinoCommand('STOP')
  }

  const handleArduinoConnect = async () => {
    try {
      setJankomotorStatus('Connecting to Arduino...')
      const connected = await connectToArduino()
      if (connected) {
        setArduinoConnected(true)
        setJankomotorStatus('Arduino connected successfully')
      } else {
        setArduinoConnected(false)
        setJankomotorStatus('Failed to connect to Arduino')
      }
    } catch (error) {
      setArduinoConnected(false)
      setJankomotorStatus(`Connection error: ${error}`)
    }
  }

  const handleArduinoDisconnect = async () => {
    try {
      setJankomotorStatus('Disconnecting from Arduino...')
      await disconnectFromArduino()
      setArduinoConnected(false)
      setJankomotorStatus('Arduino disconnected')
    } catch (error) {
      setJankomotorStatus(`Disconnect error: ${error}`)
    }
  }

  // Load device configuration when device changes
  useEffect(() => {
    const loadDeviceConfig = async () => {
      if (!device) {
        setDeviceConfig(null)
        return
      }

      setLoading(true)
      try {
        await deviceRegistry.loadDevices()
        const config = deviceRegistry.getDeviceConfig(device.type as any)
        setDeviceConfig(config || null)
      } catch (error) {
        console.error('Failed to load device config:', error)
        setDeviceConfig(null)
      } finally {
        setLoading(false)
      }
    }

    loadDeviceConfig()
  }, [device])

  // Handle device deletion
  const handleDeleteDevice = () => {
    if (device) {
      removeComponent(device.id)
      clearSelection()
    }
  }

  // Handle lock toggle
  const handleToggleLock = () => {
    if (device) {
      updateComponent(device.id, { locked: !device.locked })
    }
  }

  /**
   * Clamp hole position to valid grid boundaries (1-based indexing)
   * @param i - Column position (1-based)
   * @param j - Row position (1-based)
   * @returns Clamped hole position within grid bounds
   */
  const clampHolePosition = (i: number, j: number) => {
    if (!currentTable) return { i, j }
    
    const grid = currentTable.table.grid
    const maxI = grid.nx || 10  // Maximum i value (1-based)
    const maxJ = grid.ny || 10  // Maximum j value (1-based)
    
    return {
      i: Math.max(1, Math.min(maxI, i)),  // Clamp between 1 and maxI
      j: Math.max(1, Math.min(maxJ, j))   // Clamp between 1 and maxJ
    }
  }

  /**
   * Handle hole position changes (i, j coordinates) with boundary validation
   * This is the primary way to position devices on the grid
   * @param axis - 'i' for column or 'j' for row
   * @param delta - Change in hole position (+1 or -1)
   */
  const handleHolePositionChange = (axis: 'i' | 'j', delta: number) => {
    if (device && currentTable) {
      const newHolePose = {
        ...device.holePose,
        [axis]: device.holePose[axis] + delta
      }
      
      // Clamp to valid boundaries
      const clampedHolePose = clampHolePosition(newHolePose.i, newHolePose.j)
      
      // Convert hole position to world coordinates (1-based to 0-based conversion)
      const newPose = {
        x: (clampedHolePose.i - 1) * currentTable.table.grid.pitch + currentTable.table.grid.origin.x,
        y: (clampedHolePose.j - 1) * currentTable.table.grid.pitch + currentTable.table.grid.origin.y,
        theta: device.pose.theta
      }
      
      updateComponent(device.id, { 
        pose: newPose,
        holePose: { ...clampedHolePose, theta: device.pose?.theta || 0 }
      })
    }
  }

  /**
   * Handle direct hole position input changes with boundary validation
   * @param axis - 'i' for column or 'j' for row
   * @param value - New hole position value
   */
  const handleHolePositionInputChange = (axis: 'i' | 'j', value: string) => {
    if (device && currentTable) {
      const numValue = parseInt(value) || 1  // Default to 1 for 1-based indexing
      const newHolePose = {
        ...device.holePose,
        [axis]: numValue
      }
      
      // Clamp to valid boundaries
      const clampedHolePose = clampHolePosition(newHolePose.i, newHolePose.j)
      
      // Convert hole position to world coordinates (1-based to 0-based conversion)
      const newPose = {
        x: (clampedHolePose.i - 1) * currentTable.table.grid.pitch + currentTable.table.grid.origin.x,
        y: (clampedHolePose.j - 1) * currentTable.table.grid.pitch + currentTable.table.grid.origin.y,
        theta: device.pose.theta
      }
      
      updateComponent(device.id, { 
        pose: newPose,
        holePose: { ...clampedHolePose, theta: device.pose?.theta || 0 }
      })
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

  const handleAngleInputChange = (value: string) => {
    if (device) {
      const numValue = parseFloat(value) || 0
      updateComponent(device.id, { 
        pose: { ...device.pose, theta: numValue },
        holePose: { ...device.holePose, theta: numValue }
      })
    }
  }

  // Get grid boundaries for display (1-based indexing)
  const getGridBoundaries = () => {
    if (!currentTable) return { maxI: 10, maxJ: 10 }
    
    const grid = currentTable.table.grid
    return {
      maxI: grid.nx || 10,  // Maximum i value (1-based)
      maxJ: grid.ny || 10   // Maximum j value (1-based)
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

  const { maxI, maxJ } = getGridBoundaries()

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
              variant={device.locked ? "danger" : "primary"}
              size="sm"
              onClick={handleToggleLock}
            >
              {device.locked ? '🔒 Locked' : '🔓 Unlocked'}
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
                    disabled={device.locked}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locked
                  </label>
                  <Badge variant={device.locked ? 'error' : 'default'}>
                    {device.locked ? 'Locked' : 'Unlocked'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Hole Position - Primary position control with boundary validation (1-based indexing) */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Position (Grid Holes)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column (i) <span className="text-xs text-gray-500">(1-{maxI})</span>
                  </label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min="1"
                      max={maxI}
                      value={device.holePose.i}
                      onChange={(e) => handleHolePositionInputChange('i', e.target.value)}
                      disabled={device.locked}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleHolePositionChange('i', -1)}
                      disabled={device.locked || device.holePose.i <= 1}
                    >
                      -
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleHolePositionChange('i', 1)}
                      disabled={device.locked || device.holePose.i >= maxI}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Row (j) <span className="text-xs text-gray-500">(1-{maxJ})</span>
                  </label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min="1"
                      max={maxJ}
                      value={device.holePose.j}
                      onChange={(e) => handleHolePositionInputChange('j', e.target.value)}
                      disabled={device.locked}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleHolePositionChange('j', -1)}
                      disabled={device.locked || device.holePose.j <= 1}
                    >
                      -
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleHolePositionChange('j', 1)}
                      disabled={device.locked || device.holePose.j >= maxJ}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Angle */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Orientation</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Angle (deg)
                </label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={device.pose.theta.toFixed(1)}
                    onChange={(e) => handleAngleInputChange(e.target.value)}
                    disabled={device.locked}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAngleChange(-5)}
                    disabled={device.locked}
                  >
                    -5°
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAngleChange(5)}
                    disabled={device.locked}
                  >
                    +5°
                  </Button>
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
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⏳</div>
                <p>Loading commands...</p>
              </div>
            ) : (device?.type as any) === 'motor.jankomotor.8812' ? (
              // Special Jankomotor8812 interface
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Jankomotor 8812 Control</h3>
                
                {/* Status */}
                {jankomotorStatus && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{jankomotorStatus}</p>
                  </div>
                )}
                
                {/* Corner Actuator Controls */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Corner Actuator Control</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Corner A</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={jankomotorInputs.cornerA}
                          onChange={(e) => setJankomotorInputs(prev => ({ ...prev, cornerA: e.target.value }))}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Corner B</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={jankomotorInputs.cornerB}
                          onChange={(e) => setJankomotorInputs(prev => ({ ...prev, cornerB: e.target.value }))}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Corner C</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={jankomotorInputs.cornerC}
                          onChange={(e) => setJankomotorInputs(prev => ({ ...prev, cornerC: e.target.value }))}
                          className="text-center"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleCornerRun}
                      className="w-full"
                      variant="primary"
                      disabled={!arduinoConnected}
                    >
                      Run Corner Actuators
                    </Button>
                  </div>
                </div>

                {/* Tip/Tilt Controls */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Optical Tip/Tilt Control</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tip (X)</label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={tipTiltInputs.tip}
                          onChange={(e) => setTipTiltInputs(prev => ({ ...prev, tip: e.target.value }))}
                          className="text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tilt (Y)</label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={tipTiltInputs.tilt}
                          onChange={(e) => setTipTiltInputs(prev => ({ ...prev, tilt: e.target.value }))}
                          className="text-center"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleTipTiltRun}
                      className="w-full"
                      variant="secondary"
                      disabled={!arduinoConnected}
                    >
                      Run Tip/Tilt
                    </Button>
                  </div>
                </div>
                
                {/* Connection Controls */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Arduino Connection</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${arduinoConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {arduinoConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleArduinoConnect} 
                      variant="primary" 
                      size="sm"
                      disabled={arduinoConnected}
                    >
                      Connect
                    </Button>
                    <Button 
                      onClick={handleArduinoDisconnect} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>

                {/* System Controls */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">System Control</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleJankomotorEnable} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Enable
                    </Button>
                    <Button 
                      onClick={handleJankomotorDisable} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Disable
                    </Button>
                    <Button 
                      onClick={handleJankomotorHome} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Home
                    </Button>
                    <Button 
                      onClick={handleJankomotorStop} 
                      variant="danger" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Stop
                    </Button>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <p><strong>Instructions:</strong></p>
                  <ul className="mt-1 space-y-0.5">
                    <li><strong>1. Connect:</strong> Click "Connect" to establish Arduino connection</li>
                    <li><strong>2. Corner Actuators:</strong> Direct control of A, B, C corner screws</li>
                    <li>• Enter step values for each corner (positive/negative)</li>
                    <li>• Each corner independently extends/retracts its actuator</li>
                    <li><strong>3. Tip/Tilt:</strong> Optical alignment control (mapped to corners)</li>
                    <li>• Enter tip/tilt values in degrees or arcseconds</li>
                    <li>• Software maps these to appropriate corner movements</li>
                    <li><strong>4. System:</strong> Use Enable/Disable, Home, Stop as needed</li>
                    <li><strong>5. Disconnect:</strong> Click "Disconnect" when done</li>
                  </ul>
                </div>
              </div>
            ) : deviceConfig?.commands && deviceConfig.commands.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Available Commands</h3>
                {deviceConfig.commands.map((command, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{command.label}</h4>
                      <Button size="sm" variant="primary">
                        Execute
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{command.description}</p>
                    {command.args && command.args.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-500 uppercase">Parameters</h5>
                        {command.args.map((arg, argIndex) => (
                          <div key={argIndex} className="flex items-center gap-2">
                            <Input
                              type={arg.type === 'number' ? 'number' : 'text'}
                              placeholder={arg.name}
                              className="flex-1"
                              disabled
                            />
                            <span className="text-xs text-gray-500">
                              {arg.required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⚡</div>
                <p>No commands available for this device</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⏳</div>
                <p>Loading telemetry...</p>
              </div>
            ) : deviceConfig?.telemetry && deviceConfig.telemetry.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Telemetry Data</h3>
                {deviceConfig.telemetry.map((telemetry, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{telemetry.label}</h4>
                      <Badge variant="default">
                        {telemetry.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {telemetry.unit && <span className="text-gray-500">Unit: {telemetry.unit}</span>}
                    </div>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm font-mono text-gray-700">
                      {telemetry.type === 'number' ? '0.00' : 
                       telemetry.type === 'string' ? 'Status' : 
                       telemetry.type === 'image' ? 'Image data' : 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No telemetry available for this device</p>
              </div>
            )}
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