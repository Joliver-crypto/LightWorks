// Real API client for production backend

import { ApiClient, ApiResponse, DeviceCommandRequest, DeviceCommandResponse, TelemetryData, ApiError } from './endpoints'
import { Project, DeviceBinding } from '../models/project'
import { ExtensionManifest } from '../models/extensions'
import { Workflow, WorkflowExecution } from '../models/workflows'

// Get backend URL from environment
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000'

// HTTP client helper
async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.code
    )
  }
  
  const data = await response.json()
  return data
}

// WebSocket connection helper
function createWebSocketConnection<T>(
  endpoint: string,
  onMessage: (data: T) => void,
  onError?: (error: Event) => void,
  onClose?: (event: CloseEvent) => void
): () => void {
  const wsUrl = `${BACKEND_URL.replace('http', 'ws')}${endpoint}`
  const ws = new WebSocket(wsUrl)
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    onError?.(error)
  }
  
  ws.onclose = (event) => {
    console.log('WebSocket closed:', event)
    onClose?.(event)
  }
  
  return () => {
    ws.close()
  }
}

// Real API client implementation
export const apiClient: ApiClient = {
  // Project operations
  async saveProject(project: Project): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>('/api/project/save', {
      method: 'POST',
      body: JSON.stringify(project),
    })
  },
  
  async loadProject(): Promise<ApiResponse<Project>> {
    return httpRequest<Project>('/api/project/load', {
      method: 'GET',
    })
  },
  
  async exportProject(project: Project): Promise<ApiResponse<{ url: string }>> {
    const response = await httpRequest<{ url: string }>('/api/project/export', {
      method: 'POST',
      body: JSON.stringify(project),
    })
    return response
  },
  
  async importProject(data: string): Promise<ApiResponse<Project>> {
    return httpRequest<Project>('/api/project/import', {
      method: 'POST',
      body: JSON.stringify({ data }),
    })
  },
  
  // Device operations
  async getDevices(): Promise<ApiResponse<DeviceBinding[]>> {
    return httpRequest<DeviceBinding[]>('/api/devices', {
      method: 'GET',
    })
  },
  
  async getDevice(id: string): Promise<ApiResponse<DeviceBinding>> {
    return httpRequest<DeviceBinding>(`/api/devices/${id}`, {
      method: 'GET',
    })
  },
  
  async executeDeviceCommand(id: string, command: DeviceCommandRequest): Promise<ApiResponse<DeviceCommandResponse>> {
    return httpRequest<DeviceCommandResponse>(`/api/devices/${id}/command`, {
      method: 'POST',
      body: JSON.stringify(command),
    })
  },
  
  async getDeviceStatus(id: string): Promise<ApiResponse<{ status: 'green' | 'red' | 'gray' }>> {
    return httpRequest<{ status: 'green' | 'red' | 'gray' }>(`/api/devices/${id}/status`, {
      method: 'GET',
    })
  },
  
  // Extension operations
  async getExtensions(): Promise<ApiResponse<ExtensionManifest[]>> {
    return httpRequest<ExtensionManifest[]>('/api/extensions', {
      method: 'GET',
    })
  },
  
  async installExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>('/api/extensions/install', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },
  
  async uninstallExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>('/api/extensions/uninstall', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },
  
  async enableExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>('/api/extensions/enable', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },
  
  async disableExtension(name: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>('/api/extensions/disable', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },
  
  // Workflow operations
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return httpRequest<Workflow[]>('/api/workflows', {
      method: 'GET',
    })
  },
  
  async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    return httpRequest<Workflow>(`/api/workflows/${id}`, {
      method: 'GET',
    })
  },
  
  async saveWorkflow(workflow: Workflow): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>('/api/workflows/save', {
      method: 'POST',
      body: JSON.stringify(workflow),
    })
  },
  
  async deleteWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>(`/api/workflows/${id}`, {
      method: 'DELETE',
    })
  },
  
  async runWorkflow(id: string): Promise<ApiResponse<{ executionId: string }>> {
    return httpRequest<{ executionId: string }>(`/api/workflows/${id}/run`, {
      method: 'POST',
    })
  },
  
  async stopWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>(`/api/workflows/${id}/stop`, {
      method: 'POST',
    })
  },
  
  async pauseWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>(`/api/workflows/${id}/pause`, {
      method: 'POST',
    })
  },
  
  async resumeWorkflow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return httpRequest<{ success: boolean }>(`/api/workflows/${id}/resume`, {
      method: 'POST',
    })
  },
  
  async getWorkflowStatus(id: string): Promise<ApiResponse<WorkflowExecution>> {
    return httpRequest<WorkflowExecution>(`/api/workflows/${id}/status`, {
      method: 'GET',
    })
  },
  
  async getWorkflowLogs(id: string): Promise<ApiResponse<{ logs: any[] }>> {
    return httpRequest<{ logs: any[] }>(`/api/workflows/${id}/logs`, {
      method: 'GET',
    })
  },
  
  // WebSocket connections
  connectDeviceTelemetry(id: string, onData: (data: TelemetryData) => void) {
    return createWebSocketConnection<TelemetryData>(
      `/ws/devices/${id}`,
      onData,
      (error) => console.error('Device telemetry WebSocket error:', error),
      (event) => console.log('Device telemetry WebSocket closed:', event)
    )
  },
  
  connectWorkflowStatus(id: string, onStatus: (status: WorkflowExecution) => void) {
    return createWebSocketConnection<WorkflowExecution>(
      `/ws/workflows/${id}`,
      onStatus,
      (error) => console.error('Workflow status WebSocket error:', error),
      (event) => console.log('Workflow status WebSocket closed:', event)
    )
  },
  
  connectSystemStatus(onStatus: (status: any) => void) {
    return createWebSocketConnection<any>(
      '/ws/system',
      onStatus,
      (error) => console.error('System status WebSocket error:', error),
      (event) => console.log('System status WebSocket closed:', event)
    )
  }
}

// Export the appropriate client based on environment
export const client = (import.meta as any).env?.VITE_USE_MOCK_API === 'true' 
  ? (await import('./mockClient')).mockClient 
  : apiClient
