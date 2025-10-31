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
  // Hardware tags - which hardware this extension supports
  hardware?: string[] // e.g., ['camera.dmk37', 'camera.dmk33']
  // Driver ID for driver selection
  driverId?: string // Unique ID for this driver (e.g., 'ic-capture-2.5', 'ic-capture-4')
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

// Extensions are now loaded from the extensions folder
// Import all extensions from the extensions directory
import { EXTENSIONS } from '../../extensions/index'

// Export extensions for use throughout the application
export const MOCK_EXTENSIONS: ExtensionManifest[] = EXTENSIONS

// Extension store state
export type ExtensionStoreState = {
  extensions: ExtensionWithStatus[]
  searchQuery: string
  filterType: 'all' | 'driver' | 'analysis' | 'workflow'
  filterOs: 'all' | 'windows' | 'linux' | 'mac'
  isLoading: boolean
  error?: string
}


