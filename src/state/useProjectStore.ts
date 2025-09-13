import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Project, DeviceBinding, Table, DEFAULT_PROJECT, SAMPLE_PROJECT } from '../models/project'
import { DeviceType } from '../models/project'

interface ProjectState {
  // Project data
  project: Project
  isDirty: boolean
  lastSaved: Date | null
  
  // Actions
  setProject: (project: Project) => void
  updateTable: (table: Partial<Table>) => void
  addDevice: (device: DeviceBinding) => void
  updateDevice: (id: string, updates: Partial<DeviceBinding>) => void
  removeDevice: (id: string) => void
  removeDevices: (ids: string[]) => void
  duplicateDevice: (id: string) => void
  duplicateDevices: (ids: string[]) => void
  moveDevice: (id: string, pos: { x: number; y: number }) => void
  updateDevicePos: (id: string, pos: { x: number; y: number; angle?: number }) => void
  rotateDevice: (id: string, angle: number) => void
  setDeviceStatus: (id: string, status: 'green' | 'red' | 'gray') => void
  
  // Project management
  newProject: () => void
  loadSampleProject: () => void
  markDirty: () => void
  markClean: () => void
  
  // Device queries
  getDevice: (id: string) => DeviceBinding | undefined
  getDevicesByType: (type: DeviceType) => DeviceBinding[]
  getDevicesInArea: (x: number, y: number, width: number, height: number) => DeviceBinding[]
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      // Initial state
      project: DEFAULT_PROJECT,
      isDirty: false,
      lastSaved: null,
      
      // Project actions
      setProject: (project) => set({ project, isDirty: false, lastSaved: new Date() }),
      
      updateTable: (tableUpdates) => set((state) => ({
        project: {
          ...state.project,
          table: { ...state.project.table, ...tableUpdates }
        },
        isDirty: true
      })),
      
      addDevice: (device) => set((state) => ({
        project: {
          ...state.project,
          devices: [...state.project.devices, device]
        },
        isDirty: true
      })),
      
      updateDevice: (id, updates) => set((state) => ({
        project: {
          ...state.project,
          devices: state.project.devices.map(device =>
            device.id === id ? { ...device, ...updates } : device
          )
        },
        isDirty: true
      })),
      
      removeDevice: (id) => set((state) => ({
        project: {
          ...state.project,
          devices: state.project.devices.filter(device => device.id !== id)
        },
        isDirty: true
      })),
      
      removeDevices: (ids) => set((state) => ({
        project: {
          ...state.project,
          devices: state.project.devices.filter(device => !ids.includes(device.id))
        },
        isDirty: true
      })),
      
      duplicateDevice: (id) => {
        const device = get().getDevice(id)
        if (device) {
          const newDevice: DeviceBinding = {
            ...device,
            id: `${device.id}_copy_${Date.now()}`,
            name: `${device.name} (Copy)`,
            pos: {
              ...device.pos,
              x: device.pos.x + 50,
              y: device.pos.y + 50
            }
          }
          get().addDevice(newDevice)
        }
      },
      
      duplicateDevices: (ids) => {
        const devices = ids.map(id => get().getDevice(id)).filter(Boolean) as DeviceBinding[]
        const newDevices = devices.map(device => ({
          ...device,
          id: `${device.id}_copy_${Date.now()}`,
          name: `${device.name} (Copy)`,
          pos: {
            ...device.pos,
            x: device.pos.x + 50,
            y: device.pos.y + 50
          }
        }))
        
        set((state) => ({
          project: {
            ...state.project,
            devices: [...state.project.devices, ...newDevices]
          },
          isDirty: true
        }))
      },
      
      moveDevice: (id, pos) => set((state) => ({
        project: {
          ...state.project,
          devices: state.project.devices.map(device =>
            device.id === id ? { ...device, pos: { ...device.pos, ...pos } } : device
          )
        },
        isDirty: true
      })),
      
      updateDevicePos: (id, pos) => set((state) => ({
        project: {
          ...state.project,
          devices: state.project.devices.map(device =>
            device.id === id ? { ...device, pos: { ...device.pos, ...pos } } : device
          )
        },
        isDirty: true
      })),
      
      rotateDevice: (id, angle) => set((state) => ({
        project: {
          ...state.project,
          devices: state.project.devices.map(device =>
            device.id === id ? { ...device, pos: { ...device.pos, angle } } : device
          )
        },
        isDirty: true
      })),
      
      setDeviceStatus: (id, status) => set((state) => ({
        project: {
          ...state.project,
          devices: state.project.devices.map(device =>
            device.id === id ? { ...device, status } : device
          )
        },
        isDirty: true
      })),
      
      // Project management
      newProject: () => set({
        project: DEFAULT_PROJECT,
        isDirty: false,
        lastSaved: null
      }),
      
      loadSampleProject: () => set({
        project: SAMPLE_PROJECT,
        isDirty: false,
        lastSaved: null
      }),
      
      markDirty: () => set({ isDirty: true }),
      markClean: () => set({ isDirty: false, lastSaved: new Date() }),
      
      // Device queries
      getDevice: (id) => get().project.devices.find(device => device.id === id),
      
      getDevicesByType: (type) => get().project.devices.filter(device => device.type === type),
      
      getDevicesInArea: (x, y, width, height) => {
        return get().project.devices.filter(device => {
          const deviceX = device.pos.x
          const deviceY = device.pos.y
          return deviceX >= x && deviceX <= x + width && deviceY >= y && deviceY <= y + height
        })
      }
    }),
    {
      name: 'project-store',
    }
  )
)
