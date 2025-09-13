import { useState } from 'react'
import { 
  DocumentPlusIcon,
  FolderOpenIcon,
  DocumentArrowDownIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  CommandLineIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../../state/useProjectStore'
import { useUiStore } from '../../state/useUiStore'
import { Button } from '../Common/Button'
import { CommandPalette } from '../Common/CommandPalette'

export function Topbar() {
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const { project, isDirty, newProject, markClean } = useProjectStore()
  const { 
    zoomIn, 
    zoomOut, 
    zoomToFit, 
    toggleSnapToGrid, 
    snapToGrid,
    openCommandPalette,
    openSettings,
    openAbout,
    sidebarLeftCollapsed,
    sidebarRightCollapsed,
    toggleSidebarLeft,
    toggleSidebarRight
  } = useUiStore()

  const handleNewProject = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to create a new project?')) {
        newProject()
      }
    } else {
      newProject()
    }
  }

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Saving project:', project)
    markClean()
  }

  const handleOpen = async () => {
    // TODO: Implement open functionality
    console.log('Opening project')
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
        {/* File operations */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewProject}
            title="New Project (Ctrl+N)"
          >
            <DocumentPlusIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpen}
            title="Open Project (Ctrl+O)"
          >
            <FolderOpenIcon className="w-4 h-4" />
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

        <div className="w-px h-6 bg-gray-300" />

        {/* Utility buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={openCommandPalette}
            title="Command Palette (Ctrl+K)"
          >
            <CommandLineIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={openSettings}
            title="Settings"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={openAbout}
            title="About"
          >
            <InformationCircleIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
    </>
  )
}
