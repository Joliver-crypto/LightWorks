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
import { useProjectStore } from '../../state/useProjectStore'
import { useUiStore } from '../../state/useUiStore'
import { useFileStore } from '../../storage/useFileStore'
import { Button } from '../Common/Button'
import { useNavigate } from 'react-router-dom'

export function Topbar() {
  const navigate = useNavigate()
  const { project, isDirty, markClean } = useProjectStore()
  const { isDirty: fileIsDirty } = useFileStore()
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

  const handleHome = () => {
    navigate('/')
  }

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Saving project:', project)
    markClean()
  }

  // const handleExport = async () => {
  //   // TODO: Implement export functionality
  //   console.log('Exporting project')
  // }

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log('Undo')
  }

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log('Redo')
  }

  const handleRunWorkflow = () => {
    // TODO: Implement workflow run
    console.log('Run workflow')
  }

  const handleStopWorkflow = () => {
    // TODO: Implement workflow stop
    console.log('Stop workflow')
  }

  const handleEmergencyStop = () => {
    // TODO: Implement emergency stop
    console.log('EMERGENCY STOP')
  }

  return (
    <>
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
        {/* Home button */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            title="Home (Ctrl+H)"
          >
            <HomeIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty}
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

        <div className="w-px h-6 bg-gray-300" />

        {/* Sidebar controls */}
        <div className="flex items-center gap-1">
          <Button
            variant={sidebarLeftCollapsed ? "ghost" : "secondary"}
            size="sm"
            onClick={toggleSidebarLeft}
            title="Toggle Left Sidebar (Ctrl+B)"
          >
            {sidebarLeftCollapsed ? <Bars3Icon className="w-4 h-4" /> : <XMarkIcon className="w-4 h-4" />}
          </Button>
          
          <Button
            variant={sidebarRightCollapsed ? "ghost" : "secondary"}
            size="sm"
            onClick={toggleSidebarRight}
            title="Toggle Right Sidebar (Ctrl+Shift+B)"
          >
            {sidebarRightCollapsed ? <Bars3Icon className="w-4 h-4" /> : <XMarkIcon className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex-1" />

        {/* Autosave status */}
        <div className="flex items-center text-sm text-gray-500 mr-4">
          {fileIsDirty ? (
            <span>Unsaved changes</span>
          ) : (
            <span>Not saved yet</span>
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
