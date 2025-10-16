import { LightWorksFile, poseToHolePose } from '../models/fileFormat'
// Browser-compatible hash function
function createHash(_algorithm: string) {
  return {
    update(data: string) {
      return {
        digest(_encoding: string) {
          // Simple hash for demo purposes - in production, use a proper crypto library
          let hash = 0
          for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
          }
          return Math.abs(hash).toString(16)
        }
      }
    }
  }
}

// File system operations for LightWorks table files
export interface FileSystem {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  readdir(path: string): Promise<string[]>
  mkdir(path: string): Promise<void>
  exists(path: string): Promise<boolean>
  stat(path: string): Promise<{ isDirectory(): boolean; mtime: Date }>
}

// Electron API interface
interface ElectronAPI {
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  readdir: (dirPath: string) => Promise<{ success: boolean; files?: string[]; error?: string }>
  mkdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>
  stat: (filePath: string) => Promise<{ success: boolean; isDirectory?: boolean; mtime?: Date; error?: string }>
  exists: (filePath: string) => Promise<{ success: boolean; exists?: boolean; error?: string }>
  showSaveDialog: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>
  showOpenDialog: (options?: any) => Promise<{ canceled: boolean; filePaths?: string[] }>
  showDirectoryDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>
  platform: string
  isElectron: boolean
}

// Electron-based file system implementation
class ElectronFileSystem implements FileSystem {
  private electronAPI: ElectronAPI

  constructor() {
    this.electronAPI = (window as any).electronAPI
  }

  async readFile(path: string): Promise<string> {
    const result = await this.electronAPI.readFile(path)
    if (!result.success) {
      throw new Error(result.error || 'Failed to read file')
    }
    return result.content!
  }

  async writeFile(path: string, content: string): Promise<void> {
    const result = await this.electronAPI.writeFile(path, content)
    if (!result.success) {
      throw new Error(result.error || 'Failed to write file')
    }
  }

  async readdir(path: string): Promise<string[]> {
    const result = await this.electronAPI.readdir(path)
    if (!result.success) {
      throw new Error(result.error || 'Failed to read directory')
    }
    return result.files!
  }

  async mkdir(path: string): Promise<void> {
    const result = await this.electronAPI.mkdir(path)
    if (!result.success) {
      throw new Error(result.error || 'Failed to create directory')
    }
  }

  async exists(path: string): Promise<boolean> {
    const result = await this.electronAPI.exists(path)
    if (!result.success) {
      throw new Error(result.error || 'Failed to check file existence')
    }
    return result.exists!
  }

  async stat(path: string): Promise<{ isDirectory(): boolean; mtime: Date }> {
    const result = await this.electronAPI.stat(path)
    if (!result.success) {
      throw new Error(result.error || 'Failed to get file stats')
    }
    return {
      isDirectory: () => result.isDirectory!,
      mtime: result.mtime!
    }
  }
}

// Browser-based file system implementation
class BrowserFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Failed to read file: ${path}`)
    }
    return await response.text()
  }

  async writeFile(path: string, content: string): Promise<void> {
    // In browser, we can't directly write to file system
    // This would typically trigger a download
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = path.split('/').pop() || 'experiment.lightworks'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async readdir(_path: string): Promise<string[]> {
    // In browser, we can't read directories directly
    // This would need to be handled by the backend or file picker
    throw new Error('Directory reading not supported in browser')
  }

  async mkdir(_path: string): Promise<void> {
    // In browser, we can't create directories directly
    throw new Error('Directory creation not supported in browser')
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.readFile(path)
      return true
    } catch {
      return false
    }
  }

  async stat(_path: string): Promise<{ isDirectory(): boolean; mtime: Date }> {
    // In browser, we can't get file stats directly
    throw new Error('File stats not supported in browser')
  }
}

// File system factory
export function createFileSystem(): FileSystem {
  console.log('createFileSystem: window =', typeof window)
  console.log('createFileSystem: electronAPI =', (window as any).electronAPI)
  console.log('createFileSystem: electronAPI.isElectron =', (window as any).electronAPI?.isElectron)
  
  if (typeof window === 'undefined') {
    // Node.js environment - would need fs module
    throw new Error('Node.js file system not implemented yet')
  } else if ((window as any).electronAPI?.isElectron === true) {
    // Electron environment
    console.log('createFileSystem: Using ElectronFileSystem')
    return new ElectronFileSystem()
  } else {
    // Browser environment
    console.log('createFileSystem: Using BrowserFileSystem')
    return new BrowserFileSystem()
  }
}

// File operations
export class FileOperations {
  private fs: FileSystem

  constructor(fs?: FileSystem) {
    this.fs = fs || createFileSystem()
  }

  // Get the correct path based on current environment
  private async getExperimentsPath(): Promise<string> {
    const isElectron = (window as any).electronAPI?.isElectron
    console.log('FileOperations: isElectron =', isElectron)
    if (isElectron) {
      // Use the Electron API to get the correct experiments directory
      try {
        const result = await (window as any).api.getExperimentsDir()
        return result
      } catch (error) {
        console.error('Failed to get experiments directory:', error)
        return '~/Documents/LightWorks/Experiments'
      }
    }
    return '/Experiments'
  }

  private async getCommunityPath(): Promise<string> {
    const isElectron = (window as any).electronAPI?.isElectron
    console.log('FileOperations: isElectron =', isElectron)
    if (isElectron) {
      // For now, use the same directory as experiments
      try {
        const result = await (window as any).api.getExperimentsDir()
        return result.replace('Experiments', 'Community')
      } catch (error) {
        console.error('Failed to get community directory:', error)
        return '~/Documents/LightWorks/Community'
      }
    }
    return '/Community'
  }

  // Expand home directory path
  private async expandPath(path: string): Promise<string> {
    if (path.startsWith('~/')) {
      if ((window as any).electronAPI?.isElectron) {
        const homeDir = await (window as any).electronAPI.getHomeDir()
        return path.replace('~', homeDir)
      } else {
        // Fallback for browser (though this shouldn't happen with ~ paths)
        return path
      }
    }
    return path
  }


  // Generate checksum for file content
  private generateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex')
  }

  // Load a table file
  async loadTable(tableId: string, folder: 'experiments' | 'community' = 'experiments'): Promise<LightWorksFile> {
    // First try to find the file by ID in the table metadata
    const basePath = await this.expandPath(folder === 'experiments' ? await this.getExperimentsPath() : await this.getCommunityPath())
    
    try {
      const files = await this.fs.readdir(basePath)
      
      for (const file of files) {
        if (file.endsWith('.lightworks')) {
          try {
            const fullPath = `${basePath}/${file}`
            const content = await this.fs.readFile(fullPath)
            const data = JSON.parse(content) as any
            const displayName = file
              .replace(/\.lightworks$/i, '')
              .replace(/-/g, ' ')
              .trim()
            
            // Handle both old and new file formats
            if (data.format === 'lightworks' && data.table && data.table.id === tableId) {
              // New format
              ;(data as any)._displayName = displayName
              ;(data as any)._filePath = fullPath
              return data as LightWorksFile
            } else if (data.schemaVersion && data.name && (data.table?.id === tableId || !data.table)) {
              // Old format - convert to new format
              const convertedTable: LightWorksFile = {
                format: 'lightworks',
                version: 1,
                meta: {
                  app: 'LightWorks',
                  createdAt: new Date(data.createdAt).getTime(),
                  modifiedAt: data.config?.lastSaved ? new Date(data.config.lastSaved).getTime() : new Date(data.createdAt).getTime(),
                  author: 'user'
                },
                table: {
                  id: data.table?.id || tableId,
                  name: data.name,
                  units: 'mm',
                  angleUnits: 'deg',
                  width: 900,
                  height: 600,
                  grid: {
                    pitch: data.config?.holePitchMm || 25,
                    thread: '1/4-20',
                    origin: { x: 0, y: 0 },
                    nx: data.config?.cols || 10,
                    ny: data.config?.rows || 10,
                    snapToHoles: true
                  },
                  view: {
                    zoom: 1.0,
                    pan: { x: 0, y: 0 },
                    showGrid: true,
                    showBeamPaths: true
                  }
                },
                components: data.config?.devices || [],
                connections: [],
                assets: {
                  notes: ''
                }
              }
              ;(convertedTable as any)._displayName = displayName
              ;(convertedTable as any)._filePath = fullPath
              return convertedTable
            }
          } catch (error) {
            console.warn(`Failed to read table file ${file}:`, error)
          }
        }
      }
      
      throw new Error(`Table with ID ${tableId} not found`)
    } catch (error) {
      throw new Error(`Failed to load table: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Save a table file
  async saveTable(table: LightWorksFile, folder: 'experiments' | 'community' = 'experiments'): Promise<void> {
    // Prefer saving back to the existing file path if available (handles external renames)
    const existingPath = (table as any)._filePath as string | undefined
    let path: string
    if (existingPath) {
      path = existingPath
    } else {
      // Generate filename from table name (sanitized)
      const sanitizedName = table.table.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
      const basePath = await this.expandPath(folder === 'experiments' ? await this.getExperimentsPath() : await this.getCommunityPath())
      path = `${basePath}/${sanitizedName}.lightworks`
      ;(table as any)._filePath = path
    }
    
    // Update metadata
    const now = Date.now()
    table.meta.modifiedAt = now
    if (!table.meta.createdAt) {
      table.meta.createdAt = now
    }

    // Generate checksum
    const content = JSON.stringify(table, null, 2)
    table.meta.checksum = this.generateChecksum(content)

    // Ensure components have hole poses
    table.components = table.components.map(comp => ({
      ...comp,
      holePose: comp.holePose || poseToHolePose(comp.pose, table.table.grid)
    }))

    // Write file
    await this.fs.writeFile(path, JSON.stringify(table, null, 2))
  }

  // List all tables in a folder
  async listTables(folder: 'experiments' | 'community' = 'experiments'): Promise<Array<{ id: string; name: string; modifiedAt: number }>> {
    const basePath = await this.expandPath(folder === 'experiments' ? await this.getExperimentsPath() : await this.getCommunityPath())
    
    try {
      const files = await this.fs.readdir(basePath)
      const byId: Record<string, { id: string; name: string; modifiedAt: number }> = {}
      
      for (const file of files) {
        if (file.endsWith('.lightworks')) {
          try {
            // Derive display name from filename so external renames are reflected in UI
            const displayName = file
              .replace(/\.lightworks$/i, '')
              .replace(/-/g, ' ')
              .trim()
            // Load the table to get its metadata
            const fullPath = `${basePath}/${file}`
            const content = await this.fs.readFile(fullPath)
            const table = JSON.parse(content) as any
            
            // Handle both old and new file formats
            if (table.format === 'lightworks' && table.table) {
              // New format
              const rec = {
                id: table.table.id,
                name: displayName,
                modifiedAt: table.meta.modifiedAt as number
              }
              const existing = byId[rec.id]
              if (!existing || rec.modifiedAt > existing.modifiedAt) {
                byId[rec.id] = rec
              }
            } else if (table.schemaVersion && table.name) {
              // Old format - convert to new format structure
              const tableId = table.table?.id || crypto.randomUUID()
              const modifiedAt = table.config?.lastSaved ? new Date(table.config.lastSaved).getTime() : new Date(table.createdAt).getTime()
              
              const rec = {
                id: tableId,
                name: displayName,
                modifiedAt
              }
              const existing = byId[rec.id]
              if (!existing || rec.modifiedAt > existing.modifiedAt) {
                byId[rec.id] = rec
              }
            }
          } catch (error) {
            console.warn(`Failed to load table ${file}:`, error)
          }
        }
      }
      const tables = Object.values(byId)
      return tables.sort((a, b) => b.modifiedAt - a.modifiedAt)
    } catch (error) {
      console.warn(`Failed to list tables in ${folder}:`, error)
      return []
    }
  }

  // Create a new table
  async createTable(name: string, folder: 'experiments' | 'community' = 'experiments'): Promise<LightWorksFile> {
    const tableId = crypto.randomUUID()
    const now = Date.now()
    
    const table: LightWorksFile = {
      format: 'lightworks',
      version: 1,
      meta: {
        app: 'LightWorks',
        createdAt: now,
        modifiedAt: now,
        author: 'user' // TODO: Get from user context
      },
      table: {
        id: tableId,
        name,
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
      },
      components: [],
      connections: [],
      assets: {
        notes: ''
      }
    }

    await this.saveTable(table, folder)
    return table
  }

  // Delete a table
  async deleteTable(_tableId: string, _folder: 'experiments' | 'community' = 'experiments'): Promise<void> {
    // const path = this.getTablePath(tableId, folder)
    // Note: Browser file system can't delete files directly
    // This would need to be handled by the backend
    throw new Error('File deletion not supported in browser')
  }

  // Duplicate a table
  async duplicateTable(tableId: string, newName: string, folder: 'experiments' | 'community' = 'experiments'): Promise<LightWorksFile> {
    const original = await this.loadTable(tableId, folder)
    const newId = crypto.randomUUID()
    const now = Date.now()
    
    const duplicate: LightWorksFile = {
      ...original,
      table: {
        ...original.table,
        id: newId,
        name: newName
      },
      meta: {
        ...original.meta,
        createdAt: now,
        modifiedAt: now,
        checksum: undefined
      },
      components: original.components.map(comp => ({
        ...comp,
        id: crypto.randomUUID()
      })),
      connections: original.connections.map(conn => ({
        ...conn,
        id: crypto.randomUUID()
      }))
    }

    await this.saveTable(duplicate, folder)
    return duplicate
  }
}

// Lazy singleton instance
let _fileOperations: FileOperations | null = null

export function getFileOperations(): FileOperations {
  if (!_fileOperations) {
    _fileOperations = new FileOperations()
  }
  return _fileOperations
}

// For backward compatibility
export const fileOperations = new Proxy({} as FileOperations, {
  get(_target, prop) {
    return getFileOperations()[prop as keyof FileOperations]
  }
})