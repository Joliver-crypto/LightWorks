import React, { useState, useEffect, useRef } from 'react'
import { Component } from '../../models/fileFormat'
import { Tabs } from '../Common/Tabs'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
import { useFileStore } from '../../storage/useFileStore'
import { useSelectionStore } from '../../state/useSelectionStore'
import { deviceRegistry, DeviceConfig } from '../../../hardware/deviceRegistry'
import { executeArduinoCommand, connectToArduino, disconnectFromArduino } from '../../../hardware/arduinoClient'
import { useExtensionStore } from '../../state/useExtensionStore'

interface DeviceInspectorProps {
  device?: Component
  devices?: Component[]
}

const tabs = [
  { id: 'properties', label: 'Properties' },
  { id: 'commands', label: 'Commands' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'binding', label: 'Driver' },
]

// Commands Section Component
function CommandsSection({ 
  device, 
  deviceConfig, 
  loading,
  // Jankomotor props
  jankomotorInputs,
  setJankomotorInputs,
  tipTiltInputs,
  setTipTiltInputs,
  jankomotorStatus,
  arduinoConnected,
  handleArduinoCommand,
  handleCornerRun,
  handleTipTiltRun,
  handleJankomotorZero,
  handleJankomotorPosition,
  handleJankomotorStatus,
  handleJankomotorSafety,
  handleJankomotorPing,
  handleJankomotorStop,
  handleArduinoConnect,
  handleArduinoDisconnect
}: { 
  device?: Component
  deviceConfig: DeviceConfig | null
  loading: boolean
  // Jankomotor props
  jankomotorInputs?: { cornerA: string, cornerB: string, cornerC: string }
  setJankomotorInputs?: (inputs: { cornerA: string, cornerB: string, cornerC: string }) => void
  tipTiltInputs?: { tip: string, tilt: string }
  setTipTiltInputs?: (inputs: { tip: string, tilt: string }) => void
  jankomotorStatus?: string
  arduinoConnected?: boolean
  handleArduinoCommand?: (command: string) => Promise<void>
  handleCornerRun?: () => Promise<void>
  handleTipTiltRun?: () => Promise<void>
  handleJankomotorZero?: () => Promise<void>
  handleJankomotorPosition?: () => Promise<void>
  handleJankomotorStatus?: () => Promise<void>
  handleJankomotorSafety?: () => Promise<void>
  handleJankomotorPing?: () => Promise<void>
  handleJankomotorStop?: () => Promise<void>
  handleArduinoConnect?: () => Promise<void>
  handleArduinoDisconnect?: () => Promise<void>
}) {
  const { 
    getAvailableDrivers, 
    getDriverForDevice, 
    enableDriver,
    getExtensionsForHardware,
    isExtensionInstalled
  } = useExtensionStore()
  
  const deviceType = device?.type || ''
  const currentDriver = getDriverForDevice(deviceType)
  const allExtensions = getExtensionsForHardware(deviceType)
  const availableDrivers = getAvailableDrivers(deviceType)
  
  // Get display name for current driver
  const getDriverDisplayName = (driverId: string | null): string => {
    if (!driverId) return ''
    const extension = allExtensions.find(ext => ext.driverId === driverId || ext.name === driverId)
    return extension?.name || driverId
  }
  
  const handleDriverSelect = (driverId: string) => {
    enableDriver(deviceType, driverId)
  }
  
  // Check if commands should be shown
  const shouldShowCommands = () => {
    // Jankomotor8812 always shows commands (uses Serial Communication)
    if (deviceType === 'motor.jankomotor.8812') {
      return true
    }
    // DMK37 needs a driver selected
    if (deviceType === 'camera.dmk37') {
      return !!currentDriver
    }
    // Other devices show commands from device config
    return !!deviceConfig?.commands && deviceConfig.commands.length > 0
  }
  
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">⏳</div>
        <p>Loading commands...</p>
      </div>
    )
  }
  
  // Jankomotor8812 special handling
  if (deviceType === 'motor.jankomotor.8812') {
    return (
      <JankomotorCommandsSection 
        device={device}
        jankomotorInputs={jankomotorInputs || { cornerA: '', cornerB: '', cornerC: '' }}
        setJankomotorInputs={setJankomotorInputs || (() => {})}
        tipTiltInputs={tipTiltInputs || { tip: '', tilt: '' }}
        setTipTiltInputs={setTipTiltInputs || (() => {})}
        jankomotorStatus={jankomotorStatus || ''}
        arduinoConnected={arduinoConnected || false}
        handleArduinoCommand={handleArduinoCommand}
        handleCornerRun={handleCornerRun}
        handleTipTiltRun={handleTipTiltRun}
        handleJankomotorZero={handleJankomotorZero}
        handleJankomotorPosition={handleJankomotorPosition}
        handleJankomotorStatus={handleJankomotorStatus}
        handleJankomotorSafety={handleJankomotorSafety}
        handleJankomotorPing={handleJankomotorPing}
        handleJankomotorStop={handleJankomotorStop}
        handleArduinoConnect={handleArduinoConnect}
        handleArduinoDisconnect={handleArduinoDisconnect}
      />
    )
  }
  
  // DMK37 with driver selection
  if (deviceType === 'camera.dmk37') {
    return (
      <DMK37CommandsSection
        device={device}
        deviceConfig={deviceConfig}
        currentDriver={currentDriver}
        availableDrivers={availableDrivers}
        allExtensions={allExtensions}
        onDriverSelect={handleDriverSelect}
      />
    )
  }
  
  // Default commands section
  if (!shouldShowCommands()) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">⚡</div>
        <p>No commands available</p>
        <p className="text-xs mt-2">Select a driver in the Driver tab to enable commands</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Software:</span>
          <span className="text-sm font-medium text-gray-900">Native Driver</span>
        </div>
      </div>
      
      {deviceConfig?.commands && deviceConfig.commands.length > 0 ? (
        deviceConfig.commands.map((command, index) => (
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
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">⚡</div>
          <p>No commands available for this device</p>
        </div>
      )}
    </div>
  )
}

// Live Camera View Component (IC Capture 2.5 style)
function LiveCameraView({ device }: { device?: Component }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAcquiring, setIsAcquiring] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [frameRate, setFrameRate] = useState(0)
  const frameCountRef = useRef(0)
  const lastFrameTimeRef = useRef(Date.now())
  const animationFrameRef = useRef<number | null>(null)

  // Poll for frames when acquiring
  useEffect(() => {
    if (!isAcquiring || connectionStatus !== 'connected') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const pollFrames = async () => {
      try {
        // TODO: Replace with actual API call to get camera frames
        // For now, simulate frame updates
        // This would connect to the Python backend via Electron IPC or HTTP/WebSocket
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Simulated frame - in real implementation, this would come from camera backend
        // For now, show a placeholder
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw placeholder text
        ctx.fillStyle = '#888'
        ctx.font = '16px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('Live View (IC Capture 2.5)', canvas.width / 2, canvas.height / 2 - 10)
        ctx.fillText('Waiting for camera frames...', canvas.width / 2, canvas.height / 2 + 10)

        // Update frame rate
        frameCountRef.current++
        const now = Date.now()
        const elapsed = now - lastFrameTimeRef.current
        if (elapsed >= 1000) {
          setFrameRate(frameCountRef.current)
          frameCountRef.current = 0
          lastFrameTimeRef.current = now
        }

        animationFrameRef.current = requestAnimationFrame(pollFrames)
      } catch (error) {
        console.error('Error polling frames:', error)
      }
    }

    animationFrameRef.current = requestAnimationFrame(pollFrames)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isAcquiring, connectionStatus])

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size (adjust based on available space)
    canvas.width = 640
    canvas.height = 480
  }, [])

  const handleConnect = async () => {
    setConnectionStatus('connecting')
    // TODO: Connect to camera via backend API
    // For now, simulate connection
    setTimeout(() => {
      setConnectionStatus('connected')
    }, 500)
  }

  const handleDisconnect = async () => {
    setIsAcquiring(false)
    setConnectionStatus('disconnected')
    // TODO: Disconnect from camera
  }

  const handleStartAcquisition = async () => {
    if (connectionStatus !== 'connected') {
      await handleConnect()
    }
    setIsAcquiring(true)
    frameCountRef.current = 0
    lastFrameTimeRef.current = Date.now()
    // TODO: Start camera acquisition via backend API
  }

  const handleStopAcquisition = async () => {
    setIsAcquiring(false)
    // TODO: Stop camera acquisition via backend API
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-900">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white text-sm">Live Camera View</h4>
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' && (
            <Badge variant={isAcquiring ? 'success' : 'default'} className="text-xs">
              {isAcquiring ? 'Live' : 'Idle'}
            </Badge>
          )}
          {frameRate > 0 && (
            <span className="text-xs text-gray-400">{frameRate} fps</span>
          )}
        </div>
      </div>
      
      {/* Canvas for displaying frames */}
      <div className="relative bg-black rounded overflow-hidden mb-3" style={{ aspectRatio: '4/3' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block', imageRendering: 'pixelated' }}
        />
        {connectionStatus === 'disconnected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">Camera Not Connected</p>
            </div>
          </div>
        )}
        {connectionStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-500">
              <div className="animate-pulse text-4xl mb-2">⏳</div>
              <p className="text-sm">Connecting...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {connectionStatus === 'disconnected' ? (
          <Button
            size="sm"
            variant="primary"
            onClick={handleConnect}
            className="flex-1"
          >
            Connect Camera
          </Button>
        ) : (
          <>
            {!isAcquiring ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartAcquisition}
                className="flex-1"
              >
                Start Live View
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleStopAcquisition}
                className="flex-1"
              >
                Stop Live View
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </>
        )}
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        Live view similar to IC Capture 2.5. Connect camera and start acquisition to see frames.
      </p>
    </div>
  )
}

// DMK37 Commands Section with Driver Selection
function DMK37CommandsSection({ 
  device, 
  deviceConfig,
  currentDriver,
  availableDrivers,
  allExtensions,
  onDriverSelect
}: {
  device?: Component
  deviceConfig: DeviceConfig | null
  currentDriver: string | null
  availableDrivers: any[]
  allExtensions: any[]
  onDriverSelect: (driverId: string) => void
}) {
  // Get commands from the selected driver extension
  const getCommandsForDriver = () => {
    if (!currentDriver) return []
    
    const extension = allExtensions.find(ext => ext.driverId === currentDriver || ext.name === currentDriver)
    if (!extension) return []
    
    const deviceDefinition = extension.devices?.find((d: any) => d.kind === 'camera.dmk37')
    return deviceDefinition?.commands ? Object.entries(deviceDefinition.commands).map(([name, cmd]: [string, any]) => ({
      name,
      label: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `Execute ${name}`,
      args: cmd.args || []
    })) : []
  }
  
  const driverCommands = getCommandsForDriver()
  const selectedExtension = allExtensions.find(ext => ext.driverId === currentDriver || ext.name === currentDriver)
  
  return (
    <div className="space-y-4">
      {/* Driver Selection at Top */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Driver Software
        </label>
        <select
          value={currentDriver || ''}
          onChange={(e) => onDriverSelect(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">-- Select Driver --</option>
          {availableDrivers.map((driver) => (
            <option key={driver.driverId || driver.name} value={driver.driverId || driver.name}>
              {driver.name}
            </option>
          ))}
        </select>
        {!currentDriver && (
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ Select a driver to enable commands. Install drivers from the Extensions page.
          </p>
        )}
      </div>
      
      {/* Commands - Only shown if driver selected */}
      {currentDriver ? (
        <div className="space-y-3">
          {/* Software label at top of commands */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-blue-700">Software:</span>
              <span className="text-sm font-medium text-blue-900">{selectedExtension?.name || currentDriver}</span>
              <Badge variant="info" className="text-xs">Active</Badge>
            </div>
          </div>
          
          {/* Live Camera View - Only show for IC Capture 2.5 */}
          {currentDriver === 'ic-capture-2.5' && (
            <LiveCameraView device={device} />
          )}
          
          {/* Commands from selected driver */}
          {driverCommands.length > 0 ? (
            driverCommands.map((command, index) => (
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
                    {command.args.map((arg: any, argIndex: number) => (
                      <div key={argIndex} className="flex items-center gap-2">
                        <Input
                          type={arg.type === 'number' ? 'number' : 'text'}
                          placeholder={arg.name}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-500">
                          {arg.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">⚡</div>
              <p>No commands available for selected driver</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg p-8">
          <div className="text-4xl mb-2">📷</div>
          <p className="font-medium">No Driver Selected</p>
          <p className="text-xs mt-2">
            Select a driver from the dropdown above to enable camera commands.
          </p>
        </div>
      )}
    </div>
  )
}

// Jankomotor Commands Section (keeping existing functionality)
function JankomotorCommandsSection({ 
  device,
  jankomotorInputs,
  setJankomotorInputs,
  tipTiltInputs,
  setTipTiltInputs,
  jankomotorStatus,
  arduinoConnected,
  handleArduinoCommand,
  handleCornerRun,
  handleTipTiltRun,
  handleJankomotorZero,
  handleJankomotorPosition,
  handleJankomotorStatus,
  handleJankomotorSafety,
  handleJankomotorPing,
  handleJankomotorStop,
  handleArduinoConnect,
  handleArduinoDisconnect
}: {
  device?: Component
  jankomotorInputs: { cornerA: string, cornerB: string, cornerC: string }
  setJankomotorInputs: (inputs: { cornerA: string, cornerB: string, cornerC: string }) => void
  tipTiltInputs: { tip: string, tilt: string }
  setTipTiltInputs: (inputs: { tip: string, tilt: string }) => void
  jankomotorStatus: string
  arduinoConnected: boolean
  handleArduinoCommand?: (command: string) => Promise<void>
  handleCornerRun?: () => Promise<void>
  handleTipTiltRun?: () => Promise<void>
  handleJankomotorZero?: () => Promise<void>
  handleJankomotorPosition?: () => Promise<void>
  handleJankomotorStatus?: () => Promise<void>
  handleJankomotorSafety?: () => Promise<void>
  handleJankomotorPing?: () => Promise<void>
  handleJankomotorStop?: () => Promise<void>
  handleArduinoConnect?: () => Promise<void>
  handleArduinoDisconnect?: () => Promise<void>
}) {
  return (
    <div className="space-y-3">
      {/* Software Label */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Software:</span>
          <span className="text-sm font-medium text-gray-900">Serial Communication (Arduino-based)</span>
        </div>
      </div>
      
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
                onChange={(e) => setJankomotorInputs({ ...jankomotorInputs, cornerA: e.target.value })}
                className="text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Corner B</label>
              <Input
                type="number"
                placeholder="0"
                value={jankomotorInputs.cornerB}
                onChange={(e) => setJankomotorInputs({ ...jankomotorInputs, cornerB: e.target.value })}
                className="text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Corner C</label>
              <Input
                type="number"
                placeholder="0"
                value={jankomotorInputs.cornerC}
                onChange={(e) => setJankomotorInputs({ ...jankomotorInputs, cornerC: e.target.value })}
                className="text-center"
              />
            </div>
          </div>
          <Button 
            onClick={handleCornerRun}
            className="w-full"
            variant="primary"
            disabled={!arduinoConnected || !handleCornerRun}
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
                onChange={(e) => setTipTiltInputs({ ...tipTiltInputs, tip: e.target.value })}
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
                onChange={(e) => setTipTiltInputs({ ...tipTiltInputs, tilt: e.target.value })}
                className="text-center"
              />
            </div>
          </div>
          <Button 
            onClick={handleTipTiltRun}
            className="w-full"
            variant="secondary"
            disabled={!arduinoConnected || !handleTipTiltRun}
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
            disabled={arduinoConnected || !handleArduinoConnect}
          >
            Connect
          </Button>
          <Button 
            onClick={handleArduinoDisconnect} 
            variant="secondary" 
            size="sm"
            disabled={!arduinoConnected || !handleArduinoDisconnect}
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
            onClick={handleJankomotorZero} 
            variant="secondary" 
            size="sm"
            disabled={!arduinoConnected || !handleJankomotorZero}
          >
            Zero
          </Button>
          <Button 
            onClick={handleJankomotorPosition} 
            variant="secondary" 
            size="sm"
            disabled={!arduinoConnected || !handleJankomotorPosition}
          >
            Position
          </Button>
          <Button 
            onClick={handleJankomotorStatus} 
            variant="secondary" 
            size="sm"
            disabled={!arduinoConnected || !handleJankomotorStatus}
          >
            Status
          </Button>
          <Button 
            onClick={handleJankomotorSafety} 
            variant="secondary" 
            size="sm"
            disabled={!arduinoConnected || !handleJankomotorSafety}
          >
            Safety
          </Button>
          <Button 
            onClick={handleJankomotorPing} 
            variant="secondary" 
            size="sm"
            disabled={!arduinoConnected || !handleJankomotorPing}
          >
            Ping
          </Button>
          <Button 
            onClick={handleJankomotorStop} 
            variant="danger" 
            size="sm"
            disabled={!arduinoConnected || !handleJankomotorStop}
          >
            Stop
          </Button>
        </div>
      </div>
    </div>
  )
}

// Driver Selection Component (for Driver tab)
function DriverSelection({ device, deviceConfig }: { device: Component, deviceConfig: DeviceConfig | null }) {
  const { 
    getAvailableDrivers, 
    getDriverForDevice, 
    enableDriver,
    getExtensionsForHardware 
  } = useExtensionStore()
  
  const deviceType = device?.type || ''
  const availableDrivers = getAvailableDrivers(deviceType)
  const currentDriver = getDriverForDevice(deviceType)
  const allExtensions = getExtensionsForHardware(deviceType)
  
  const handleDriverSelect = (driverId: string) => {
    enableDriver(deviceType, driverId)
  }
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Available Drivers</h3>
        <p className="text-xs text-gray-500 mb-4">
          Select a driver extension to use with this hardware. Only installed extensions that support this device are shown.
        </p>
      </div>
      
      {allExtensions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📦</div>
          <p>No compatible extensions found</p>
          <p className="text-xs mt-2">Install a compatible driver extension from the Extensions page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allExtensions.map((ext) => {
            const isInstalled = availableDrivers.some(d => d.name === ext.name)
            const isSelected = currentDriver === ext.driverId
            
            return (
              <div 
                key={ext.name} 
                className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{ext.name}</h4>
                      <Badge variant={isInstalled ? 'success' : 'default'}>
                        {isInstalled ? 'Installed' : 'Not Installed'}
                      </Badge>
                      {isSelected && (
                        <Badge variant="info">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ext.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ext.badges?.map((badge, idx) => (
                        <Badge key={idx} variant="default" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      Version: {ext.version} | 
                      OS: {ext.os.join(', ')}
                    </div>
                  </div>
                  <div className="ml-4">
                    {isInstalled ? (
                      <Button
                        variant={isSelected ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handleDriverSelect(ext.driverId || ext.name)}
                        disabled={isSelected}
                      >
                        {isSelected ? 'Selected' : 'Select Driver'}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                      >
                        Install Required
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {currentDriver && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Active Driver:</strong> {currentDriver}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Commands in this device will use the selected driver extension.
          </p>
        </div>
      )}
    </div>
  )
}

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

  const handleJankomotorZero = async () => {
    await handleArduinoCommand('ZERO')
  }

  const handleJankomotorPosition = async () => {
    await handleArduinoCommand('POSITION')
  }

  const handleJankomotorStatus = async () => {
    await handleArduinoCommand('STATUS')
  }

  const handleJankomotorSafety = async () => {
    await handleArduinoCommand('SAFETY')
  }

  const handleJankomotorPing = async () => {
    await handleArduinoCommand('PING')
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

            {/* Device Size - Show for devices that support resizing */}
            {(() => {
              console.log('Device type in inspector:', device.type);
              // Show size controls for devices that can be resized (larger than 1x1 or specific types)
              return (device.type.includes('laser') || device.type === 'Laser' || 
                      device.type.includes('stage') || device.type === 'Stage' ||
                      device.type.includes('camera') || device.type === 'Camera' ||
                      device.type.includes('motor') || device.type === 'Motor' ||
                      device.type.includes('spectrograph') || device.type === 'SR-750' ||
                      device.type.includes('newport') || device.type.includes('esp') ||
                      device.type.includes('thorlabs') || device.type.includes('jankomotor'));
            })() && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Device Size (Grid Holes)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width <span className="text-xs text-gray-500">(1-10 holes)</span>
                    </label>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={device.size?.width || 1}
                        onChange={(e) => {
                          const width = Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                          updateComponent(device.id, { 
                            size: { 
                              width, 
                              height: device.size?.height || 1 
                            } 
                          })
                        }}
                        disabled={device.locked}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const currentWidth = device.size?.width || 1
                          const newWidth = Math.max(1, currentWidth - 1)
                          updateComponent(device.id, { 
                            size: { 
                              width: newWidth, 
                              height: device.size?.height || 1 
                            } 
                          })
                        }}
                        disabled={device.locked || (device.size?.width || 1) <= 1}
                      >
                        -
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const currentWidth = device.size?.width || 1
                          const newWidth = Math.min(10, currentWidth + 1)
                          updateComponent(device.id, { 
                            size: { 
                              width: newWidth, 
                              height: device.size?.height || 1 
                            } 
                          })
                        }}
                        disabled={device.locked || (device.size?.width || 1) >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height <span className="text-xs text-gray-500">(1-10 holes)</span>
                    </label>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={device.size?.height || 1}
                        onChange={(e) => {
                          const height = Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                          updateComponent(device.id, { 
                            size: { 
                              width: device.size?.width || 1, 
                              height 
                            } 
                          })
                        }}
                        disabled={device.locked}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const currentHeight = device.size?.height || 1
                          const newHeight = Math.max(1, currentHeight - 1)
                          updateComponent(device.id, { 
                            size: { 
                              width: device.size?.width || 1, 
                              height: newHeight 
                            } 
                          })
                        }}
                        disabled={device.locked || (device.size?.height || 1) <= 1}
                      >
                        -
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const currentHeight = device.size?.height || 1
                          const newHeight = Math.min(10, currentHeight + 1)
                          updateComponent(device.id, { 
                            size: { 
                              width: device.size?.width || 1, 
                              height: newHeight 
                            } 
                          })
                        }}
                        disabled={device.locked || (device.size?.height || 1) >= 10}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Current size: {device.size?.width || 1} × {device.size?.height || 1} holes
                </div>
              </div>
            )}

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
          <CommandsSection 
            device={device} 
            deviceConfig={deviceConfig} 
            loading={loading}
            jankomotorInputs={jankomotorInputs}
            setJankomotorInputs={setJankomotorInputs}
            tipTiltInputs={tipTiltInputs}
            setTipTiltInputs={setTipTiltInputs}
            jankomotorStatus={jankomotorStatus}
            arduinoConnected={arduinoConnected}
            handleArduinoCommand={handleArduinoCommand}
            handleCornerRun={handleCornerRun}
            handleTipTiltRun={handleTipTiltRun}
            handleJankomotorZero={handleJankomotorZero}
            handleJankomotorPosition={handleJankomotorPosition}
            handleJankomotorStatus={handleJankomotorStatus}
            handleJankomotorSafety={handleJankomotorSafety}
            handleJankomotorPing={handleJankomotorPing}
            handleJankomotorStop={handleJankomotorStop}
            handleArduinoConnect={handleArduinoConnect}
            handleArduinoDisconnect={handleArduinoDisconnect}
          />
        )}

        {activeTab === 'telemetry' && (
          <div>
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
          <DriverSelection device={device} deviceConfig={deviceConfig} />
        )}
      </div>
    </div>
  )
}