import { ExtensionStore } from '../components/Panels/ExtensionStore'

export function Extensions() {
  return (
    <div className="h-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Extensions</h1>
          <p className="text-gray-600">Install and manage device drivers and analysis tools</p>
        </div>
        <ExtensionStore />
      </div>
    </div>
  )
}


