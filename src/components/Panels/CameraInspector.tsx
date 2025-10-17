// Capability-driven camera inspector component
import React, { useState, useEffect } from 'react'
import { Component } from '../../models/fileFormat'
import { ICamera, CapabilityMap } from '../../../hardware/interfaces/ICamera'
import { DMK37CameraFactory } from '../../../hardware/DMK37/scripts/dmk37_controller'
import { CapabilityAwareControl, CapabilityAwareInput, CapabilityAwareButton, CapabilityAwareSelect } from '../Common/CapabilityAwareControl'
import { CapabilityBanner, CapabilityMatrix } from '../Common/CapabilityBanner'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { Badge } from '../Common/Badge'
import { Tabs } from '../Common/Tabs'

interface CameraInspectorProps {
  device: Component
}

const tabs = [
  { id: 'control', label: 'Control' },
  { id: 'settings', label: 'Settings' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'properties', label: 'Properties' },
]

export function CameraInspector({ device }: CameraInspectorProps) {
  const [activeTab, setActiveTab] = useState('control')
  const [camera, setCamera] = useState<ICamera | null>(null)
  const [capabilities, setCapabilities] = useState<CapabilityMap | null>(null)
  const [connected, setConnected] = useState(false)
  const [acquiring, setAcquiring] = useState(false)
  const [settings, setSettings] = useState({
    exposure: 1000,
    gain: 0,
    roi: { x: 0, y: 0, width: 1920, height: 1080 },
    triggerMode: false,
    triggerSource: 'Software' as 'Software' | 'Line0' | 'Line1'
  })
  const [status, setStatus] = useState('')

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const factory = new DMK37CameraFactory()
        const cameraInstance = factory.create()
        const caps = await cameraInstance.getCapabilities()
        
        setCamera(cameraInstance)
        setCapabilities(caps)
      } catch (error) {
        console.error('Failed to initialize camera:', error)
        setStatus(`Error: ${error}`)
      }
    }

    initCamera()
  }, [])

  // Handle connection
  const handleConnect = async () => {
    if (!camera) return

    try {
      setStatus('Connecting...')
      await camera.connect()
      setConnected(true)
      setStatus('Connected successfully')
    } catch (error) {
      setStatus(`Connection failed: ${error}`)
    }
  }

  const handleDisconnect = async () => {
    if (!camera) return

    try {
      setStatus('Disconnecting...')
      await camera.disconnect()
      setConnected(false)
      setAcquiring(false)
      setStatus('Disconnected')
    } catch (error) {
      setStatus(`Disconnect failed: ${error}`)
    }
  }

  // Handle acquisition
  const handleStartAcquisition = async () => {
    if (!camera || !connected) return

    try {
      setStatus('Starting acquisition...')
      await camera.start({
        exposure: settings.exposure,
        gain: settings.gain,
        roi: settings.roi
      })
      setAcquiring(true)
      setStatus('Acquisition started')
    } catch (error) {
      setStatus(`Failed to start acquisition: ${error}`)
    }
  }

  const handleStopAcquisition = async () => {
    if (!camera) return

    try {
      setStatus('Stopping acquisition...')
      await camera.stop()
      setAcquiring(false)
      setStatus('Acquisition stopped')
    } catch (error) {
      setStatus(`Failed to stop acquisition: ${error}`)
    }
  }

  // Handle settings changes
  const handleExposureChange = async (value: number) => {
    if (!camera || !connected) return

    try {
      await camera.setExposure(value)
      setSettings(prev => ({ ...prev, exposure: value }))
      setStatus(`Exposure set to ${value}μs`)
    } catch (error) {
      setStatus(`Failed to set exposure: ${error}`)
    }
  }

  const handleGainChange = async (value: number) => {
    if (!camera || !connected) return

    try {
      await camera.setGain(value)
      setSettings(prev => ({ ...prev, gain: value }))
      setStatus(`Gain set to ${value}dB`)
    } catch (error) {
      setStatus(`Failed to set gain: ${error}`)
    }
  }

  const handleROIChange = async (x: number, y: number, width: number, height: number) => {
    if (!camera || !connected) return

    try {
      await camera.setROI(x, y, width, height)
      setSettings(prev => ({ ...prev, roi: { x, y, width, height } }))
      setStatus(`ROI set to ${x},${y} ${width}x${height}`)
    } catch (error) {
      setStatus(`Failed to set ROI: ${error}`)
    }
  }

  const handleTriggerModeChange = async (enabled: boolean) => {
    if (!camera || !connected) return

    try {
      await camera.setTriggerMode(enabled)
      setSettings(prev => ({ ...prev, triggerMode: enabled }))
      setStatus(`Trigger mode ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      setStatus(`Failed to set trigger mode: ${error}`)
    }
  }

  const handleSoftwareTrigger = async () => {
    if (!camera || !connected) return

    try {
      await camera.softwareTrigger()
      setStatus('Software trigger executed')
    } catch (error) {
      setStatus(`Software trigger failed: ${error}`)
    }
  }

  if (!camera || !capabilities) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <p>Initializing camera...</p>
        </div>
      </div>
    )
  }

  const limitedFeatures = Object.entries(capabilities.features)
    .filter(([_, supported]) => !supported)
    .map(([feature, _]) => feature)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-900">{device.label || device.type}</h2>
            <p className="text-sm text-gray-500">Camera Inspector</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={connected ? 'success' : 'error'}>
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Badge variant={acquiring ? 'success' : 'default'}>
              {acquiring ? 'Acquiring' : 'Idle'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Capability Banner */}
      {limitedFeatures.length > 0 && (
        <div className="px-4 py-2">
          <CapabilityBanner
            model="DMK 37BUX252"
            os={capabilities.os}
            transport={capabilities.transport}
            limitedFeatures={limitedFeatures}
          />
        </div>
      )}

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
        {activeTab === 'control' && (
          <div className="space-y-4">
            {/* Connection Controls */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Connection</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleConnect}
                  disabled={connected}
                  variant="primary"
                >
                  Connect
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={!connected}
                  variant="secondary"
                >
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Acquisition Controls */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Acquisition</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleStartAcquisition}
                  disabled={!connected || acquiring}
                  variant="primary"
                >
                  Start
                </Button>
                <Button
                  onClick={handleStopAcquisition}
                  disabled={!acquiring}
                  variant="secondary"
                >
                  Stop
                </Button>
              </div>
            </div>

            {/* Software Trigger */}
            <CapabilityAwareControl
              capability={capabilities.features.softwareTrigger}
              reason="Software trigger not supported"
            >
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Trigger</h3>
                <Button
                  onClick={handleSoftwareTrigger}
                  disabled={!connected}
                  variant="secondary"
                >
                  Software Trigger
                </Button>
              </div>
            </CapabilityAwareControl>

            {/* Status */}
            {status && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{status}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Exposure */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Exposure</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.exposure}
                  onChange={(e) => setSettings(prev => ({ ...prev, exposure: parseInt(e.target.value) || 0 }))}
                  placeholder="Exposure (μs)"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleExposureChange(settings.exposure)}
                  disabled={!connected}
                  variant="primary"
                >
                  Set
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Range: {capabilities.limits.minExposure} - {capabilities.limits.maxExposure} μs
              </p>
            </div>

            {/* Gain */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Gain</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={settings.gain}
                  onChange={(e) => setSettings(prev => ({ ...prev, gain: parseInt(e.target.value) || 0 }))}
                  placeholder="Gain (dB)"
                  className="flex-1"
                />
                <Button
                  onClick={() => handleGainChange(settings.gain)}
                  disabled={!connected}
                  variant="primary"
                >
                  Set
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Range: {capabilities.limits.minGain} - {capabilities.limits.maxGain} dB
              </p>
            </div>

            {/* ROI */}
            <CapabilityAwareControl
              capability={capabilities.features.roi}
              reason="ROI not supported"
            >
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Region of Interest</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={settings.roi.x}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      roi: { ...prev.roi, x: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="X"
                  />
                  <Input
                    type="number"
                    value={settings.roi.y}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      roi: { ...prev.roi, y: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="Y"
                  />
                  <Input
                    type="number"
                    value={settings.roi.width}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      roi: { ...prev.roi, width: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="Width"
                  />
                  <Input
                    type="number"
                    value={settings.roi.height}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      roi: { ...prev.roi, height: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="Height"
                  />
                </div>
                <Button
                  onClick={() => handleROIChange(settings.roi.x, settings.roi.y, settings.roi.width, settings.roi.height)}
                  disabled={!connected}
                  variant="primary"
                  className="w-full mt-2"
                >
                  Set ROI
                </Button>
              </div>
            </CapabilityAwareControl>

            {/* Trigger Mode */}
            <CapabilityAwareControl
              capability={capabilities.features.hardwareTrigger}
              reason="Hardware trigger not supported"
            >
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Trigger Mode</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.triggerMode}
                    onChange={(e) => handleTriggerModeChange(e.target.checked)}
                    disabled={!connected}
                  />
                  <label className="text-sm text-gray-700">Enable Hardware Trigger</label>
                </div>
              </div>
            </CapabilityAwareControl>
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="space-y-4">
            <CapabilityMatrix capabilities={capabilities.features} />
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Limits</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">OS:</span>
                  <span className="ml-2 font-medium">{capabilities.os}</span>
                </div>
                <div>
                  <span className="text-gray-500">Transport:</span>
                  <span className="ml-2 font-medium">{capabilities.transport}</span>
                </div>
                <div>
                  <span className="text-gray-500">Max Resolution:</span>
                  <span className="ml-2 font-medium">{capabilities.limits.maxWidth}x{capabilities.limits.maxHeight}</span>
                </div>
                <div>
                  <span className="text-gray-500">Max Frame Rate:</span>
                  <span className="ml-2 font-medium">{capabilities.limits.maxFrameRate} fps</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">⚙️</div>
              <p>Device properties not implemented yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
