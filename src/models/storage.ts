import { z } from 'zod'

// Enhanced UUID validation
export const UUIDSchema = z.string().uuid()
export type UUID = z.infer<typeof UUIDSchema>

// Pose2D with validation - units: millimeters (mm); angles: degrees
export const Pose2DSchema = z.object({
  x: z.number().finite(),        // mm
  y: z.number().finite(),        // mm
  theta: z.number().finite()     // degrees, CCW from +x
})
export type Pose2D = z.infer<typeof Pose2DSchema>

// Enhanced Table schema
export const TableSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1).max(100),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
  // bench geometry
  units: z.enum(['mm', 'inch']).default('mm'),
  width: z.number().positive(),    // mm
  height: z.number().positive(),   // mm
  holePitch: z.number().positive(), // e.g., 25 mm
  threadType: z.enum(['1/4-20', 'M6']),
  origin: z.object({ x: z.number(), y: z.number() }), // where (0,0) is on canvas
  // UI settings
  gridEnabled: z.boolean().default(true),
  snapToHoles: z.boolean().default(true),
  version: z.number().positive().default(1)   // for migrations
})
export type Table = z.infer<typeof TableSchema>

// Component types with better organization
export const ComponentTypeSchema = z.enum([
  'Laser',
  'Mirror', 
  'Splitter',
  'Camera',
  'SR-750',
  'Motor',
  'Stage',
  'Sensor',
  'BeamStop',
  'Lens',
  'Waveplate',
  'PBS'
])
export type ComponentType = z.infer<typeof ComponentTypeSchema>

export const ComponentSchema = z.object({
  id: UUIDSchema,
  tableId: UUIDSchema,
  type: ComponentTypeSchema,
  label: z.string().optional(),      // e.g., "HeNe #1"
  pose: Pose2DSchema,                // center position + orientation
  locked: z.boolean().default(false), // prevent accidental moves
  meta: z.record(z.any()).optional() // e.g., focal length, reflectivity, mount id, etc.
})
export type Component = z.infer<typeof ComponentSchema>

export const ConnectionSchema = z.object({
  id: UUIDSchema,
  tableId: UUIDSchema,
  fromComponentId: UUIDSchema,
  toComponentId: UUIDSchema,
  // Optional beam metadata:
  wavelengthNm: z.number().positive().optional(),
  polarization: z.enum(['H', 'V', 'D', 'A', 'R', 'L', 'unknown']).optional(),
  powerMw: z.number().positive().optional()
})
export type Connection = z.infer<typeof ConnectionSchema>

export const TableSnapshotSchema = z.object({
  table: TableSchema,
  components: z.array(ComponentSchema),
  connections: z.array(ConnectionSchema)
})
export type TableSnapshot = z.infer<typeof TableSnapshotSchema>

// Utility functions for pose manipulation
export function poseToMat2D(p: Pose2D): readonly [readonly [number, number, number], readonly [number, number, number], readonly [number, number, number]] {
  const r = (p.theta * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return [
    [c, -s, p.x],
    [s,  c, p.y],
    [0,  0,  1]
  ] as const
}

export function snapToHoles(pose: Pose2D, holePitch: number): Pose2D {
  return {
    x: Math.round(pose.x / holePitch) * holePitch,
    y: Math.round(pose.y / holePitch) * holePitch,
    theta: pose.theta
  }
}

export function snapAngle(angle: number, snapDegrees: number = 5): number {
  return Math.round(angle / snapDegrees) * snapDegrees
}

// Default table template
export const DEFAULT_TABLE: Table = {
  id: crypto.randomUUID(),
  name: 'New Table',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  units: 'mm',
  width: 900,
  height: 600,
  holePitch: 25,
  threadType: '1/4-20',
  origin: { x: 0, y: 0 },
  gridEnabled: true,
  snapToHoles: true,
  version: 1
}

// Sample table with components
export const SAMPLE_TABLE_SNAPSHOT: TableSnapshot = {
  table: {
    ...DEFAULT_TABLE,
    name: 'Sample Optics Setup'
  },
  components: [
    {
      id: crypto.randomUUID(),
      tableId: DEFAULT_TABLE.id,
      type: 'Laser',
      label: 'HeNe Laser',
      pose: { x: 100, y: 300, theta: 0 },
      locked: false,
      meta: { wavelength: 632.8, power: 5 }
    },
    {
      id: crypto.randomUUID(),
      tableId: DEFAULT_TABLE.id,
      type: 'Mirror',
      label: 'Mirror A',
      pose: { x: 275, y: 300, theta: 45 },
      locked: false,
      meta: { reflectivity: 0.99 }
    },
    {
      id: crypto.randomUUID(),
      tableId: DEFAULT_TABLE.id,
      type: 'Splitter',
      label: 'Beam Splitter',
      pose: { x: 400, y: 300, theta: 0 },
      locked: false,
      meta: { splitRatio: 0.5 }
    },
    {
      id: crypto.randomUUID(),
      tableId: DEFAULT_TABLE.id,
      type: 'Camera',
      label: 'Andor Cam',
      pose: { x: 575, y: 175, theta: 0 },
      locked: false,
      meta: { model: 'Andor iXon' }
    },
    {
      id: crypto.randomUUID(),
      tableId: DEFAULT_TABLE.id,
      type: 'SR-750',
      label: 'SR-750',
      pose: { x: 750, y: 300, theta: 0 },
      locked: false,
      meta: { grating: '300 lines/mm' }
    }
  ],
  connections: [
    {
      id: crypto.randomUUID(),
      tableId: DEFAULT_TABLE.id,
      fromComponentId: '', // Will be filled when components are created
      toComponentId: '',
      wavelengthNm: 632.8,
      polarization: 'H',
      powerMw: 5
    }
  ]
}
