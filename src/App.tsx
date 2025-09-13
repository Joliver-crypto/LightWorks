import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/Shell/Shell'
import { Dashboard } from './routes/Dashboard'
import { Editor } from './routes/Editor'
import { Extensions } from './routes/Extensions'
import { Workflows } from './routes/Workflows'
import { Settings } from './routes/Settings'
import { About } from './routes/About'

function App() {
  return (
    <div className="h-screen flex flex-col bg-white">
      <Routes>
        <Route path="/" element={<Dashboard />} />
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


