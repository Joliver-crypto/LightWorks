import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useFileStore } from '../storage/useFileStore'

// Legacy file format interface for backward compatibility
interface LegacyLightWorksFile {
  schemaVersion: number
  createdAt: string
  name: string
  config: {
    rows: number
    cols: number
    holePitchMm: number
    devices: any[]
    lastSaved?: string
  }
}

// Utility function to format timestamps
const formatTimestamp = (timestamp: string | number) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `Saved ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  } else if (diffHours < 24) {
    return `Saved ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return 'Saved Yesterday'
  } else {
    return `Saved ${date.toLocaleDateString()}`
  }
}

const formatCreatedTime = (timestamp: string | number) => {
  const date = new Date(timestamp)
  return `Created ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}

export function Editor() {
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('table')
  const filePath = searchParams.get('file')
  const { loadTable, currentTable, isLoading, error } = useFileStore()
  const [fileData, setFileData] = useState<LegacyLightWorksFile | null>(null)
  const [isLoadingFile, setIsLoadingFile] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null)

  const handleSave = async () => {
    if (!filePath) return
    
    setIsSaving(true)
    try {
      // Update the file with current timestamp
      const updatedData = {
        ...fileData,
        config: {
          ...fileData?.config,
          lastSaved: new Date().toISOString()
        }
      }
      
      const content = JSON.stringify(updatedData, null, 2)
      const result = await window.electronAPI.writeFile(filePath, content)
      
      if (result.success) {
        setFileData(updatedData as LegacyLightWorksFile)
        setLastSaved('Just now')
        setLastSavedTimestamp(new Date().toISOString())
      } else {
        console.error('Failed to save file:', result.error)
      }
    } catch (error) {
      console.error('Failed to save file:', error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (filePath) {
      // Load from file path (new experiment)
      setIsLoadingFile(true)
      window.electronAPI.readFile(filePath)
        .then((result) => {
          if (result.success && result.content) {
            const data = JSON.parse(result.content)
            setFileData(data)
            // Set initial last saved time
            if (data.config?.lastSaved) {
              setLastSaved(formatTimestamp(data.config.lastSaved))
              setLastSavedTimestamp(data.config.lastSaved)
            } else {
              setLastSaved(formatCreatedTime(data.createdAt))
              setLastSavedTimestamp(data.createdAt)
            }
          } else {
            console.error('Failed to read file:', result.error)
          }
        })
        .catch((error) => {
          console.error('Failed to load file:', error)
        })
        .finally(() => {
          setIsLoadingFile(false)
        })
    } else if (tableId) {
      // Load from table ID (existing experiment)
      loadTable(tableId, 'experiments').catch((error: any) => {
        console.error('Failed to load table:', error)
      })
    }
  }, [tableId, filePath, loadTable])

  // Update timestamp display every minute
  useEffect(() => {
    if (!lastSavedTimestamp) return

    const interval = setInterval(() => {
      setLastSaved(formatTimestamp(lastSavedTimestamp))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [lastSavedTimestamp])

  if (isLoading || isLoadingFile) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-600">Loading table...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading table: {error}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Get table data from either file or store
  const tableData = fileData || currentTable
  if (!tableData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No table loaded</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Extract grid dimensions
  const rows = fileData?.config?.rows || currentTable?.table?.grid?.ny || 10
  const cols = fileData?.config?.cols || currentTable?.table?.grid?.nx || 10
  const holePitch = fileData?.config?.holePitchMm || currentTable?.table?.grid?.pitch || 25

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header with table info */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {fileData?.name || currentTable?.table?.name || 'Untitled Table'}
              </h1>
              {filePath && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Save
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-600">
                {rows} rows × {cols} columns • {holePitch}mm hole pitch
              </p>
              {lastSaved && (
                <p className="text-sm text-gray-500">
                  {lastSaved}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-800 ml-4"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Table visualization */}
      <div className="flex-1 p-6">
        <div className="bg-gray-50 rounded-lg p-4 h-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optical Table Grid</h3>
          <div className="grid gap-1" style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            aspectRatio: `${cols}/${rows}`
          }}>
            {Array.from({ length: rows * cols }, (_, index) => {
              const row = Math.floor(index / cols)
              const col = index % cols
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-300 rounded-sm aspect-square flex items-center justify-center text-xs text-gray-500 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  title={`Hole ${row + 1},${col + 1}`}
                >
                  {row + 1},{col + 1}
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Grid: {rows} × {cols} holes • Pitch: {holePitch}mm</p>
            <p className="text-xs mt-1">Click on holes to place optical components</p>
          </div>
        </div>
      </div>
    </div>
  )
}


