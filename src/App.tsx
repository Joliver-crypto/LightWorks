import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Shell } from './components/Shell/Shell'
import { Dashboard } from './routes/Dashboard'
import { Explore } from './routes/Explore'
import { Editor } from './routes/Editor'
import { Extensions } from './routes/Extensions'
import { Workflows } from './routes/Workflows'
import { Settings } from './routes/Settings'
import { About } from './routes/About'
import { enableAutoSave } from './storage/autoSave'
import { useStorageStore } from './storage/useStorageStore'
import { ensureDatabaseReady } from './storage/database'
import './storage/test' // Run storage tests

function App() {
  const { refreshTableList, refreshStats } = useStorageStore()

  useEffect(() => {
    // Initialize storage system
    const cleanup = enableAutoSave()
    
    // Load initial data with error handling
    const initializeStorage = async () => {
      try {
        await ensureDatabaseReady()
        await refreshTableList()
        await refreshStats()
      } catch (error) {
        console.warn('Storage initialization warning:', error)
        // Don't set error state for initialization issues
      }
    }
    
    initializeStorage()
    
    return cleanup
  }, [refreshTableList, refreshStats])

  return (
    <div className="h-screen flex flex-col bg-white">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/editor" element={<Shell />}>
          <Route index element={<Editor />} />
          <Route path="extensions" element={<Extensions />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App


