import { Routes, Route } from 'react-router-dom'
import { Shell } from './components/Shell/Shell'
import { Editor } from './routes/Editor'
import { Extensions } from './routes/Extensions'
import { Workflows } from './routes/Workflows'
import { Settings } from './routes/Settings'
import { About } from './routes/About'

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Routes>
        <Route path="/" element={<Shell />}>
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


