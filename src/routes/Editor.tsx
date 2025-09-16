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

export function Editor() {
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('table')
  const filePath = searchParams.get('file')
  const { loadTable, currentTable, isLoading, error } = useFileStore()
  const [fileData, setFileData] = useState<LegacyLightWorksFile | null>(null)
  const [isLoadingFile, setIsLoadingFile] = useState(false)

  useEffect(() => {
    if (filePath) {
      // Load from file path (new experiment)
      setIsLoadingFile(true)
      window.electronAPI.readFile(filePath)
        .then((result) => {
          if (result.success && result.content) {
            const data = JSON.parse(result.content)
            setFileData(data)
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


