// Extension manifest types for frontend display
export type ExtensionManifest = {
  name: string
  version: string
  type: ('driver' | 'analysis' | 'workflow')[]
  os: ('windows' | 'linux' | 'mac')[]
  sizeMB?: number
  deps?: string[]
  devices?: Array<{
    kind: string // matches DeviceTypeEnum value
    commands: Record<string, { args: Array<{ name: string; type: string }> }>
    telemetry?: string[]
  }>
  entrypoint?: string
  badges?: string[]
  description?: string
  author?: string
  license?: string
  repository?: string
}

// Extension installation status
export type ExtensionStatus = 'available' | 'installing' | 'installed' | 'enabled' | 'error'

// Extension with status for UI
export type ExtensionWithStatus = ExtensionManifest & {
  status: ExtensionStatus
  installedVersion?: string
  error?: string
}

// Mock extensions data
export const MOCK_EXTENSIONS: ExtensionManifest[] = [
  {
    name: 'thorlabs-kinesis',
    version: '1.2.3',
    type: ['driver'],
    os: ['windows'],
    sizeMB: 45.2,
    devices: [
      {
        kind: 'motor.thorlabs.kdc101',
        commands: {
          enable: { args: [] },
          disable: { args: [] },
          home: { args: [] },
          move_abs: { args: [{ name: 'position', type: 'number' }] },
          move_rel: { args: [{ name: 'distance', type: 'number' }] },
          get_position: { args: [] }
        },
        telemetry: ['position', 'velocity', 'status']
      }
    ],
    badges: ['Windows-only', 'Driver'],
    description: 'Thorlabs Kinesis motor control driver',
    author: 'Thorlabs Inc.',
    license: 'Proprietary'
  },
  {
    name: 'andor-sdk',
    version: '2.1.0',
    type: ['driver'],
    os: ['windows', 'linux'],
    sizeMB: 128.5,
    devices: [
      {
        kind: 'camera.andor',
        commands: {
          initialize: { args: [] },
          start_acquisition: { args: [] },
          stop_acquisition: { args: [] },
          set_exposure: { args: [{ name: 'time_ms', type: 'number' }] },
          get_image: { args: [] }
        },
        telemetry: ['temperature', 'exposure_time', 'frame_count']
      },
      {
        kind: 'spectrograph.andor.sr750',
        commands: {
          initialize: { args: [] },
          set_wavelength: { args: [{ name: 'wavelength', type: 'number' }] },
          acquire_spectrum: { args: [{ name: 'exposure_ms', type: 'number' }] }
        },
        telemetry: ['wavelength', 'grating_position', 'temperature']
      }
    ],
    badges: ['Multi-platform', 'Driver'],
    description: 'Andor SDK for scientific cameras and spectrographs',
    author: 'Andor Technology',
    license: 'Proprietary'
  },
  {
    name: 'basic-analysis',
    version: '0.5.1',
    type: ['analysis'],
    os: ['windows', 'linux', 'mac'],
    sizeMB: 12.3,
    badges: ['Cross-platform', 'Analysis'],
    description: 'Basic image analysis and data processing tools',
    author: 'LightWork Team',
    license: 'MIT',
    repository: 'https://github.com/lightwork/analysis-tools'
  }
]

// Extension store state
export type ExtensionStoreState = {
  extensions: ExtensionWithStatus[]
  searchQuery: string
  filterType: 'all' | 'driver' | 'analysis' | 'workflow'
  filterOs: 'all' | 'windows' | 'linux' | 'mac'
  isLoading: boolean
  error?: string
}


