import { useState } from 'react'
import { MOCK_WORKFLOWS, MOCK_SCRIPT_STEPS } from '../../models/workflows'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
import { Tabs } from '../Common/Tabs'

const tabs = [
  { id: 'workflows', label: 'Workflows' },
  { id: 'scripts', label: 'Scripts' },
]

export function WorkflowPanel() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null)

  const handleRunWorkflow = async (workflowId: string) => {
    setRunningWorkflow(workflowId)
    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 5000))
    setRunningWorkflow(null)
  }

  const renderWorkflows = () => (
    <div className="space-y-4">
      {MOCK_WORKFLOWS.map((workflow) => (
        <div key={workflow.id} className="card">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-2">
                  {workflow.name}
                </h3>
                
                {workflow.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {workflow.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="info">
                    {Object.keys(workflow.nodes).length} steps
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Created {new Date(workflow.created).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Workflow preview */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {Object.values(workflow.nodes).map((node, index) => (
                    <div key={node.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <span>{node.kind}</span>
                      {index < Object.values(workflow.nodes).length - 1 && (
                        <span>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleRunWorkflow(workflow.id)}
                  disabled={runningWorkflow === workflow.id}
                >
                  {runningWorkflow === workflow.id ? 'Running...' : 'Run'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderScripts = () => (
    <div className="space-y-4">
      {MOCK_SCRIPT_STEPS.map((script) => (
        <div key={script.id} className="card">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-2">
                  {script.name}
                </h3>
                
                {script.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {script.description}
                  </p>
                )}
                
                <Badge variant="info">Python Script</Badge>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {}} // TODO: Implement script editing
                >
                  Edit
                </Button>
              </div>
            </div>
            
            {/* Code preview */}
            <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                <code>{script.code.split('\n').slice(0, 10).join('\n')}</code>
                {script.code.split('\n').length > 10 && (
                  <div className="text-gray-500">...</div>
                )}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-gray-900">Workflows & Scripts</h2>
            <p className="text-sm text-gray-500">Manage automated workflows and scripts</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {}} // TODO: Implement new workflow creation
          >
            New Workflow
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'workflows' && renderWorkflows()}
        {activeTab === 'scripts' && renderScripts()}
      </div>
    </div>
  )
}


