/**
 * DASHBOARD SCREEN - Main Home Page
 * 
 * This is the first screen users see when opening LightWorks.
 * Features the LightWorks branding with animated laser beam,
 * three main action buttons, and a list of user's existing tables.
 */

import { ButtonCard } from '../components/Common/ButtonCard'
import { TableList } from '../components/Common/TableList'
import { Modal } from '../components/Common/Modal'
import { useFileStore } from '../storage/useFileStore'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Icons for the main action buttons
const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const FolderOpenIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
)

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)

export const Dashboard = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newExperimentName, setNewExperimentName] = useState('')
  
  const { 
    experiments, 
    community, 
    isLoading: storeLoading, 
    loadTable, 
    createTable 
  } = useFileStore()

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Data will be loaded by the App component
        await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for UX
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCreateTable = () => {
    setShowCreateModal(true)
  }

  const handleCreateExperiment = async () => {
    if (!newExperimentName.trim()) return
    
    try {
      await createTable(newExperimentName.trim(), 'experiments')
      setShowCreateModal(false)
      setNewExperimentName('')
      // Navigate to editor will be handled by the table selection
    } catch (error) {
      console.error('Failed to create table:', error)
    }
  }

  const handleOpenTable = () => {
    console.log('Open existing table')
    // TODO: Implement open table functionality
  }

  const handleExploreTables = () => {
    navigate('/explore')
  }

  const handleViewAllTables = () => {
    setShowFolderModal(true)
  }

  const handleCopyPath = async () => {
    const experimentsPath = '/Users/justinoliver/LightWorks/Experiments'
    try {
      await navigator.clipboard.writeText(experimentsPath)
      // You could add a toast notification here
    } catch (error) {
      alert('Failed to copy to clipboard. Please copy manually:\n' + experimentsPath)
    }
  }

  const handleTableClick = async (table: any) => {
    try {
      await loadTable(table.id, 'experiments')
      navigate('/editor')
    } catch (error) {
      console.error('Failed to load table:', error)
    }
  }

  // Combine experiments and community tables for display
  const allTables = [
    ...experiments.map(table => ({ 
      id: table.id, 
      name: table.name, 
      lastModified: new Date(table.modifiedAt).toLocaleDateString(),
      description: 'Optical experiment setup'
    })),
    ...community.map(table => ({ 
      id: table.id, 
      name: table.name, 
      lastModified: new Date(table.modifiedAt).toLocaleDateString(),
      description: 'Community shared design'
    }))
  ].sort((a, b) => b.lastModified.localeCompare(a.lastModified))

  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <header className="flex-shrink-0 pt-8 pb-4">
        <div className="text-center relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            LightWorks
          </h1>
          
          {/* Laser Beam */}
          <div className="relative w-full h-1 mt-4">
            {/* Laser beam extending across entire screen */}
            <div className="w-full h-1">
              {/* Main laser beam */}
              <div className="h-1 bg-gradient-to-r from-transparent via-green-500 via-green-400 to-transparent rounded-full shadow-lg shadow-green-500/50 animate-pulse relative overflow-hidden">                      
                {/* Laser beam shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>                                                                                    
                {/* Laser beam particles */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/60 to-transparent animate-pulse"></div>                                                                                
              </div>
              
              {/* Laser beam glow */}
              <div className="absolute inset-0 h-3 bg-gradient-to-r from-transparent via-green-500/20 via-green-400/30 to-transparent rounded-full -top-1 blur-sm"></div>                                               
            </div>
          </div>
          
          <p className="text-gray-600 text-lg mt-6">
            Quantum Optics Portal
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Action Buttons */}
        <div className="w-full max-w-4xl mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
            <ButtonCard
              icon={<PlusIcon />}
              label="Create Table"
              description="Start a new quantum optics setup"
              onClick={handleCreateTable}
            />
            <ButtonCard
              icon={<FolderOpenIcon />}
              label="Open From File"
              description="Import table from local file"
              onClick={handleOpenTable}
            />
            <ButtonCard
              icon={<GlobeIcon />}
              label="Explore Others' Tables"
              description="Discover community creations"
              onClick={handleExploreTables}
            />
          </div>
        </div>

        {/* My Tables Section */}
        <TableList
          tables={allTables}
          onViewAll={handleViewAllTables}
          onTableClick={handleTableClick}
        />
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            LightWorks – Quantum Optics Control & Design Platform
          </p>
        </div>
      </footer>

      {/* Create Experiment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Experiment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experiment Name
            </label>
            <input
              type="text"
              value={newExperimentName}
              onChange={(e) => setNewExperimentName(e.target.value)}
              placeholder="Enter experiment name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateExperiment}
              disabled={!newExperimentName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* Folder Modal */}
      <Modal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="Open Experiments Folder"
      >
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Your experiments are stored in:</p>
          <div className="bg-gray-100 p-3 rounded border font-mono text-sm break-all">
            /Users/justinoliver/LightWorks/Experiments
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">To open this folder:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>macOS:</strong> Press Cmd+Space, type "Finder", then press Cmd+Shift+G and paste the path</li>
            <li>• <strong>Windows:</strong> Press Win+R, type the path, and press Enter</li>
            <li>• <strong>Linux:</strong> Open file manager and navigate to the path</li>
          </ul>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCopyPath}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Copy Path
          </button>
          <button
            onClick={() => setShowFolderModal(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}