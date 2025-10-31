import React, { useState, useEffect, useRef } from 'react'
import { Component } from '../../models/fileFormat'
import { Tabs } from '../Common/Tabs'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
import { Slider } from '../Common/Slider'
import { useFileStore } from '../../storage/useFileStore'
import { useSelectionStore } from '../../state/useSelectionStore'
import { deviceRegistry, DeviceConfig } from '../../../hardware/deviceRegistry'
import { executeArduinoCommand, connectToArduino, disconnectFromArduino } from '../../../hardware/arduinoClient'

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

// Debug log entry type
interface DebugLogEntry {
  timestamp: number
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  data?: any
}

// Live Camera View Component (IC Capture 2.5 style)
function LiveCameraView({ device }: { device?: Component }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAcquiring, setIsAcquiring] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [frameRate, setFrameRate] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraInUse, setCameraInUse] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([])
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})
  const frameCountRef = useRef(0)
  const lastFrameTimeRef = useRef(Date.now())
  const animationFrameRef = useRef<number | null>(null)
  const debugLogLimit = 100 // Keep last 100 log entries

  // Camera settings with sliders
  const [settings, setSettings] = useState({
    brightness: 50,    // 0-100
    contrast: 50,     // 0-100
    exposure: 1000,   // 1-1000000 μs
    gain: 0,          // 0-100 dB
    gamma: 50,        // 0-100
    saturation: 50,   // 0-100
  })

  // Debug logging function
  const debugLog = (level: DebugLogEntry['level'], message: string, data?: any) => {
    const entry: DebugLogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data
    }
    
    // Log to console
    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'
    console[consoleMethod](`[Camera Debug ${level.toUpperCase()}]`, message, data || '')
    
    // Add to debug logs
    setDebugLogs(prev => {
      const newLogs = [...prev, entry]
      // Keep only last N entries
      return newLogs.slice(-debugLogLimit)
    })
    
    // Update debug info
    setDebugInfo(prev => ({
      ...prev,
      lastLog: entry,
      logCount: prev.logCount ? prev.logCount + 1 : 1
    }))
  }

  // Update debug info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus,
        isAcquiring,
        frameRate,
        cameraInUse,
        error,
        canvasSize: canvasRef.current ? {
          width: canvasRef.current.width,
          height: canvasRef.current.height
        } : null,
        timestamp: Date.now()
      }))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [connectionStatus, isAcquiring, frameRate, cameraInUse, error])

  // Handle fullscreen
  const handleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

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
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Simulated frame - in real implementation, this would come from camera backend
        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Apply brightness/contrast filters
        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`
        
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
          const newFrameRate = frameCountRef.current
          setFrameRate(newFrameRate)
          if (newFrameRate > 0) {
            debugLog('debug', `Frame rate: ${newFrameRate} fps`, { frames: frameCountRef.current, elapsed })
          }
          frameCountRef.current = 0
          lastFrameTimeRef.current = now
        }

        animationFrameRef.current = requestAnimationFrame(pollFrames)
      } catch (error) {
        debugLog('error', 'Error polling frames', { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined })
      }
    }

    animationFrameRef.current = requestAnimationFrame(pollFrames)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isAcquiring, connectionStatus, settings])

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const newWidth = isFullscreen ? window.innerWidth : 640
    const newHeight = isFullscreen ? window.innerHeight : 480
    
    debugLog('debug', 'Canvas size changed', { 
      width: newWidth, 
      height: newHeight, 
      fullscreen: isFullscreen 
    })
    
    canvas.width = newWidth
    canvas.height = newHeight
  }, [isFullscreen])
  
  // Initial debug log
  useEffect(() => {
    debugLog('info', 'LiveCameraView component initialized', { device: device?.type })
  }, [])

  const handleConnect = async () => {
    debugLog('info', 'Attempting to connect to camera', { device: device?.type })
    setError(null)
    setCameraInUse(false)
    setConnectionStatus('connecting')
    
    try {
      // TODO: Connect to camera via backend API
      // For now, simulate connection with conflict detection
      // In real implementation, check if camera is already in use
      
      debugLog('debug', 'Checking camera availability')
      
      // Simulate checking for camera conflicts
      // This would typically check if IC Capture 2.5 or another app is using the camera
      const checkCameraAvailability = async () => {
        debugLog('debug', 'Calling camera availability check API')
        // TODO: Call backend API to check camera availability
        // Return { available: boolean, inUseBy?: string }
        // For now, we'll simulate this
        const result = { available: true, inUseBy: null }
        debugLog('debug', 'Camera availability check result', result)
        return result
      }
      
      const availability = await checkCameraAvailability()
      
      if (!availability.available) {
        debugLog('warning', 'Camera not available', availability)
        setCameraInUse(true)
        setConnectionStatus('disconnected')
        const errorMsg = `Camera is already in use by ${availability.inUseBy || 'another application'} (e.g., IC Capture 2.5). ` +
          `Please close the other application and try again.`
        setError(errorMsg)
        debugLog('error', 'Camera connection failed - already in use', { inUseBy: availability.inUseBy })
        return
      }
      
      debugLog('info', 'Camera available, attempting connection')
      
      // Attempt to connect
      // TODO: Actual connection call to backend
      // This might fail with "device already in use" error
      debugLog('debug', 'Sending connection request to backend')
      
      // Simulate connection success
      setTimeout(() => {
        debugLog('info', 'Camera connection successful')
        setConnectionStatus('connected')
        setDebugInfo(prev => ({
          ...prev,
          connectedAt: Date.now(),
          connectionAttempts: (prev.connectionAttempts || 0) + 1
        }))
      }, 500)
    } catch (err: any) {
      // Handle connection errors
      const errorMessage = err?.message || String(err)
      debugLog('error', 'Connection error', { error: errorMessage, stack: err?.stack })
      
      if (errorMessage.includes('already in use') || 
          errorMessage.includes('device busy') ||
          errorMessage.includes('access denied') ||
          errorMessage.includes('exclusive access')) {
        debugLog('warning', 'Camera in use by another application')
        setCameraInUse(true)
        setError(
          'Camera is already in use by another application (e.g., IC Capture 2.5). ' +
          'Please close IC Capture 2.5 or any other camera software and try again.'
        )
      } else {
        setError(`Connection failed: ${errorMessage}`)
      }
      
      setConnectionStatus('disconnected')
      setDebugInfo(prev => ({
        ...prev,
        lastError: errorMessage,
        errorTimestamp: Date.now()
      }))
    }
  }

  const handleDisconnect = async () => {
    debugLog('info', 'Disconnecting from camera')
    setIsAcquiring(false)
    setConnectionStatus('disconnected')
    debugLog('debug', 'Camera disconnected', { wasAcquiring: isAcquiring })
    // TODO: Disconnect from camera
  }

  const handleStartAcquisition = async () => {
    debugLog('info', 'Starting camera acquisition')
    
    // Ensure camera is connected first
    if (connectionStatus !== 'connected') {
      debugLog('debug', 'Camera not connected, attempting connection first')
      // Attempt connection first
      await handleConnect()
      
      // Check if connection failed (camera in use or error)
      if (cameraInUse || error) {
        debugLog('warning', 'Cannot start acquisition - connection failed', { cameraInUse, error })
        return // Don't proceed if connection failed
      }
      
      // Wait a brief moment for connection to establish
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Double-check connection status after waiting
      if (connectionStatus !== 'connected') {
        debugLog('warning', 'Connection not established after wait')
        return
      }
    }
    
    setError(null)
    
    try {
      debugLog('debug', 'Setting acquisition state to true')
      setIsAcquiring(true)
      frameCountRef.current = 0
      lastFrameTimeRef.current = Date.now()
      debugLog('info', 'Acquisition started', { frameCount: frameCountRef.current })
      
      // TODO: Start camera acquisition via backend API
      // This might fail if camera was taken by another app during connection
      setDebugInfo(prev => ({
        ...prev,
        acquisitionStartedAt: Date.now(),
        acquisitionAttempts: (prev.acquisitionAttempts || 0) + 1
      }))
    } catch (err: any) {
      const errorMessage = err?.message || String(err)
      debugLog('error', 'Failed to start acquisition', { error: errorMessage, stack: err?.stack })
      
      if (errorMessage.includes('already in use') || 
          errorMessage.includes('device busy') ||
          errorMessage.includes('access denied') ||
          errorMessage.includes('exclusive access')) {
        setCameraInUse(true)
        setError(
          'Camera was taken by another application. ' +
          'Please close IC Capture 2.5 and restart the live view.'
        )
      } else {
        setError(`Failed to start acquisition: ${errorMessage}`)
      }
      setIsAcquiring(false)
    }
  }

  const handleStopAcquisition = async () => {
    debugLog('info', 'Stopping camera acquisition')
    setIsAcquiring(false)
    debugLog('debug', 'Acquisition stopped', { finalFrameCount: frameCountRef.current })
    setDebugInfo(prev => ({
      ...prev,
      acquisitionStoppedAt: Date.now(),
      totalFramesAcquired: (prev.totalFramesAcquired || 0) + frameCountRef.current
    }))
    // TODO: Stop camera acquisition via backend API
  }

  const handleSettingChange = (key: keyof typeof settings, value: number) => {
    debugLog('debug', `Camera setting changed: ${key}`, { oldValue: settings[key], newValue: value })
    setSettings(prev => ({ ...prev, [key]: value }))
    setDebugInfo(prev => ({
      ...prev,
      lastSettingChanged: key,
      lastSettingValue: value,
      settingsUpdateCount: (prev.settingsUpdateCount || 0) + 1
    }))
    // TODO: Send setting to camera backend
  }

  const clearDebugLogs = () => {
    debugLog('info', 'Debug logs cleared')
    setDebugLogs([])
    setDebugInfo({})
  }

  const exportDebugLogs = () => {
    const debugData = {
      timestamp: Date.now(),
      device: device?.type,
      debugInfo,
      logs: debugLogs,
      settings,
      connectionStatus,
      isAcquiring,
      frameRate,
      error
    }
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `camera-debug-${device?.type || 'camera'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    debugLog('info', 'Debug logs exported', { fileName: a.download })
  }

  return (
    <div 
      ref={containerRef}
      className={`border border-gray-200 rounded-lg bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
    >
      {/* Slider Controls (IC Capture 2.5 style) */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <Slider
            label="Brightness"
            value={settings.brightness}
            min={0}
            max={100}
            step={1}
            onChange={(value) => handleSettingChange('brightness', value)}
            disabled={!connectionStatus || connectionStatus === 'disconnected'}
          />
          <Slider
            label="Contrast"
            value={settings.contrast}
            min={0}
            max={100}
            step={1}
            onChange={(value) => handleSettingChange('contrast', value)}
            disabled={!connectionStatus || connectionStatus === 'disconnected'}
          />
          <Slider
            label="Exposure"
            value={settings.exposure}
            min={1}
            max={1000000}
            step={100}
            unit="μs"
            onChange={(value) => handleSettingChange('exposure', value)}
            disabled={!connectionStatus || connectionStatus === 'disconnected'}
          />
          <Slider
            label="Gain"
            value={settings.gain}
            min={0}
            max={100}
            step={1}
            unit="dB"
            onChange={(value) => handleSettingChange('gain', value)}
            disabled={!connectionStatus || connectionStatus === 'disconnected'}
          />
          <Slider
            label="Gamma"
            value={settings.gamma}
            min={0}
            max={100}
            step={1}
            onChange={(value) => handleSettingChange('gamma', value)}
            disabled={!connectionStatus || connectionStatus === 'disconnected'}
          />
          <Slider
            label="Saturation"
            value={settings.saturation}
            min={0}
            max={100}
            step={1}
            onChange={(value) => handleSettingChange('saturation', value)}
            disabled={!connectionStatus || connectionStatus === 'disconnected'}
          />
        </div>
      </div>

      {/* Canvas and Controls */}
      <div className="p-4">
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs"
            >
              {showDebug ? 'Hide Debug' : 'Debug'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleFullscreen}
              className="text-xs"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-3 p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-white text-xs">Debug Information</h5>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={clearDebugLogs}
                  className="text-xs"
                >
                  Clear Logs
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={exportDebugLogs}
                  className="text-xs"
                >
                  Export
                </Button>
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
              <div>
                <span className="text-gray-400">Status:</span>
                <span className="ml-2 text-white">{connectionStatus}</span>
              </div>
              <div>
                <span className="text-gray-400">Acquiring:</span>
                <span className="ml-2 text-white">{isAcquiring ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-400">Frame Rate:</span>
                <span className="ml-2 text-white">{frameRate} fps</span>
              </div>
              <div>
                <span className="text-gray-400">Camera In Use:</span>
                <span className="ml-2 text-white">{cameraInUse ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-400">Canvas:</span>
                <span className="ml-2 text-white">
                  {debugInfo.canvasSize ? `${debugInfo.canvasSize.width}x${debugInfo.canvasSize.height}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Log Count:</span>
                <span className="ml-2 text-white">{debugInfo.logCount || 0}</span>
              </div>
            </div>
            
            {/* Debug Logs */}
            <div className="max-h-48 overflow-y-auto bg-black rounded p-2 text-xs font-mono">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500">No debug logs yet</p>
              ) : (
                debugLogs.map((log, idx) => (
                  <div key={idx} className="mb-1 flex items-start gap-2">
                    <span className="text-gray-500 w-20 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`w-16 shrink-0 ${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warning' ? 'text-yellow-400' :
                      log.level === 'info' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-gray-300 flex-1">{log.message}</span>
                    {log.data && (
                      <span className="text-gray-500">({JSON.stringify(log.data).substring(0, 50)})</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Canvas for displaying frames */}
        <div className="relative bg-black rounded overflow-hidden mb-3" style={{ aspectRatio: isFullscreen ? 'auto' : '4/3', minHeight: isFullscreen ? 'calc(100vh - 200px)' : 'auto' }}>
          <canvas
            ref={canvasRef}
            className={`w-full ${isFullscreen ? 'h-full' : ''}`}
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

        {/* Error Message */}
        {error && (
          <div className={`mb-3 p-3 rounded-lg border ${
            cameraInUse 
              ? 'bg-yellow-900/20 border-yellow-600 text-yellow-200' 
              : 'bg-red-900/20 border-red-600 text-red-200'
          }`}>
            <div className="flex items-start gap-2">
              <span className="text-lg">{cameraInUse ? '⚠️' : '❌'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  {cameraInUse ? 'Camera In Use' : 'Connection Error'}
                </p>
                <p className="text-xs">{error}</p>
                {cameraInUse && (
                  <p className="text-xs mt-2 opacity-75">
                    <strong>Note:</strong> Cameras typically can only be accessed by one application at a time. 
                    Close IC Capture 2.5 or any other camera software before using the live view.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {connectionStatus === 'disconnected' ? (
            <Button
              size="sm"
              variant="primary"
              onClick={handleConnect}
              className="flex-1"
              disabled={cameraInUse}
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
                  disabled={cameraInUse}
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
        
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-400">
            Live view similar to IC Capture 2.5. Use sliders to adjust camera settings.
          </p>
          <p className="text-xs text-gray-500">
            <strong>Important:</strong> Close IC Capture 2.5 before using this live view. 
            Only one application can access the camera at a time.
          </p>
        </div>
      </div>
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
          <div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⏳</div>
                <p>Loading commands...</p>
              </div>
            ) : (device?.type as any) === 'camera.dmk37' ? (
              // DMK37 Camera with Live View
              <LiveCameraView device={device} />
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
                      onClick={handleJankomotorZero} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Zero
                    </Button>
                    <Button 
                      onClick={handleJankomotorPosition} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Position
                    </Button>
                    <Button 
                      onClick={handleJankomotorStatus} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Status
                    </Button>
                    <Button 
                      onClick={handleJankomotorSafety} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Safety
                    </Button>
                    <Button 
                      onClick={handleJankomotorPing} 
                      variant="secondary" 
                      size="sm"
                      disabled={!arduinoConnected}
                    >
                      Ping
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
                    <li><strong>4. System:</strong> Use Zero, Position, Status, Safety, Ping, Stop as needed</li>
                    <li><strong>5. Disconnect:</strong> Click "Disconnect" when done</li>
                    <li><strong>Note:</strong> No enable required - system is always ready to move</li>
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
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔗</div>
            <p>Binding not implemented yet</p>
          </div>
        )}
      </div>
    </div>
  )
}