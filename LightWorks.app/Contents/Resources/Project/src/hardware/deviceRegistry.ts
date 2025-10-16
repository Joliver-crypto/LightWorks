import { DeviceType } from '../models/project'

// Device configuration interface
export interface DeviceConfig {
  type: DeviceType
  label: string
  icon: string
  color: string
  category: 'laser' | 'optics' | 'detection' | 'motion' | 'analysis'
  description: string
  size: { width: number; height: number }
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
  driver?: {
    module: string
    class: string
    connection: {
      type: string
      port?: string | 'auto'
      baudrate?: number
      timeout?: number
    }
  }
}

// Device registry class
export class DeviceRegistry {
  private static instance: DeviceRegistry
  private devices: Map<DeviceType, DeviceConfig> = new Map()
  private loaded = false

  private constructor() {}

  static getInstance(): DeviceRegistry {
    if (!DeviceRegistry.instance) {
      DeviceRegistry.instance = new DeviceRegistry()
    }
    return DeviceRegistry.instance
  }

  // Load all device configurations from hardware folders
  async loadDevices(): Promise<void> {
    if (this.loaded) return

    try {
      // Try to get list of hardware folders dynamically
      let deviceFolders: string[] = []
      
      try {
        // Try to fetch a hardware index or scan the hardware folder
        const response = await fetch('/hardware/')
        if (response.ok) {
          // This would need to be implemented on the server side
          // For now, we'll use a fallback list
          deviceFolders = [
            'GenericLaser',
            'GenericMirror', 
            'GenericSplitter',
            'AndorCamera',
            'ThorlabsKDC101',
            'Jankomotor8812',
            'NewportESP',
            'GenericSensor',
            'AndorSR750'
          ]
        }
      } catch (error) {
        console.warn('Failed to get dynamic hardware list, using fallback:', error)
        // Fallback to hardcoded list
        deviceFolders = [
          'GenericLaser',
          'GenericMirror', 
          'GenericSplitter',
          'AndorCamera',
          'ThorlabsKDC101',
          'Jankomotor8812',
          'NewportESP',
          'GenericSensor',
          'AndorSR750'
        ]
      }

      // Load each device configuration
      for (const folder of deviceFolders) {
        const config = await this.loadDeviceConfig(folder)
        if (config) {
          this.devices.set(config.type, config)
        }
      }

      this.loaded = true
      console.log(`Loaded ${this.devices.size} device configurations`)
    } catch (error) {
      console.error('Failed to load device configurations:', error)
    }
  }

  // Load a specific device configuration
  private async loadDeviceConfig(deviceFolder: string): Promise<DeviceConfig | null> {
    try {
      // For now, use hardcoded configurations but prioritize Jankomotor8812
      const deviceConfigs: Record<string, DeviceConfig> = {
        'GenericLaser': {
          type: 'laser.generic',
          label: 'Laser',
          icon: '🔴',
          color: '#1d4ed8',
          category: 'laser',
          description: 'Generic laser source',
          size: { width: 2, height: 2 },
          commands: [
            { name: 'enable', label: 'Enable', description: 'Turn on the laser', args: [] },
            { name: 'disable', label: 'Disable', description: 'Turn off the laser', args: [] },
            { name: 'set_power', label: 'Set Power', description: 'Set laser power percentage', args: [{ name: 'power', type: 'number', required: true, default: 50 }] }
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
          ],
          driver: { module: 'GenericLaser.scripts.laser_control', class: 'LaserController', connection: { type: 'simulated', port: 'none' } }
        },
        'GenericMirror': {
          type: 'mirror.generic',
          label: 'Mirror',
          icon: '🪞',
          color: '#047857',
          category: 'optics',
          description: 'Generic mirror for beam steering',
          size: { width: 1, height: 1 },
          commands: [
            { name: 'set_angle', label: 'Set Angle', description: 'Set mirror angle', args: [{ name: 'angle', type: 'number', required: true, default: 0 }] }
          ],
          telemetry: [
            { name: 'angle', label: 'Angle', unit: '°', type: 'number' }
          ],
          properties: [
            { name: 'reflectivity', label: 'Reflectivity', type: 'number', default: 0.99 },
            { name: 'coating', label: 'Coating', type: 'select', default: 'aluminum', options: ['aluminum', 'silver', 'gold', 'dielectric'] }
          ],
          driver: { module: 'GenericMirror.scripts.mirror_control', class: 'MirrorController', connection: { type: 'simulated', port: 'none' } }
        },
        'GenericSplitter': {
          type: 'splitter.generic',
          label: 'Splitter',
          icon: '🔀',
          color: '#7c3aed',
          category: 'optics',
          description: 'Beam splitter for power division',
          size: { width: 1, height: 1 },
          commands: [],
          telemetry: [],
          properties: [
            { name: 'split_ratio', label: 'Split Ratio', type: 'number', default: 0.5 },
            { name: 'wavelength', label: 'Design Wavelength', type: 'number', default: 632.8 }
          ],
          driver: { module: 'GenericSplitter.scripts.splitter_control', class: 'SplitterController', connection: { type: 'simulated', port: 'none' } }
        },
        'AndorCamera': {
          type: 'camera.andor',
          label: 'Camera',
          icon: '📷',
          color: '#0ea5e9',
          category: 'detection',
          description: 'Andor scientific camera',
          size: { width: 2, height: 2 },
          commands: [
            { name: 'initialize', label: 'Initialize', description: 'Initialize camera', args: [] },
            { name: 'start_acquisition', label: 'Start Acquisition', description: 'Start image acquisition', args: [] },
            { name: 'stop_acquisition', label: 'Stop Acquisition', description: 'Stop image acquisition', args: [] },
            { name: 'set_exposure', label: 'Set Exposure', description: 'Set exposure time', args: [{ name: 'time_ms', type: 'number', required: true, default: 100 }] },
            { name: 'acquire_frame', label: 'Acquire Frame', description: 'Acquire single frame', args: [] }
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
          ],
          driver: { module: 'AndorCamera.scripts.camera_control', class: 'CameraController', connection: { type: 'usb', port: 'auto' } }
        },
        'ThorlabsKDC101': {
          type: 'motor.thorlabs.kdc101',
          label: 'Motor',
          icon: '⚙️',
          color: '#f59e0b',
          category: 'motion',
          description: 'Thorlabs KDC101 motor controller',
          size: { width: 2, height: 1 },
          commands: [
            { name: 'enable', label: 'Enable', description: 'Enable motor', args: [] },
            { name: 'disable', label: 'Disable', description: 'Disable motor', args: [] },
            { name: 'home', label: 'Home', description: 'Home motor', args: [] },
            { name: 'move_abs', label: 'Move Absolute', description: 'Move to absolute position', args: [{ name: 'position', type: 'number', required: true, default: 0 }] },
            { name: 'move_rel', label: 'Move Relative', description: 'Move relative distance', args: [{ name: 'distance', type: 'number', required: true, default: 0 }] }
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
          ],
          driver: { module: 'ThorlabsKDC101.scripts.motor_control', class: 'MotorController', connection: { type: 'usb', port: 'auto' } }
        },
        'Jankomotor8812': {
          type: 'motor.jankomotor.8812',
          label: 'Jankomotor 8812',
          icon: '🔧',
          color: '#06b6d4',
          category: 'motion',
          description: 'Newport Picomotor 8812 precision motor controller with Arduino PH/EN drive',
          size: { width: 2, height: 1 },
          commands: [
            { name: 'enable', label: 'Enable', description: 'Enable motor system', args: [] },
            { name: 'disable', label: 'Disable', description: 'Disable motor system', args: [] },
            { name: 'home', label: 'Home', description: 'Home both axes', args: [] },
            { name: 'move_x', label: 'Move X', description: 'Move X axis relative', args: [{ name: 'steps', type: 'number', required: true, default: 0 }] },
            { name: 'move_y', label: 'Move Y', description: 'Move Y axis relative', args: [{ name: 'steps', type: 'number', required: true, default: 0 }] },
            { name: 'move_xy', label: 'Move XY', description: 'Move both axes', args: [{ name: 'x_steps', type: 'number', required: true, default: 0 }, { name: 'y_steps', type: 'number', required: true, default: 0 }] },
            { name: 'set_timing', label: 'Set Timing', description: 'Set motor timing parameters', args: [{ name: 'pulse_us', type: 'number', required: false, default: 800 }, { name: 'gap_ms', type: 'number', required: false, default: 6 }] },
            { name: 'start_raster', label: 'Start Raster', description: 'Start raster scan', args: [{ name: 'x_start', type: 'number', required: true, default: 0 }, { name: 'y_start', type: 'number', required: true, default: 0 }, { name: 'x_end', type: 'number', required: true, default: 1000 }, { name: 'y_end', type: 'number', required: true, default: 1000 }] },
            { name: 'stop', label: 'Stop', description: 'Emergency stop all movement', args: [] }
          ],
          telemetry: [
            { name: 'x_pos', label: 'X Position', unit: 'steps', type: 'number' },
            { name: 'y_pos', label: 'Y Position', unit: 'steps', type: 'number' },
            { name: 'enabled', label: 'Enabled', type: 'string' },
            { name: 'moving', label: 'Moving', type: 'string' },
            { name: 'raster_active', label: 'Raster Active', type: 'string' },
            { name: 'trigger_enabled', label: 'Trigger Enabled', type: 'string' }
          ],
          properties: [
            { name: 'pulse_us', label: 'Pulse Width', type: 'number', default: 800 },
            { name: 'gap_ms', label: 'Gap Between Pulses', type: 'number', default: 6 },
            { name: 'takeup_steps', label: 'Takeup Steps', type: 'number', default: 8 },
            { name: 'settle_x_ms', label: 'X Settle Delay', type: 'number', default: 35 },
            { name: 'settle_y_ms', label: 'Y Settle Delay', type: 'number', default: 45 },
            { name: 'enabled', label: 'Enabled', type: 'boolean', default: false }
          ],
          driver: { module: 'Jankomotor8812.scripts.jankomotor_controller', class: 'SimpleJankomotorController', connection: { type: 'serial', port: 'auto', baudrate: 9600, timeout: 1.0 } }
        },
        'NewportESP': {
          type: 'stage.newport.esp',
          label: 'Stage',
          icon: '📐',
          color: '#ef4444',
          category: 'motion',
          description: 'Newport ESP precision stage',
          size: { width: 3, height: 2 },
          commands: [
            { name: 'enable', label: 'Enable', description: 'Enable stage', args: [] },
            { name: 'disable', label: 'Disable', description: 'Disable stage', args: [] },
            { name: 'home', label: 'Home', description: 'Home stage', args: [] },
            { name: 'move_abs', label: 'Move Absolute', description: 'Move to absolute position', args: [{ name: 'x', type: 'number', required: true, default: 0 }, { name: 'y', type: 'number', required: true, default: 0 }] },
            { name: 'move_rel', label: 'Move Relative', description: 'Move relative distance', args: [{ name: 'dx', type: 'number', required: true, default: 0 }, { name: 'dy', type: 'number', required: true, default: 0 }] }
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
          ],
          driver: { module: 'NewportESP.scripts.stage_control', class: 'StageController', connection: { type: 'serial', port: 'auto', baudrate: 9600 } }
        },
        'GenericSensor': {
          type: 'sensor.generic',
          label: 'Sensor',
          icon: '📊',
          color: '#10b981',
          category: 'detection',
          description: 'Generic sensor device',
          size: { width: 1, height: 1 },
          commands: [
            { name: 'read', label: 'Read', description: 'Read sensor value', args: [] }
          ],
          telemetry: [
            { name: 'value', label: 'Value', type: 'number' },
            { name: 'unit', label: 'Unit', type: 'string' }
          ],
          properties: [
            { name: 'sensor_type', label: 'Sensor Type', type: 'select', default: 'voltage', options: ['voltage', 'current', 'temperature', 'pressure'] },
            { name: 'range_min', label: 'Min Range', type: 'number', default: 0 },
            { name: 'range_max', label: 'Max Range', type: 'number', default: 10 }
          ],
          driver: { module: 'GenericSensor.scripts.sensor_control', class: 'SensorController', connection: { type: 'simulated', port: 'none' } }
        },
        'AndorSR750': {
          type: 'spectrograph.andor.sr750',
          label: 'SR-750',
          icon: '🌈',
          color: '#a855f7',
          category: 'analysis',
          description: 'Andor SR-750 spectrograph',
          size: { width: 3, height: 2 },
          commands: [
            { name: 'initialize', label: 'Initialize', description: 'Initialize spectrograph', args: [] },
            { name: 'set_wavelength', label: 'Set Wavelength', description: 'Set center wavelength', args: [{ name: 'wavelength', type: 'number', required: true, default: 500 }] },
            { name: 'acquire_spectrum', label: 'Acquire Spectrum', description: 'Acquire spectrum', args: [{ name: 'exposure_ms', type: 'number', required: true, default: 1000 }] }
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
          ],
          driver: { module: 'AndorSR750.scripts.spectrograph_control', class: 'SpectrographController', connection: { type: 'usb', port: 'auto' } }
        }
      }

      return deviceConfigs[deviceFolder] || null
    } catch (error) {
      console.error(`Failed to load device config for ${deviceFolder}:`, error)
      return null
    }
  }

  // Get device configuration by type
  getDeviceConfig(type: DeviceType): DeviceConfig | undefined {
    return this.devices.get(type)
  }

  // Get all device types
  getAllDeviceTypes(): DeviceType[] {
    return Array.from(this.devices.keys())
  }

  // Get devices by category
  getDevicesByCategory(category: DeviceConfig['category']): DeviceType[] {
    return Array.from(this.devices.entries())
      .filter(([_, config]) => config.category === category)
      .map(([type, _]) => type)
  }

  // Get all device configurations
  getAllDeviceConfigs(): DeviceConfig[] {
    return Array.from(this.devices.values())
  }

  // Check if a device type is registered
  hasDevice(type: DeviceType): boolean {
    return this.devices.has(type)
  }

  // Register a new device configuration (for dynamic loading)
  registerDevice(config: DeviceConfig): void {
    this.devices.set(config.type, config)
  }

  // Unregister a device
  unregisterDevice(type: DeviceType): void {
    this.devices.delete(type)
  }
}

// Export singleton instance
export const deviceRegistry = DeviceRegistry.getInstance()

// Helper functions for backward compatibility
export async function getDeviceTypeInfo(type: DeviceType): Promise<DeviceConfig | undefined> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getDeviceConfig(type)
}

export async function getDeviceTypesByCategory(category: DeviceConfig['category']): Promise<DeviceType[]> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getDevicesByCategory(category)
}

export async function getAllDeviceTypes(): Promise<DeviceType[]> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getAllDeviceTypes()
}
