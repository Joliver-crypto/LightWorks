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
  if (typeof window === 'undefined') {
    // Node.js environment - would need fs module
    throw new Error('Node.js file system not implemented yet')
  } else {
    return new BrowserFileSystem()
  }
}

// File operations
export class FileOperations {
  private fs: FileSystem
  private experimentsPath: string
  private communityPath: string

  constructor(fs?: FileSystem) {
    this.fs = fs || createFileSystem()
    this.experimentsPath = '/Experiments'
    this.communityPath = '/Community'
  }

  // Generate file path for a table
  private getTablePath(tableId: string, folder: 'experiments' | 'community' = 'experiments'): string {
    const basePath = folder === 'experiments' ? this.experimentsPath : this.communityPath
    return `${basePath}/${tableId}.lightworks`
  }

  // Generate checksum for file content
  private generateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex')
  }

  // Load a table file
  async loadTable(tableId: string, folder: 'experiments' | 'community' = 'experiments'): Promise<LightWorksFile> {
    // First try to find the file by ID in the table metadata
    const basePath = folder === 'experiments' ? this.experimentsPath : this.communityPath
    
    try {
      const files = await this.fs.readdir(basePath)
      
      for (const file of files) {
        if (file.endsWith('.lightworks')) {
          try {
            const fullPath = `${basePath}/${file}`
            const content = await this.fs.readFile(fullPath)
            const data = JSON.parse(content)
            
            // Validate the file format
            if (data.format === 'lightworks' && data.table.id === tableId) {
              return data as LightWorksFile
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
    // Generate filename from table name (sanitized)
    const sanitizedName = table.table.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
    
    const basePath = folder === 'experiments' ? this.experimentsPath : this.communityPath
    const path = `${basePath}/${sanitizedName}.lightworks`
    
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
    const basePath = folder === 'experiments' ? this.experimentsPath : this.communityPath
    
    try {
      const files = await this.fs.readdir(basePath)
      const tables = []
      
      for (const file of files) {
        if (file.endsWith('.lightworks')) {
          try {
            // Load the table to get its metadata
            const fullPath = `${basePath}/${file}`
            const content = await this.fs.readFile(fullPath)
            const table = JSON.parse(content) as LightWorksFile
            
            // Validate the file format
            if (table.format === 'lightworks') {
              tables.push({
                id: table.table.id,
                name: table.table.name,
                modifiedAt: table.meta.modifiedAt
              })
            }
          } catch (error) {
            console.warn(`Failed to load table ${file}:`, error)
          }
        }
      }
      
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

// Singleton instance
export const fileOperations = new FileOperations()