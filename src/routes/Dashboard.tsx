/**
 * DASHBOARD SCREEN - Main Home Page
 * 
 * This is the first screen users see when opening LightWorks.
 * Features the LightWorks branding with animated laser beam,
 * three main action buttons, and a list of user's existing tables.
 */

import { ButtonCard } from '../components/Common/ButtonCard'
import { TableList } from '../components/Common/TableList'
import { useStorageStore } from '../storage/useStorageStore'
import { loadTableSnapshot } from '../storage/fileOperations'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

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
  const { 
    availableTables, 
    isLoading, 
    error, 
    createNewTable, 
    loadTable
  } = useStorageStore()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTable = async () => {
    try {
      setIsCreating(true)
      const tableId = await createNewTable('New Table')
      navigate(`/editor?table=${tableId}`)
    } catch (error) {
      console.error('Failed to create table:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenTable = async () => {
    try {
      const snapshot = await loadTableSnapshot()
      await loadTable(snapshot.table.id)
      navigate(`/editor?table=${snapshot.table.id}`)
    } catch (error) {
      console.error('Failed to open table:', error)
    }
  }

  const handleExploreTables = () => {
    navigate('/explore')
  }

  const handleViewAllTables = () => {
    console.log('View all tables')
    // TODO: Implement view all tables functionality
  }

  const handleTableClick = async (table: any) => {
    try {
      await loadTable(table.id)
      navigate(`/editor?table=${table.id}`)
    } catch (error) {
      console.error('Failed to open table:', error)
    }
  }

  // Format tables for display
  const formattedTables = availableTables.map(table => ({
    id: table.id,
    name: table.name,
    description: `Last modified ${new Date(table.updatedAt).toLocaleDateString()}`,
    lastModified: new Date(table.updatedAt).toLocaleTimeString()
  }))

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
              disabled={isCreating}
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
          tables={formattedTables}
          onViewAll={handleViewAllTables}
          onTableClick={handleTableClick}
          isLoading={isLoading}
          error={error}
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
    </div>
  )
}
