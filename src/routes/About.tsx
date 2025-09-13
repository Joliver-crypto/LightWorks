export function About() {
  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">About LightWork</h1>
          <p className="text-gray-600">Optics bench lab application</p>
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <div className="card-body">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔬</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">LightWork</h2>
                <p className="text-gray-600 mb-4">Version 0.1.0</p>
                <p className="text-gray-500">
                  A production-quality frontend for optics bench lab applications. 
                  Configure devices, manage workflows, and orchestrate experiments 
                  with an intuitive Tinkercad-style interface.
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Features</h2>
            </div>
            <div className="card-body">
              <ul className="space-y-2 text-gray-600">
                <li>• 2D top-view editor with drag-and-drop device placement</li>
                <li>• Newport-style hole grid with snap-to-grid functionality</li>
                <li>• Device status monitoring and live telemetry</li>
                <li>• Workflow automation and scripting</li>
                <li>• Extension marketplace for device drivers</li>
                <li>• Real-time collaboration and project sharing</li>
              </ul>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Technology</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Frontend</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>React 18 + TypeScript</li>
                    <li>Vite + Tailwind CSS</li>
                    <li>React-Konva (2D Canvas)</li>
                    <li>Zustand (State Management)</li>
                    <li>React Query (Data Fetching)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Backend</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>REST API + WebSocket</li>
                    <li>Device Driver Extensions</li>
                    <li>Workflow Engine</li>
                    <li>Real-time Telemetry</li>
                    <li>Project Persistence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Open Source</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-600 mb-4">
                LightWork is built with open source technologies and follows 
                modern web development best practices.
              </p>
              <div className="text-sm text-gray-500">
                <p>Built with ❤️ for the scientific community</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


