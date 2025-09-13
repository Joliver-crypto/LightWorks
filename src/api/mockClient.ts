// Mock API client for development and testing

import { ApiClient, ApiResponse, DeviceCommandRequest, DeviceCommandResponse, TelemetryData } from './endpoints'
import { Project, DeviceBinding, SAMPLE_PROJECT } from '../models/project'
import { ExtensionManifest, MOCK_EXTENSIONS } from '../models/extensions'
import { Workflow, WorkflowExecution, MOCK_WORKFLOWS } from '../models/workflows'

// Mock data storage
let mockProject: Project = SAMPLE_PROJECT
let mockExtensions: ExtensionManifest[] = MOCK_EXTENSIONS
let mockWorkflows: Workflow[] = MOCK_WORKFLOWS
let mockExecutions: Map<string, WorkflowExecution> = new Map()

// Mock telemetry data generators
const generateTelemetryData = (_deviceId: string, type: string): any => {
  
  switch (type) {
    case 'laser.generic':
      return {
        power: Math.random() * 100,
        temperature: 20 + Math.random() * 5,
        status: Math.random() > 0.1 ? 'enabled' : 'disabled'
      }
    case 'camera.andor':
      return {
        temperature: -20 + Math.random() * 2,
        exposure_time: 100 + Math.random() * 50,
        frame_count: Math.floor(Math.random() * 1000),
        image: `data:image/png;base64,${btoa('mock-image-data')}`
      }
    case 'motor.thorlabs.kdc101':
      return {
        position: Math.random() * 100,
        velocity: Math.random() * 10,
        status: Math.random() > 0.05 ? 'moving' : 'idle'
      }
    case 'stage.newport.esp':
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        status: Math.random() > 0.05 ? 'ready' : 'error'
      }
    case 'spectrograph.andor.sr750':
      return {
        wavelength: 400 + Math.random() * 400,
        grating_position: Math.random() * 100,
        temperature: -20 + Math.random() * 2
      }
    default:
      return {
        value: Math.random() * 100,
        unit: 'V'
      }
  }
}

// Mock WebSocket connections
const mockWebSockets = new Map<string, { interval: NodeJS.Timeout; onData: (data: any) => void }>()

const createMockWebSocket = (deviceId: string, onData: (data: TelemetryData) => void) => {
  const device = mockProject.devices.find(d => d.id === deviceId)
  if (!device) return () => {}
  
  const interval = setInterval(() => {
    const telemetryData: TelemetryData = {
      deviceId,
      timestamp: new Date().toISOString(),
      data: generateTelemetryData(deviceId, device.type)
    }
    onData(telemetryData)
  }, 1000 + Math.random() * 2000) // Random interval between 1-3 seconds
  
  mockWebSockets.set(deviceId, { interval, onData })
  
  return () => {
    clearInterval(interval)
    mockWebSockets.delete(deviceId)
  }
}

// Mock API client implementation
export const mockClient: ApiClient = {
  // Project operations
  async saveProject(project: Project): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    mockProject = project
    return {
      data: { success: true },
      success: true,
      message: 'Project saved successfully'
    }
  },
  
  async loadProject(): Promise<ApiResponse<Project>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      data: mockProject,
      success: true
    }
  },
  
  async exportProject(project: Project): Promise<ApiResponse<{ url: string }>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    return {
      data: { url },
      success: true
    }
  },
  
  async importProject(data: string): Promise<ApiResponse<Project>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    try {
      const project = JSON.parse(data)
      mockProject = project
      return {
        data: project,
        success: true,
        message: 'Project imported successfully'
      }
    } catch (error) {
      return {
        data: mockProject,
        success: false,
        error: 'Invalid project data'
      }
    }
  },
  
  // Device operations
  async getDevices(): Promise<ApiResponse<DeviceBinding[]>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      data: mockProject.devices,
      success: true
    }
  },
  
  async getDevice(id: string): Promise<ApiResponse<DeviceBinding>> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const device = mockProject.devices.find(d => d.id === id)
    if (!device) {
      return {
        data: {} as DeviceBinding,
        success: false,
        error: 'Device not found'
      }
    }
    return {
      data: device,
      success: true
    }
  },
  
  async executeDeviceCommand(_id: string, _command: DeviceCommandRequest): Promise<ApiResponse<DeviceCommandResponse>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate command execution
    const success = Math.random() > 0.1 // 90% success rate
    const result = success ? { message: 'Command executed successfully' } : null
    const error = success ? undefined : 'Command failed'
    
    return {
      data: {
        success,
        result,
        error
      },
      success: true
    }
  },
  
  async getDeviceStatus(id: string): Promise<ApiResponse<{ status: 'green' | 'red' | 'gray' }>> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const device = mockProject.devices.find(d => d.id === id)
    if (!device) {
      return {
        data: { status: 'gray' },
        success: false,
        error: 'Device not found'
      }
    }
    
    // Simulate status changes
    const statuses: ('green' | 'red' | 'gray')[] = ['green', 'red', 'gray']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    return {
      data: { status: randomStatus },
      success: true
    }
  },
  
  // Extension operations
  async getExtensions(): Promise<ApiResponse<ExtensionManifest[]>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      data: mockExtensions,
      success: true
    }
  },
  
  async installExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate installation time
    const extension = mockExtensions.find(e => e.name === name)
    if (!extension) {
      return {
        data: { success: false },
        success: false,
        error: 'Extension not found'
      }
    }
    
    return {
      data: { success: true },
      success: true,
      message: `Extension ${name} installed successfully`
    }
  },
  
  async uninstallExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      data: { success: true },
      success: true,
      message: `Extension ${name} uninstalled successfully`
    }
  },
  
  async enableExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      data: { success: true },
      success: true,
      message: `Extension ${name} enabled successfully`
    }
  },
  
  async disableExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      data: { success: true },
      success: true,
      message: `Extension ${name} disabled successfully`
    }
  },
  
  // Workflow operations
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      data: mockWorkflows,
      success: true
    }
  },
  
  async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const workflow = mockWorkflows.find(w => w.id === id)
    if (!workflow) {
      return {
        data: {} as Workflow,
        success: false,
        error: 'Workflow not found'
      }
    }
    return {
      data: workflow,
      success: true
    }
  },
  
  async saveWorkflow(workflow: Workflow): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const existingIndex = mockWorkflows.findIndex(w => w.id === workflow.id)
    if (existingIndex >= 0) {
      mockWorkflows[existingIndex] = workflow
    } else {
      mockWorkflows.push(workflow)
    }
    return {
      data: { success: true },
      success: true,
      message: 'Workflow saved successfully'
    }
  },
  
  async deleteWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockWorkflows.findIndex(w => w.id === id)
    if (index >= 0) {
      mockWorkflows.splice(index, 1)
    }
    return {
      data: { success: true },
      success: true,
      message: 'Workflow deleted successfully'
    }
  },
  
  async runWorkflow(id: string): Promise<ApiResponse<{ executionId: string }>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const executionId = `exec_${id}_${Date.now()}`
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: id,
      status: 'running',
      startTime: new Date().toISOString(),
      logs: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Workflow started'
        }
      ]
    }
    
    mockExecutions.set(executionId, execution)
    
    // Simulate workflow execution
    setTimeout(() => {
      const exec = mockExecutions.get(executionId)
      if (exec) {
        exec.status = 'completed'
        exec.endTime = new Date().toISOString()
        exec.logs.push({
          id: '2',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Workflow completed successfully'
        })
      }
    }, 5000)
    
    return {
      data: { executionId },
      success: true,
      message: 'Workflow started'
    }
  },
  
  async stopWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const execution = Array.from(mockExecutions.values()).find(e => e.workflowId === id && e.status === 'running')
    if (execution) {
      execution.status = 'completed'
      execution.endTime = new Date().toISOString()
    }
    return {
      data: { success: true },
      success: true,
      message: 'Workflow stopped'
    }
  },
  
  async pauseWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const execution = Array.from(mockExecutions.values()).find(e => e.workflowId === id && e.status === 'running')
    if (execution) {
      execution.status = 'paused'
    }
    return {
      data: { success: true },
      success: true,
      message: 'Workflow paused'
    }
  },
  
  async resumeWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const execution = Array.from(mockExecutions.values()).find(e => e.workflowId === id && e.status === 'paused')
    if (execution) {
      execution.status = 'running'
    }
    return {
      data: { success: true },
      success: true,
      message: 'Workflow resumed'
    }
  },
  
  async getWorkflowStatus(id: string): Promise<ApiResponse<WorkflowExecution>> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const execution = Array.from(mockExecutions.values()).find(e => e.workflowId === id)
    if (!execution) {
      return {
        data: {} as WorkflowExecution,
        success: false,
        error: 'No execution found'
      }
    }
    return {
      data: execution,
      success: true
    }
  },
  
  async getWorkflowLogs(id: string): Promise<ApiResponse<{ logs: any[] }>> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const execution = Array.from(mockExecutions.values()).find(e => e.workflowId === id)
    return {
      data: { logs: execution?.logs || [] },
      success: true
    }
  },
  
  // WebSocket connections
  connectDeviceTelemetry(id: string, onData: (data: TelemetryData) => void) {
    return createMockWebSocket(id, onData)
  },
  
  connectWorkflowStatus(id: string, onStatus: (status: WorkflowExecution) => void) {
    // Mock workflow status updates
    const interval = setInterval(() => {
      const execution = Array.from(mockExecutions.values()).find(e => e.workflowId === id)
      if (execution) {
        onStatus(execution)
      }
    }, 2000)
    
    return () => clearInterval(interval)
  },
  
  connectSystemStatus(onStatus: (status: any) => void) {
    // Mock system status updates
    const interval = setInterval(() => {
      onStatus({
        connected: true,
        deviceCount: mockProject.devices.length,
        activeWorkflows: Array.from(mockExecutions.values()).filter(e => e.status === 'running').length,
        timestamp: new Date().toISOString()
      })
    }, 5000)
    
    return () => clearInterval(interval)
  }
}
