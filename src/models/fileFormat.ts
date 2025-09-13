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

// Hole pose - discrete grid indices
export const HolePoseSchema = z.object({
  i: z.number().int().min(0),    // grid column index
  j: z.number().int().min(0),    // grid row index
  theta: z.number().finite()     // degrees, CCW from +x
})
export type HolePose = z.infer<typeof HolePoseSchema>

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

// Enhanced Component schema with hole pose
export const ComponentSchema = z.object({
  id: UUIDSchema,
  type: ComponentTypeSchema,
  label: z.string().optional(),      // e.g., "HeNe #1"
  pose: Pose2DSchema,                // continuous position + orientation
  holePose: HolePoseSchema,          // snapped to grid indices
  locked: z.boolean().default(false), // prevent accidental moves
  meta: z.record(z.any()).optional() // e.g., focal length, reflectivity, mount id, etc.
})
export type Component = z.infer<typeof ComponentSchema>

// Beam properties for connections
export const BeamSchema = z.object({
  wavelengthNm: z.number().positive().optional(),
  polarization: z.enum(['H', 'V', 'D', 'A', 'R', 'L', 'unknown']).optional(),
  powerMw: z.number().positive().optional(),
  port: z.string().optional() // e.g., "transmitted", "reflected"
})
export type Beam = z.infer<typeof BeamSchema>

// Connection schema
export const ConnectionSchema = z.object({
  id: UUIDSchema,
  from: UUIDSchema,              // component ID
  to: UUIDSchema,                // component ID
  beam: BeamSchema.optional()    // beam properties
})
export type Connection = z.infer<typeof ConnectionSchema>

// Grid configuration
export const GridSchema = z.object({
  pitch: z.number().positive(),           // hole spacing in mm
  thread: z.enum(['1/4-20', 'M6']),       // thread type
  origin: z.object({ x: z.number(), y: z.number() }), // canvas origin (mm)
  nx: z.number().int().positive().optional(), // number of holes in x
  ny: z.number().int().positive().optional(), // number of holes in y
  snapToHoles: z.boolean().default(true)
})
export type Grid = z.infer<typeof GridSchema>

// View configuration
export const ViewSchema = z.object({
  zoom: z.number().positive().default(1.0),
  pan: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
  showGrid: z.boolean().default(true),
  showBeamPaths: z.boolean().default(true)
})
export type View = z.infer<typeof ViewSchema>

// Table schema
export const TableSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1).max(100),
  units: z.enum(['mm', 'inch']).default('mm'),
  angleUnits: z.enum(['deg', 'rad']).default('deg'),
  width: z.number().positive(),    // mm
  height: z.number().positive(),   // mm
  grid: GridSchema,
  view: ViewSchema
})
export type Table = z.infer<typeof TableSchema>

// Assets schema
export const AssetsSchema = z.object({
  thumbnails: z.array(z.string()).optional(), // data URLs or external refs
  notes: z.string().optional()                // freeform notes/annotations
})
export type Assets = z.infer<typeof AssetsSchema>

// History entry for undo/redo
export const HistoryEntrySchema = z.object({
  timestamp: z.number().positive(),
  action: z.string(),
  data: z.any().optional()
})
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>

// Meta information
export const MetaSchema = z.object({
  app: z.string().default('LightWorks'),
  createdAt: z.number().positive(),
  modifiedAt: z.number().positive(),
  author: z.string().optional(),
  checksum: z.string().optional()
})
export type Meta = z.infer<typeof MetaSchema>

// Main file format schema
export const LightWorksFileSchema = z.object({
  format: z.literal('lightworks'),
  version: z.number().positive().default(1),
  meta: MetaSchema,
  table: TableSchema,
  components: z.array(ComponentSchema),
  connections: z.array(ConnectionSchema),
  assets: AssetsSchema.optional(),
  history: z.array(HistoryEntrySchema).optional()
})
export type LightWorksFile = z.infer<typeof LightWorksFileSchema>

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

// Convert continuous pose to hole pose
export function poseToHolePose(pose: Pose2D, grid: Grid): HolePose {
  const { pitch, origin } = grid
  const i = Math.round((pose.x - origin.x) / pitch)
  const j = Math.round((pose.y - origin.y) / pitch)
  return {
    i: Math.max(0, i),
    j: Math.max(0, j),
    theta: pose.theta
  }
}

// Convert hole pose to continuous pose
export function holePoseToPose(holePose: HolePose, grid: Grid): Pose2D {
  const { pitch, origin } = grid
  return {
    x: origin.x + holePose.i * pitch,
    y: origin.y + holePose.j * pitch,
    theta: holePose.theta
  }
}

// Snap angle to common values
export function snapAngle(angle: number, snapDegrees: number = 5): number {
  return Math.round(angle / snapDegrees) * snapDegrees
}

// Default table template
export const DEFAULT_TABLE: Table = {
  id: crypto.randomUUID(),
  name: 'New Table',
  units: 'mm',
  angleUnits: 'deg',
  width: 900,
  height: 600,
  grid: {
    pitch: 25,
    thread: '1/4-20',
    origin: { x: 0, y: 0 },
    nx: 36,
    ny: 24,
    snapToHoles: true
  },
  view: {
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    showGrid: true,
    showBeamPaths: true
  }
}

// Sample table with components
export const SAMPLE_TABLE_FILE: LightWorksFile = {
  format: 'lightworks',
  version: 1,
  meta: {
    app: 'LightWorks',
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    author: 'system'
  },
  table: {
    ...DEFAULT_TABLE,
    name: 'Sample Raman Setup'
  },
  components: [
    {
      id: crypto.randomUUID(),
      type: 'Laser',
      label: 'HeNe #1',
      pose: { x: 100, y: 100, theta: 0 },
      holePose: { i: 4, j: 4, theta: 0 },
      locked: false,
      meta: { wavelengthNm: 632.8, powerMw: 1.5, mount: 'post-1in' }
    },
    {
      id: crypto.randomUUID(),
      type: 'Mirror',
      label: 'M1',
      pose: { x: 250, y: 100, theta: 45 },
      holePose: { i: 10, j: 4, theta: 45 },
      locked: false,
      meta: { diameterIn: 1.0, coating: 'protected-silver' }
    },
    {
      id: crypto.randomUUID(),
      type: 'Splitter',
      label: 'BS1',
      pose: { x: 350, y: 150, theta: 45 },
      holePose: { i: 14, j: 6, theta: 45 },
      locked: false,
      meta: { kind: 'plate', ratio: '50:50' }
    },
    {
      id: crypto.randomUUID(),
      type: 'Camera',
      label: 'DCC1545M',
      pose: { x: 600, y: 180, theta: 0 },
      holePose: { i: 24, j: 7, theta: 0 },
      locked: false,
      meta: { sensor: 'CMOS mono', interface: 'USB2' }
    }
  ],
  connections: [
    {
      id: crypto.randomUUID(),
      from: '', // Will be filled when components are created
      to: '',
      beam: { wavelengthNm: 632.8, polarization: 'H', powerMw: 1.5 }
    }
  ],
  assets: {
    notes: 'Sample Raman spectroscopy setup with HeNe laser, mirror, beam splitter, and camera.'
  }
}
