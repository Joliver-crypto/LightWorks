import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useStorageStore } from '../storage/useStorageStore'
import { BenchCanvas } from '../components/Canvas/BenchCanvas'

export function Editor() {
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('table')
  const { loadTable, currentSnapshot, isLoading, error } = useStorageStore()

  useEffect(() => {
    if (tableId) {
      loadTable(tableId).catch(error => {
        console.error('Failed to load table:', error)
      })
    }
  }, [tableId, loadTable])

  if (isLoading) {
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

  if (!currentSnapshot) {
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


