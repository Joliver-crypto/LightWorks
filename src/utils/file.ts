// File operations for project save/load

import { Project, ProjectSchema } from '../models/project'

// File system access API support
export function supportsFileSystemAccess(): boolean {
  return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window
}

// Save project to file
export async function saveProject(project: Project, filename?: string): Promise<void> {
  const jsonString = JSON.stringify(project, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  
  if (supportsFileSystemAccess()) {
    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename || 'project.optbench.json',
        types: [{
          description: 'LightWork Project Files',
          accept: {
            'application/json': ['.optbench.json']
          }
        }]
      })
      
      const writable = await fileHandle.createWritable()
      await writable.write(blob)
      await writable.close()
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        throw new Error(`Failed to save project: ${error.message}`)
      }
    }
  } else {
    // Fallback to download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'project.optbench.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Load project from file
export async function loadProject(): Promise<Project> {
  if (supportsFileSystemAccess()) {
    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'LightWork Project Files',
          accept: {
            'application/json': ['.optbench.json']
          }
        }]
      })
      
      const file = await fileHandle.getFile()
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validate with Zod schema
      const project = ProjectSchema.parse(data)
      return project
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        throw new Error(`Failed to load project: ${error.message}`)
      }
      throw error
    }
  } else {
    // Fallback to file input
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.optbench.json'
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) {
          reject(new Error('No file selected'))
          return
        }
        
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          const project = ProjectSchema.parse(data)
          resolve(project)
        } catch (error) {
          reject(new Error(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      
      input.oncancel = () => {
        reject(new Error('File selection cancelled'))
      }
      
      input.click()
    })
  }
}

// Export project as JSON
export function exportProject(project: Project): string {
  return JSON.stringify(project, null, 2)
}

// Import project from JSON string
export function importProject(jsonString: string): Project {
  try {
    const data = JSON.parse(jsonString)
    return ProjectSchema.parse(data)
  } catch (error) {
    throw new Error(`Failed to import project: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
  }
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Check if file is valid project file
export function isValidProjectFile(filename: string): boolean {
  const extension = getFileExtension(filename)
  return extension === 'json' || extension === 'optbench'
}

// Generate filename with timestamp
export function generateProjectFilename(prefix: string = 'project'): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${prefix}_${timestamp}.optbench.json`
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Read file as text
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Read file as array buffer
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// Create download link
export function createDownloadLink(data: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
