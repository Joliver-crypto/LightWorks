import { DeviceType } from './project'

// Device type catalog with detailed information
export interface DeviceTypeInfo {
  type: DeviceType
  label: string
  icon: string
  color: string
  category: 'laser' | 'optics' | 'detection' | 'motion' | 'analysis'
  description: string
  size: { width: number; height: number } // in grid units
  commands: Array<{
    name: string
    label: string
    description: string
    args: Array<{
      name: string
      type: 'string' | 'number' | 'boolean'
      required: boolean
      default?: any
    }>
  }>
  telemetry: Array<{
    name: string
    label: string
    unit?: string
    type: 'number' | 'image' | 'string'
  }>
  properties: Array<{
    name: string
    label: string
    type: 'string' | 'number' | 'boolean' | 'select'
    default: any
    options?: string[]
  }>
}

export const DEVICE_TYPE_CATALOG: Record<DeviceType, DeviceTypeInfo> = {
  'laser.generic': {
    type: 'laser.generic',
    label: 'Laser',
    icon: '🔴',
    color: 'bg-red-500',
    category: 'laser',
    description: 'Generic laser source',
    size: { width: 2, height: 2 },
    commands: [
      {
        name: 'enable',
        label: 'Enable',
        description: 'Turn on the laser',
        args: []
      },
      {
        name: 'disable',
        label: 'Disable',
        description: 'Turn off the laser',
        args: []
      },
      {
        name: 'set_power',
        label: 'Set Power',
        description: 'Set laser power percentage',
        args: [
          { name: 'power', type: 'number', required: true, default: 50 }
        ]
      }
    ],
    telemetry: [
      { name: 'power', label: 'Power', unit: '%', type: 'number' },
      { name: 'temperature', label: 'Temperature', unit: '°C', type: 'number' },
      { name: 'status', label: 'Status', type: 'string' }
    ],
    properties: [
      { name: 'wavelength', label: 'Wavelength', type: 'number', default: 632.8 },
      { name: 'max_power', label: 'Max Power', type: 'number', default: 100 },
      { name: 'enabled', label: 'Enabled', type: 'boolean', default: false }
    ]
  },
  'mirror.generic': {
    type: 'mirror.generic',
    label: 'Mirror',
    icon: '🪞',
    color: 'bg-gray-400',
    category: 'optics',
    description: 'Generic mirror for beam steering',
    size: { width: 1, height: 1 },
    commands: [
      {
        name: 'set_angle',
        label: 'Set Angle',
        description: 'Set mirror angle',
        args: [
          { name: 'angle', type: 'number', required: true, default: 0 }
        ]
      }
    ],
    telemetry: [
      { name: 'angle', label: 'Angle', unit: '°', type: 'number' }
    ],
    properties: [
      { name: 'reflectivity', label: 'Reflectivity', type: 'number', default: 0.99 },
      { name: 'coating', label: 'Coating', type: 'select', default: 'aluminum', options: ['aluminum', 'silver', 'gold', 'dielectric'] }
    ]
  },
  'splitter.generic': {
    type: 'splitter.generic',
    label: 'Beam Splitter',
    icon: '🔀',
    color: 'bg-blue-400',
    category: 'optics',
    description: 'Beam splitter for power division',
    size: { width: 1, height: 1 },
    commands: [],
    telemetry: [],
    properties: [
      { name: 'split_ratio', label: 'Split Ratio', type: 'number', default: 0.5 },
      { name: 'wavelength', label: 'Design Wavelength', type: 'number', default: 632.8 }
    ]
  },
  'camera.andor': {
    type: 'camera.andor',
    label: 'Andor Camera',
    icon: '📷',
    color: 'bg-green-500',
    category: 'detection',
    description: 'Andor scientific camera',
    size: { width: 2, height: 2 },
    commands: [
      {
        name: 'initialize',
        label: 'Initialize',
        description: 'Initialize camera',
        args: []
      },
      {
        name: 'start_acquisition',
        label: 'Start Acquisition',
        description: 'Start image acquisition',
        args: []
      },
      {
        name: 'stop_acquisition',
        label: 'Stop Acquisition',
        description: 'Stop image acquisition',
        args: []
      },
      {
        name: 'set_exposure',
        label: 'Set Exposure',
        description: 'Set exposure time',
        args: [
          { name: 'time_ms', type: 'number', required: true, default: 100 }
        ]
      },
      {
        name: 'acquire_frame',
        label: 'Acquire Frame',
        description: 'Acquire single frame',
        args: []
      }
    ],
    telemetry: [
      { name: 'temperature', label: 'Temperature', unit: '°C', type: 'number' },
      { name: 'exposure_time', label: 'Exposure Time', unit: 'ms', type: 'number' },
      { name: 'frame_count', label: 'Frame Count', type: 'number' },
      { name: 'image', label: 'Image', type: 'image' }
    ],
    properties: [
      { name: 'pixel_size', label: 'Pixel Size', type: 'number', default: 6.5 },
      { name: 'resolution', label: 'Resolution', type: 'select', default: '1024x1024', options: ['512x512', '1024x1024', '2048x2048'] },
      { name: 'cooling', label: 'Cooling', type: 'boolean', default: true }
    ]
  },
  'motor.thorlabs.kdc101': {
    type: 'motor.thorlabs.kdc101',
    label: 'Thorlabs KDC101',
    icon: '⚙️',
    color: 'bg-purple-500',
    category: 'motion',
    description: 'Thorlabs KDC101 motor controller',
    size: { width: 2, height: 1 },
    commands: [
      {
        name: 'enable',
        label: 'Enable',
        description: 'Enable motor',
        args: []
      },
      {
        name: 'disable',
        label: 'Disable',
        description: 'Disable motor',
        args: []
      },
      {
        name: 'home',
        label: 'Home',
        description: 'Home motor',
        args: []
      },
      {
        name: 'move_abs',
        label: 'Move Absolute',
        description: 'Move to absolute position',
        args: [
          { name: 'position', type: 'number', required: true, default: 0 }
        ]
      },
      {
        name: 'move_rel',
        label: 'Move Relative',
        description: 'Move relative distance',
        args: [
          { name: 'distance', type: 'number', required: true, default: 0 }
        ]
      }
    ],
    telemetry: [
      { name: 'position', label: 'Position', unit: 'mm', type: 'number' },
      { name: 'velocity', label: 'Velocity', unit: 'mm/s', type: 'number' },
      { name: 'status', label: 'Status', type: 'string' }
    ],
    properties: [
      { name: 'max_velocity', label: 'Max Velocity', type: 'number', default: 10.0 },
      { name: 'acceleration', label: 'Acceleration', type: 'number', default: 5.0 },
      { name: 'enabled', label: 'Enabled', type: 'boolean', default: false }
    ]
  },
  'stage.newport.esp': {
    type: 'stage.newport.esp',
    label: 'Newport ESP Stage',
    icon: '📐',
    color: 'bg-orange-500',
    category: 'motion',
    description: 'Newport ESP precision stage',
    size: { width: 3, height: 2 },
    commands: [
      {
        name: 'enable',
        label: 'Enable',
        description: 'Enable stage',
        args: []
      },
      {
        name: 'disable',
        label: 'Disable',
        description: 'Disable stage',
        args: []
      },
      {
        name: 'home',
        label: 'Home',
        description: 'Home stage',
        args: []
      },
      {
        name: 'move_abs',
        label: 'Move Absolute',
        description: 'Move to absolute position',
        args: [
          { name: 'x', type: 'number', required: true, default: 0 },
          { name: 'y', type: 'number', required: true, default: 0 }
        ]
      },
      {
        name: 'move_rel',
        label: 'Move Relative',
        description: 'Move relative distance',
        args: [
          { name: 'dx', type: 'number', required: true, default: 0 },
          { name: 'dy', type: 'number', required: true, default: 0 }
        ]
      }
    ],
    telemetry: [
      { name: 'x', label: 'X Position', unit: 'mm', type: 'number' },
      { name: 'y', label: 'Y Position', unit: 'mm', type: 'number' },
      { name: 'status', label: 'Status', type: 'string' }
    ],
    properties: [
      { name: 'max_velocity', label: 'Max Velocity', type: 'number', default: 5.0 },
      { name: 'resolution', label: 'Resolution', type: 'number', default: 0.1 },
      { name: 'enabled', label: 'Enabled', type: 'boolean', default: false }
    ]
  },
  'sensor.generic': {
    type: 'sensor.generic',
    label: 'Generic Sensor',
    icon: '📊',
    color: 'bg-yellow-500',
    category: 'detection',
    description: 'Generic sensor device',
    size: { width: 1, height: 1 },
    commands: [
      {
        name: 'read',
        label: 'Read',
        description: 'Read sensor value',
        args: []
      }
    ],
    telemetry: [
      { name: 'value', label: 'Value', type: 'number' },
      { name: 'unit', label: 'Unit', type: 'string' }
    ],
    properties: [
      { name: 'sensor_type', label: 'Sensor Type', type: 'select', default: 'voltage', options: ['voltage', 'current', 'temperature', 'pressure'] },
      { name: 'range_min', label: 'Min Range', type: 'number', default: 0 },
      { name: 'range_max', label: 'Max Range', type: 'number', default: 10 }
    ]
  },
  'spectrograph.andor.sr750': {
    type: 'spectrograph.andor.sr750',
    label: 'SR-750 Spectrograph',
    icon: '🌈',
    color: 'bg-indigo-500',
    category: 'analysis',
    description: 'Andor SR-750 spectrograph',
    size: { width: 3, height: 2 },
    commands: [
      {
        name: 'initialize',
        label: 'Initialize',
        description: 'Initialize spectrograph',
        args: []
      },
      {
        name: 'set_wavelength',
        label: 'Set Wavelength',
        description: 'Set center wavelength',
        args: [
          { name: 'wavelength', type: 'number', required: true, default: 500 }
        ]
      },
      {
        name: 'acquire_spectrum',
        label: 'Acquire Spectrum',
        description: 'Acquire spectrum',
        args: [
          { name: 'exposure_ms', type: 'number', required: true, default: 1000 }
        ]
      }
    ],
    telemetry: [
      { name: 'wavelength', label: 'Wavelength', unit: 'nm', type: 'number' },
      { name: 'grating_position', label: 'Grating Position', type: 'number' },
      { name: 'temperature', label: 'Temperature', unit: '°C', type: 'number' },
      { name: 'spectrum', label: 'Spectrum', type: 'image' }
    ],
    properties: [
      { name: 'wavelength_range', label: 'Wavelength Range', type: 'select', default: '200-1000', options: ['200-1000', '300-800', '400-700'] },
      { name: 'resolution', label: 'Resolution', type: 'number', default: 0.1 },
      { name: 'cooling', label: 'Cooling', type: 'boolean', default: true }
    ]
  }
}

// Get device type info by type
export function getDeviceTypeInfo(type: DeviceType): DeviceTypeInfo {
  return DEVICE_TYPE_CATALOG[type]
}

// Get all device types by category
export function getDeviceTypesByCategory(category: DeviceTypeInfo['category']): DeviceType[] {
  return Object.keys(DEVICE_TYPE_CATALOG).filter(
    type => DEVICE_TYPE_CATALOG[type as DeviceType].category === category
  ) as DeviceType[]
}


