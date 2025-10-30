import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { LightWorksFile, Component, Connection, poseToHolePose } from '../models/fileFormat'
import { fileOperations } from './fileOperations'

interface FileState {
  // Current table state
  currentTable: LightWorksFile | null
  isDirty: boolean
  isLoading: boolean
  error: string | null

  // Table management
  experiments: Array<{ id: string; name: string; modifiedAt: number }>
  community: Array<{ id: string; name: string; modifiedAt: number }>
  currentFolder: 'experiments' | 'community'

  // History for undo/redo
  history: LightWorksFile[]
  historyIndex: number
  maxHistorySize: number

  // Actions
  loadTable: (tableId: string, folder?: 'experiments' | 'community') => Promise<void>
  saveTable: () => Promise<void>
  createTable: (name: string, folder?: 'experiments' | 'community', gridConfig?: { nx: number; ny: number }) => Promise<void>
  deleteTable: (tableId: string, folder?: 'experiments' | 'community') => Promise<void>
  duplicateTable: (tableId: string, newName: string, folder?: 'experiments' | 'community') => Promise<void>
  listTables: (folder?: 'experiments' | 'community') => Promise<void>
  setCurrentFolder: (folder: 'experiments' | 'community') => void
  clearCurrentTable: () => void

  // Component operations
  addComponent: (component: Omit<Component, 'id'>) => void
  updateComponent: (id: string, updates: Partial<Component>) => void
  removeComponent: (id: string) => void
  moveComponent: (id: string, pose: { x: number; y: number; theta: number }) => void

  // Connection operations
  addConnection: (connection: Omit<Connection, 'id'>) => void
  updateConnection: (id: string, updates: Partial<Connection>) => void
  removeConnection: (id: string) => void

  // Table operations
  updateTable: (updates: Partial<LightWorksFile['table']>) => void
  updateView: (updates: Partial<LightWorksFile['table']['view']>) => void
  updateGrid: (updates: Partial<LightWorksFile['table']['grid']>) => void

  // History management
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Utility
  markDirty: () => void
  clearError: () => void
}

export const useFileStore = create<FileState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentTable: null,
      isDirty: false,
      isLoading: false,
      error: null,
      experiments: [],
      community: [],
      currentFolder: 'experiments',
      
      // History state
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,

      // Table management
      loadTable: async (tableId: string, folder: 'experiments' | 'community' = 'experiments') => {
        set({ isLoading: true, error: null })
        try {
          const table = await fileOperations.loadTable(tableId, folder)
          set({ 
            currentTable: table, 
            isDirty: false, 
            isLoading: false,
            currentFolder: folder,
            // Initialize history with the loaded table
            history: [table],
            historyIndex: 0
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load table',
            isLoading: false 
          })
        }
      },

      saveTable: async () => {
        const { currentTable, currentFolder } = get()
        if (!currentTable) return

        set({ isLoading: true, error: null })
        try {
          await fileOperations.saveTable(currentTable, currentFolder)
          set({ isDirty: false, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to save table',
            isLoading: false 
          })
        }
      },

      createTable: async (name: string, folder: 'experiments' | 'community' = 'experiments', gridConfig?: { nx: number; ny: number }) => {
        set({ isLoading: true, error: null })
        try {
          const table = await fileOperations.createTable(name, folder, gridConfig)
          set({ 
            currentTable: table, 
            isDirty: false, 
            isLoading: false,
            currentFolder: folder
          })
          // Refresh the table list
          await get().listTables(folder)
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create table',
            isLoading: false 
          })
        }
      },

      deleteTable: async (tableId: string, folder: 'experiments' | 'community' = 'experiments') => {
        set({ isLoading: true, error: null })
        try {
          await fileOperations.deleteTable(tableId, folder)
          set({ isLoading: false })
          // Refresh the table list
          await get().listTables(folder)
          // Clear current table if it was deleted
          const { currentTable } = get()
          if (currentTable?.table.id === tableId) {
            set({ currentTable: null, isDirty: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete table',
            isLoading: false 
          })
        }
      },

      duplicateTable: async (tableId: string, newName: string, folder: 'experiments' | 'community' = 'experiments') => {
        set({ isLoading: true, error: null })
        try {
          const table = await fileOperations.duplicateTable(tableId, newName, folder)
          set({ 
            currentTable: table, 
            isDirty: false, 
            isLoading: false,
            currentFolder: folder
          })
          // Refresh the table list
          await get().listTables(folder)
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to duplicate table',
            isLoading: false 
          })
        }
      },

      listTables: async (folder: 'experiments' | 'community' = 'experiments') => {
        set({ isLoading: true, error: null })
        try {
          const tables = await fileOperations.listTables(folder)
          if (folder === 'experiments') {
            set({ experiments: tables, isLoading: false })
          } else {
            set({ community: tables, isLoading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to list tables',
            isLoading: false 
          })
        }
      },

      setCurrentFolder: (folder: 'experiments' | 'community') => {
        set({ currentFolder: folder })
      },

      clearCurrentTable: () => {
        set({ currentTable: null, isDirty: false, error: null })
      },

      // Component operations
      addComponent: (component: Omit<Component, 'id'>) => {
        const { currentTable, saveToHistory } = get()
        if (!currentTable) return

        // Save current state to history before making changes
        saveToHistory()

        const newComponent: Component = {
          ...component,
          id: crypto.randomUUID(),
          holePose: component.holePose || poseToHolePose(component.pose, currentTable.table.grid)
        }

        const updatedTable: LightWorksFile = {
          ...currentTable,
          components: [...currentTable.components, newComponent],
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      updateComponent: (id: string, updates: Partial<Component>) => {
        const { currentTable, saveToHistory } = get()
        if (!currentTable) return

        // Save current state to history before making changes
        saveToHistory()

        const updatedTable: LightWorksFile = {
          ...currentTable,
          components: currentTable.components.map(comp =>
            comp.id === id ? { ...comp, ...updates } : comp
          ),
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      removeComponent: (id: string) => {
        const { currentTable, saveToHistory } = get()
        if (!currentTable) return

        // Save current state to history before making changes
        saveToHistory()

        const updatedTable: LightWorksFile = {
          ...currentTable,
          components: currentTable.components.filter(comp => comp.id !== id),
          connections: currentTable.connections.filter(conn => 
            conn.from !== id && conn.to !== id
          ),
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      moveComponent: (id: string, pose: { x: number; y: number; theta: number }) => {
        const { currentTable, saveToHistory } = get()
        if (!currentTable) return

        // Save current state to history before making changes
        saveToHistory()

        const holePose = poseToHolePose(pose, currentTable.table.grid)

        const updatedTable: LightWorksFile = {
          ...currentTable,
          components: currentTable.components.map(comp =>
            comp.id === id ? { ...comp, pose, holePose } : comp
          ),
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      // Connection operations
      addConnection: (connection: Omit<Connection, 'id'>) => {
        const { currentTable } = get()
        if (!currentTable) return

        const newConnection: Connection = {
          ...connection,
          id: crypto.randomUUID()
        }

        const updatedTable: LightWorksFile = {
          ...currentTable,
          connections: [...currentTable.connections, newConnection],
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      updateConnection: (id: string, updates: Partial<Connection>) => {
        const { currentTable } = get()
        if (!currentTable) return

        const updatedTable: LightWorksFile = {
          ...currentTable,
          connections: currentTable.connections.map(conn =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      removeConnection: (id: string) => {
        const { currentTable } = get()
        if (!currentTable) return

        const updatedTable: LightWorksFile = {
          ...currentTable,
          connections: currentTable.connections.filter(conn => conn.id !== id),
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      // Table operations
      updateTable: (updates: Partial<LightWorksFile['table']>) => {
        const { currentTable } = get()
        if (!currentTable) return

        const updatedTable: LightWorksFile = {
          ...currentTable,
          table: { ...currentTable.table, ...updates },
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      updateView: (updates: Partial<LightWorksFile['table']['view']>) => {
        const { currentTable } = get()
        if (!currentTable) return

        const updatedTable: LightWorksFile = {
          ...currentTable,
          table: {
            ...currentTable.table,
            view: { ...currentTable.table.view, ...updates }
          },
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      updateGrid: (updates: Partial<LightWorksFile['table']['grid']>) => {
        const { currentTable } = get()
        if (!currentTable) return

        const newGrid = { ...currentTable.table.grid, ...updates }
        
        // Update table dimensions if nx or ny changed
        let newWidth = currentTable.table.width
        let newHeight = currentTable.table.height
        
        if (updates.nx !== undefined || updates.ny !== undefined) {
          const pitch = newGrid.pitch
          newWidth = (newGrid.nx || 36) * pitch - pitch // (nx - 1) * pitch
          newHeight = (newGrid.ny || 24) * pitch - pitch // (ny - 1) * pitch
        }
        
        // Update component hole poses when grid changes
        const updatedComponents = currentTable.components.map(comp => ({
          ...comp,
          holePose: poseToHolePose(comp.pose, newGrid)
        }))

        const updatedTable: LightWorksFile = {
          ...currentTable,
          table: {
            ...currentTable.table,
            width: newWidth,
            height: newHeight,
            grid: newGrid
          },
          components: updatedComponents,
          meta: {
            ...currentTable.meta,
            modifiedAt: Date.now()
          }
        }

        set({ currentTable: updatedTable, isDirty: true })
      },

      // History management
      saveToHistory: () => set((state) => {
        const currentTable = state.currentTable
        if (!currentTable) return state
        
        const newHistory = [...state.history.slice(0, state.historyIndex + 1), currentTable]
        const trimmedHistory = newHistory.length > state.maxHistorySize 
          ? newHistory.slice(-state.maxHistorySize)
          : newHistory
        
        return {
          history: trimmedHistory,
          historyIndex: trimmedHistory.length - 1
        }
      }),
      
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1
          return {
            currentTable: state.history[newIndex],
            historyIndex: newIndex,
            isDirty: true
          }
        }
        return state
      }),
      
      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1
          return {
            currentTable: state.history[newIndex],
            historyIndex: newIndex,
            isDirty: true
          }
        }
        return state
      }),
      
      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Utility
      markDirty: () => set({ isDirty: true }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'file-storage'
    }
  )
)
