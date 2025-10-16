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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newExperimentName, setNewExperimentName] = useState('')
  const [tableRows, setTableRows] = useState(10)
  const [tableCols, setTableCols] = useState(10)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  
  const { 
    experiments, 
    isLoading: storeLoading, 
    loadTable,
    listTables
  } = useFileStore()

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Only load user's experiments, not community files
        await listTables('experiments')
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 100))
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [listTables])

  const handleCreateTable = () => {
    setShowCreateModal(true)
  }

  const validateInputs = () => {
    const errors: {[key: string]: string} = {}
    
    if (!newExperimentName.trim()) {
      errors.name = 'Please enter an experiment name'
    } else {
      // Check for duplicate file names in experiments
      const sanitizedName = newExperimentName.trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
      
      const fileName = `${sanitizedName}.lightworks`
      const existingFile = experiments.find(exp => {
        const existingFileName = exp.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        return `${existingFileName}.lightworks` === fileName
      })
      
      if (existingFile) {
        errors.name = 'A table with this name already exists. Please choose a different name.'
      }
    }
    
    if (tableRows < 1 || !Number.isInteger(tableRows)) {
      errors.rows = 'Please enter a valid number of rows (minimum 1)'
    }
    
    if (tableCols < 1 || !Number.isInteger(tableCols)) {
      errors.cols = 'Please enter a valid number of columns (minimum 1)'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateExperiment = async () => {
    if (!validateInputs()) return
    
    try {
      const name = newExperimentName.trim()
      const config = {
        rows: tableRows,
        cols: tableCols,
        holePitchMm: 25,
        devices: []
      }

      if (!window.api) {
        throw new Error('window.api is not available. Make sure the preload script is loaded correctly.');
      }

      const { filePath } = await window.api.createExperiment(name, config)
      
      setShowCreateModal(false)
      setNewExperimentName('')
      setTableRows(10)
      setTableCols(10)
      setValidationErrors({})
      
      // Navigate to editor with the new table
      navigate(`/editor?file=${encodeURIComponent(filePath)}`)
    } catch (error) {
      console.error('Failed to create table:', error)
    }
  }

  const handleOpenTable = async () => {
    try {
      // Get the home directory from Electron API
      const homeDir = await window.electronAPI.getHomeDir()
      const downloadsPath = homeDir + '/Downloads'
      
      const result = await window.electronAPI.showOpenDialog({
        defaultPath: downloadsPath,
        filters: [
          { name: 'LightWorks Files', extensions: ['lightworks'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      })
      
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        const filePath = result.filePaths[0]
        // Navigate to editor with the file path
        navigate(`/editor?file=${encodeURIComponent(filePath)}`)
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error)
    }
  }

  const handleExploreTables = () => {
    navigate('/explore')
  }

  const handleViewAllTables = async () => {
    try {
      await window.api.openExperimentsFolder()
    } catch (error) {
      console.error('Failed to open experiments folder:', error)
    }
  }


  const handleTableClick = async (table: any) => {
    try {
      await loadTable(table.id, 'experiments')
      navigate(`/editor?tableId=${encodeURIComponent(table.id)}`)
    } catch (error) {
      console.error('Failed to load table:', error)
    }
  }

  // Only show user's experiments, not community files
  const allTables = experiments.map(table => ({ 
    id: table.id, 
    name: table.name, // Display name without .lightworks extension
    lastModified: new Date(table.modifiedAt).toLocaleDateString(),
    description: 'Optical experiment setup'
  })).sort((a, b) => b.lastModified.localeCompare(a.lastModified))

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
              description="Open LightWorks file from Downloads or anywhere"
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
        title="Create New Table"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Name
            </label>
            <input
              type="text"
              value={newExperimentName}
              onChange={(e) => setNewExperimentName(e.target.value)}
              placeholder="Enter table name..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              autoFocus
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rows (Holes)
              </label>
              <input
                type="number"
                min="1"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.rows ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.rows && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.rows}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Columns (Holes)
              </label>
              <input
                type="number"
                min="1"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  validationErrors.cols ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.cols && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.cols}</p>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <p><strong>Table Preview:</strong> {tableRows} rows × {tableCols} columns</p>
            <p className="text-xs mt-1">Hole pitch: 25mm (standard optical table spacing)</p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowCreateModal(false)
                setValidationErrors({})
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateExperiment}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Create Table
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}