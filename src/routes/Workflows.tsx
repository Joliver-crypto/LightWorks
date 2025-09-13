import { WorkflowPanel } from '../components/Panels/WorkflowPanel'

export function Workflows() {
  return (
    <div className="h-full p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600">Create and manage automated workflows</p>
        </div>
        <WorkflowPanel />
      </div>
    </div>
  )
}


