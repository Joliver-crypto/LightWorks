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
import { useFileStore } from './storage/useFileStore'

function App() {
  const { listTables } = useFileStore()

  useEffect(() => {
    // Load initial data
    const initializeStorage = async () => {
      try {
        console.log('Loading file-based tables...')
        await listTables('experiments')
        await listTables('community')
        console.log('File storage initialization complete')
      } catch (error) {
        console.error('File storage initialization failed:', error)
      }
    }
    
    initializeStorage()
  }, [listTables])

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


