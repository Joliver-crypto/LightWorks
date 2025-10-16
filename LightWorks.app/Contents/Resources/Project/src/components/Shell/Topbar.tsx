import { 
  DocumentArrowDownIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useProjectStore } from '../../state/useProjectStore'
import { useUiStore } from '../../state/useUiStore'
import { useFileStore } from '../../storage/useFileStore'
import { Button } from '../Common/Button'
import { useNavigate } from 'react-router-dom'

function formatTimestamp(timestamp: number | null): string | null {
  if (!timestamp) return null
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `Saved ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `Saved ${new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  if (diffDays === 1) return 'Saved Yesterday'
  return `Saved ${new Date(timestamp).toLocaleDateString()}`
}

export function Topbar() {
  const navigate = useNavigate()
  const { markClean } = useProjectStore()
  const { 
    zoomIn, 
    zoomOut, 
    zoomToFit, 
    toggleSnapToGrid, 
    snapToGrid,
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    toggleSidebarLeft,
    toggleSidebarRight
  } = useUiStore()

  const { currentTable, isDirty: fileIsDirty, saveTable } = useFileStore()

  const [lastSavedTs, setLastSavedTs] = useState<number | null>(currentTable?.meta.modifiedAt ?? null)
  const [_nowTicker, setNowTicker] = useState(0)

  useEffect(() => {
    setLastSavedTs(currentTable?.meta.modifiedAt ?? null)
  }, [currentTable?.meta.modifiedAt, currentTable?.table?.id])

  useEffect(() => {
    const id = setInterval(() => setNowTicker((n) => n + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const handleHome = () => {
    navigate('/')
  }

  const handleSave = async () => {
    try {
      await saveTable()
      setLastSavedTs(Date.now())
      markClean()
    } catch (e) {
      console.error('Failed to save table:', e)
    }
  }

  useEffect(() => {
    if (!currentTable) return
    const interval = setInterval(async () => {
      if (useFileStore.getState().isDirty) {
        try {
          await saveTable()
          setLastSavedTs(Date.now())
          markClean()
        } catch (e) {
          console.error('Autosave failed:', e)
        }
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [currentTable?.table?.id, saveTable, markClean])

  const lastSavedText = formatTimestamp(lastSavedTs)
  const fileDisplayName = (currentTable as any)?._displayName as string | undefined
  const tableName = fileDisplayName || currentTable?.table?.name || 'Untitled Table'

  const handleUndo = () => {
    console.log('Undo')
  }

  const handleRedo = () => {
    console.log('Redo')
  }

  const handleRunWorkflow = () => {
    console.log('Run workflow')
  }

  const handleStopWorkflow = () => {
    console.log('Stop workflow')
  }

  const handleEmergencyStop = () => {
    console.log('EMERGENCY STOP')
  }

  return (
    <>
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
        {/* Home + Title */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            title="Home (Ctrl+H)"
          >
            <HomeIcon className="w-4 h-4" />
          </Button>
          <div className="text-sm text-gray-900 font-medium truncate max-w-[28ch]" title={tableName}>
            {tableName}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Sidebar toggles */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebarLeft}
            title={sidebarLeftCollapsed ? "Show Left Sidebar" : "Hide Left Sidebar"}
          >
            {sidebarLeftCollapsed ? (
              <Bars3Icon className="w-4 h-4" />
            ) : (
              <XMarkIcon className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebarRight}
            title={sidebarRightCollapsed ? "Show Right Sidebar" : "Hide Right Sidebar"}
          >
            {sidebarRightCollapsed ? (
              <Bars3Icon className="w-4 h-4" />
            ) : (
              <XMarkIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Save */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!currentTable}
            title="Save Project (Ctrl+S)"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Edit operations */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <ArrowUturnRightIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* View operations */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            title="Zoom In (Ctrl+=)"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            title="Zoom Out (Ctrl+-)"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomToFit}
            title="Fit to Screen (Ctrl+0)"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Grid controls */}
        <div className="flex items-center gap-1">
          <Button
            variant={snapToGrid ? "primary" : "ghost"}
            size="sm"
            onClick={toggleSnapToGrid}
            title="Toggle Snap to Grid (Ctrl+Shift+S)"
          >
            Snap
          </Button>
        </div>

        <div className="flex-1" />

        {/* Autosave status */}
        <div className="flex items-center text-sm text-gray-500 mr-4">
          {fileIsDirty ? (
            <span>Unsaved changes</span>
          ) : (
            <span>{lastSavedText ?? 'Not saved yet'}</span>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* Workflow controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunWorkflow}
            title="Run Workflow (F5)"
          >
            <PlayIcon className="w-4 h-4" />
            Run
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStopWorkflow}
            title="Stop Workflow (Escape)"
          >
            <StopIcon className="w-4 h-4" />
            Stop
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            onClick={handleEmergencyStop}
            title="Emergency Stop"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            E-STOP
          </Button>
        </div>
      </div>

    </>
  )
}
