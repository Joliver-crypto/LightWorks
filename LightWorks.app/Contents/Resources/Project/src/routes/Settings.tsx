export function Settings() {
  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure application preferences</p>
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">General</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-500">General settings coming soon...</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Canvas</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-500">Canvas settings coming soon...</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Devices</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-500">Device settings coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


