import React, { useState, useEffect } from 'react'
import { useFileStore } from '../storage/useFileStore'
import { Button } from '../components/Common/Button'
import { Tabs } from '../components/Common/Tabs'
import { TableList } from '../components/Common/TableList'
import { Dialog } from '../components/Common/Dialog'
import { Input } from '../components/Common/Input'

const tabs = [
  { id: 'experiments', label: 'My Experiments' },
  { id: 'community', label: 'Community' }
]

export function FileDashboard() {
  const [activeTab, setActiveTab] = useState('experiments')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const {
    experiments,
    community,
    isLoading,
    error,
    loadTable,
    createTable,
    listTables,
    setCurrentFolder,
    clearError
  } = useFileStore()

  // Load tables on mount
  useEffect(() => {
    listTables('experiments')
    listTables('community')
  }, [listTables])

  // Clear error when switching tabs
  useEffect(() => {
    clearError()
  }, [activeTab, clearError])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentFolder(tabId as 'experiments' | 'community')
  }

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return
    
    try {
      await createTable(newTableName.trim(), activeTab as 'experiments' | 'community')
      setShowCreateDialog(false)
      setNewTableName('')
    } catch (error) {
      console.error('Failed to create table:', error)
    }
  }

  const handleImportTable = async () => {
    if (!importFile) return

    try {
      const content = await importFile.text()
      const data = JSON.parse(content)
      
      if (data.format !== 'lightworks') {
        throw new Error('Invalid file format')
      }

      // TODO: Implement import functionality
      console.log('Import table:', data)
      setShowImportDialog(false)
      setImportFile(null)
    } catch (error) {
      console.error('Failed to import table:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  const currentTables = activeTab === 'experiments' ? experiments : community

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-900">LightWorks Tables</h2>
            <p className="text-sm text-gray-500">
              Manage your optical experiments and explore community designs
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              Import
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              New Table
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <TableList
            tables={currentTables.map(table => ({
              id: table.id,
              name: table.name,
              modifiedAt: table.modifiedAt,
              type: 'table'
            }))}
            onTableClick={(table) => loadTable(table.id, activeTab as 'experiments' | 'community')}
          />
        )}

        {currentTables.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {activeTab === 'experiments' ? '🧪' : '🌐'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'experiments' ? 'No experiments yet' : 'No community tables'}
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'experiments' 
                ? 'Create your first optical experiment to get started'
                : 'Community tables will appear here when available'
              }
            </p>
            {activeTab === 'experiments' && (
              <Button
                variant="primary"
                onClick={() => setShowCreateDialog(true)}
              >
                Create First Table
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create Table Dialog */}
      <Dialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create New Table"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Name
            </label>
            <Input
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Enter table name..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateTable}
              disabled={!newTableName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Import Table Dialog */}
      <Dialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        title="Import Table"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowImportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImportTable}
              disabled={!importFile}
            >
              Import
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
