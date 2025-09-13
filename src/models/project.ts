import { z } from 'zod'

// Table configuration schema
export const TableSchema = z.object({
  units: z.enum(['mm', 'inch']).default('mm'),
  width: z.number().positive(),
  height: z.number().positive(),
  pitch: z.number().positive(), // e.g., 25.0 mm
  thread: z.enum(['1/4-20', 'M6']).default('1/4-20'),
  origin: z.object({ x: z.number().default(0), y: z.number().default(0) }),
})

// Device type enumeration
export const DeviceTypeEnum = z.enum([
  'laser.generic',
  'mirror.generic',
  'splitter.generic',
  'camera.andor',
  'motor.thorlabs.kdc101',
  'stage.newport.esp',
  'sensor.generic',
  'spectrograph.andor.sr750',
])

// Device binding schema
export const DeviceBindingSchema = z.object({
  id: z.string(),
  type: DeviceTypeEnum,
  name: z.string(),
  pos: z.object({ 
    x: z.number(), 
    y: z.number(), 
    angle: z.number().default(0) 
  }),
  driver: z.object({
    module: z.string().optional(),   // extension module name
    address: z.string().optional(),  // USB/COM/etc.
    params: z.record(z.any()).optional()
  }).optional(),
  status: z.enum(['green', 'red', 'gray']).default('gray')
})

// Main project schema
export const ProjectSchema = z.object({
  version: z.literal('1'),
  table: TableSchema,
  devices: z.array(DeviceBindingSchema)
})

// TypeScript types derived from schemas
export type Project = z.infer<typeof ProjectSchema>
export type DeviceBinding = z.infer<typeof DeviceBindingSchema>
export type Table = z.infer<typeof TableSchema>
export type DeviceType = z.infer<typeof DeviceTypeEnum>

// Device type metadata for UI
export const DEVICE_TYPE_METADATA: Record<DeviceType, {
  label: string
  icon: string
  color: string
  category: 'laser' | 'optics' | 'detection' | 'motion' | 'analysis'
  description: string
}> = {
  'laser.generic': {
    label: 'Laser',
    icon: '🔴',
    color: 'bg-red-500',
    category: 'laser',
    description: 'Generic laser source'
  },
  'mirror.generic': {
    label: 'Mirror',
    icon: '🪞',
    color: 'bg-gray-400',
    category: 'optics',
    description: 'Generic mirror for beam steering'
  },
  'splitter.generic': {
    label: 'Beam Splitter',
    icon: '🔀',
    color: 'bg-blue-400',
    category: 'optics',
    description: 'Beam splitter for power division'
  },
  'camera.andor': {
    label: 'Andor Camera',
    icon: '📷',
    color: 'bg-green-500',
    category: 'detection',
    description: 'Andor scientific camera'
  },
  'motor.thorlabs.kdc101': {
    label: 'Thorlabs KDC101',
    icon: '⚙️',
    color: 'bg-purple-500',
    category: 'motion',
    description: 'Thorlabs KDC101 motor controller'
  },
  'stage.newport.esp': {
    label: 'Newport ESP Stage',
    icon: '📐',
    color: 'bg-orange-500',
    category: 'motion',
    description: 'Newport ESP precision stage'
  },
  'sensor.generic': {
    label: 'Generic Sensor',
    icon: '📊',
    color: 'bg-yellow-500',
    category: 'detection',
    description: 'Generic sensor device'
  },
  'spectrograph.andor.sr750': {
    label: 'SR-750 Spectrograph',
    icon: '🌈',
    color: 'bg-indigo-500',
    category: 'analysis',
    description: 'Andor SR-750 spectrograph'
  }
}

// Default project template
export const DEFAULT_PROJECT: Project = {
  version: '1',
  table: {
    units: 'mm',
    width: 900,
    height: 600,
    pitch: 25,
    thread: '1/4-20',
    origin: { x: 0, y: 0 }
  },
  devices: []
}

// Sample project with devices
export const SAMPLE_PROJECT: Project = {
  version: '1',
  table: {
    units: 'mm',
    width: 900,
    height: 600,
    pitch: 25,
    thread: '1/4-20',
    origin: { x: 0, y: 0 }
  },
  devices: [
    {
      id: 'laser1',
      type: 'laser.generic',
      name: 'HeNe Laser',
      pos: { x: 100, y: 300, angle: 0 },
      status: 'green'
    },
    {
      id: 'mirrorA',
      type: 'mirror.generic',
      name: 'Mirror A',
      pos: { x: 275, y: 300, angle: 45 },
      status: 'gray'
    },
    {
      id: 'split1',
      type: 'splitter.generic',
      name: 'Beam Splitter',
      pos: { x: 400, y: 300, angle: 0 },
      status: 'red'
    },
    {
      id: 'cam1',
      type: 'camera.andor',
      name: 'Andor Cam',
      pos: { x: 575, y: 175, angle: 0 },
      status: 'gray'
    },
    {
      id: 'sr750',
      type: 'spectrograph.andor.sr750',
      name: 'SR-750',
      pos: { x: 750, y: 300, angle: 0 },
      status: 'gray'
    }
  ]
}
