// Core camera interface that all camera implementations must satisfy
export interface Frame {
  data: ArrayBuffer | Uint8Array
  width: number
  height: number
  timestamp: number
  format: string
}

export interface CapabilityMap {
  os: string
  transport: string
  features: {
    exposure: boolean
    gain: boolean
    roi: boolean
    mono12: boolean
    hardwareTrigger: boolean
    softwareTrigger: boolean
    strobeOutput: boolean
    cooling: boolean
    binning: boolean
    frameRate: boolean
  }
  limits: {
    minExposure: number
    maxExposure: number
    minGain: number
    maxGain: number
    maxWidth: number
    maxHeight: number
    maxFrameRate: number
  }
}

export interface CameraOptions {
  pixelFormat?: string
  fps?: number
  exposure?: number
  gain?: number
  roi?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ICamera {
  // Connection management
  connect(serial?: string): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // Acquisition control
  start(opts?: CameraOptions): Promise<void>
  stop(): Promise<void>
  isAcquiring(): boolean

  // Frame handling
  onFrame(callback: (frame: Frame) => void): void
  offFrame(callback: (frame: Frame) => void): void

  // Camera settings
  setExposure(us: number): Promise<void>
  getExposure(): Promise<number>
  
  setGain(dB: number): Promise<void>
  getGain(): Promise<number>
  
  setROI(x: number, y: number, width: number, height: number): Promise<void>
  getROI(): Promise<{ x: number; y: number; width: number; height: number }>

  // Trigger control
  setTriggerMode(enabled: boolean): Promise<void>
  getTriggerMode(): Promise<boolean>
  
  setTriggerSource(source: "Software" | "Line0" | "Line1"): Promise<void>
  getTriggerSource(): Promise<string>
  
  softwareTrigger(): Promise<void>

  // Capability detection
  getCapabilities(): Promise<CapabilityMap>
  
  // Device info
  getModel(): Promise<string>
  getSerial(): Promise<string>
  getFirmwareVersion(): Promise<string>
}

// Camera factory interface
export interface ICameraFactory {
  create(): ICamera
  isSupported(): boolean
  getCapabilities(): CapabilityMap
}

// Error types
export class CameraError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'CameraError'
  }
}

export class UnsupportedFeatureError extends CameraError {
  constructor(feature: string) {
    super(`Feature '${feature}' is not supported on this platform/driver`)
    this.code = 'UNSUPPORTED_FEATURE'
  }
}

export class ConnectionError extends CameraError {
  constructor(message: string) {
    super(`Connection failed: ${message}`)
    this.code = 'CONNECTION_ERROR'
  }
}





