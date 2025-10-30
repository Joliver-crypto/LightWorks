// Base device interface that all devices must implement
export interface DeviceCapabilities {
  os: string
  transport: string
  features: Record<string, boolean>
  limits: Record<string, any>
}

export interface IDevice {
  // Connection management
  connect(identifier?: string): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // Capability detection
  getCapabilities(): Promise<DeviceCapabilities>
  
  // Device info
  getModel(): Promise<string>
  getSerial(): Promise<string>
  getFirmwareVersion(): Promise<string>
}

// Device factory interface
export interface IDeviceFactory {
  create(): IDevice
  isSupported(): boolean
  getCapabilities(): DeviceCapabilities
}

// Base error class
export class DeviceError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DeviceError'
  }
}

export class UnsupportedFeatureError extends DeviceError {
  constructor(feature: string) {
    super(`Feature '${feature}' is not supported on this platform/driver`)
    this.code = 'UNSUPPORTED_FEATURE'
  }
}

export class ConnectionError extends DeviceError {
  constructor(message: string) {
    super(`Connection failed: ${message}`)
    this.code = 'CONNECTION_ERROR'
  }
}





