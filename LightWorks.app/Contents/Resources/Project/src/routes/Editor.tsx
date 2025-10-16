import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useFileStore } from '../storage/useFileStore'
import { BenchCanvas } from '../components/Canvas/BenchCanvas'

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

  return (
    <div className="h-full w-full">
      <BenchCanvas />
    </div>
  )
}


