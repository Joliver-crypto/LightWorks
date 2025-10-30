// Capability banner component to show device limitations
import React from 'react'
import { Badge } from './Badge'

interface CapabilityBannerProps {
  model: string
  os: string
  transport: string
  limitedFeatures: string[]
  className?: string
}

export function CapabilityBanner({ 
  model, 
  os, 
  transport, 
  limitedFeatures,
  className = ''
}: CapabilityBannerProps) {
  if (limitedFeatures.length === 0) {
    return null
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <div className="text-yellow-600 text-lg">⚠️</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Running {model} on {os} ({transport})
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Advanced features are disabled: {limitedFeatures.join(', ')}
          </p>
          <div className="mt-2">
            <Badge variant="warning" className="text-xs">
              Limited Capabilities
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

// Feature capability indicator
interface FeatureCapabilityProps {
  feature: string
  supported: boolean
  className?: string
}

export function FeatureCapability({ 
  feature, 
  supported,
  className = ''
}: FeatureCapabilityProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${supported ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-sm ${supported ? 'text-green-700' : 'text-red-700'}`}>
        {feature}
      </span>
    </div>
  )
}

// Capability matrix component
interface CapabilityMatrixProps {
  capabilities: Record<string, boolean>
  className?: string
}

export function CapabilityMatrix({ 
  capabilities,
  className = ''
}: CapabilityMatrixProps) {
  const features = Object.entries(capabilities)
  const supportedCount = features.filter(([_, supported]) => supported).length
  const totalCount = features.length

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Feature Support</h4>
        <Badge variant={supportedCount === totalCount ? 'success' : 'warning'}>
          {supportedCount}/{totalCount}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {features.map(([feature, supported]) => (
          <FeatureCapability
            key={feature}
            feature={feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            supported={supported}
          />
        ))}
      </div>
    </div>
  )
}





