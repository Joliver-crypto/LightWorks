import { useState, useEffect } from 'react'
import { 
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../../state/useProjectStore'

export function StatusBar() {
  const { project } = useProjectStore()
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected')
  const [fps, setFps] = useState(60)

  // Mock connection status
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional connection issues
      const random = Math.random()
      if (random < 0.05) {
        setConnectionStatus('disconnected')
      } else if (random < 0.1) {
        setConnectionStatus('error')
      } else {
        setConnectionStatus('connected')
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Mock FPS counter
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(55 + Math.random() * 10))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'disconnected':
        return <WifiIcon className="w-4 h-4 text-gray-400" />
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
    }
  }

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Connection Error'
    }
  }

  const deviceCount = project.devices.length
  const connectedDevices = project.devices.filter(d => d.status === 'green').length

  return (
    <div className="h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
      {/* Left side - Connection status */}
      <div className="flex items-center gap-2">
        {getConnectionIcon()}
        <span>{getConnectionText()}</span>
      </div>

      {/* Center - Project info */}
      <div className="flex items-center gap-4">
        <span>Devices: {connectedDevices}/{deviceCount}</span>
        <span>FPS: {fps}</span>
      </div>

      {/* Right side - Hints */}
      <div className="flex items-center gap-2">
        <span>Press Ctrl+K for commands</span>
      </div>
    </div>
  )
}


