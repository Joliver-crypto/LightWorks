// API endpoint definitions and types

import { Project, DeviceBinding } from '../models/project'
import { ExtensionManifest } from '../models/extensions'
import { Workflow, WorkflowExecution } from '../models/workflows'

// Base API response type
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// Device command request
export interface DeviceCommandRequest {
  command: string
  args?: Record<string, any>
}

// Device command response
export interface DeviceCommandResponse {
  success: boolean
  result?: any
  error?: string
}

// Telemetry data
export interface TelemetryData {
  deviceId: string
  timestamp: string
  data: Record<string, any>
}

// API endpoints
export const API_ENDPOINTS = {
  // Project endpoints
  PROJECT: {
    SAVE: '/api/project/save',
    LOAD: '/api/project/load',
    EXPORT: '/api/project/export',
    IMPORT: '/api/project/import'
  },
  
  // Device endpoints
  DEVICES: {
    LIST: '/api/devices',
    GET: (id: string) => `/api/devices/${id}`,
    COMMAND: (id: string) => `/api/devices/${id}/command`,
    STATUS: (id: string) => `/api/devices/${id}/status`,
    TELEMETRY: (id: string) => `/api/devices/${id}/telemetry`
  },
  
  // Extension endpoints
  EXTENSIONS: {
    LIST: '/api/extensions',
    INSTALL: '/api/extensions/install',
    UNINSTALL: '/api/extensions/uninstall',
    ENABLE: '/api/extensions/enable',
    DISABLE: '/api/extensions/disable',
    UPDATE: '/api/extensions/update'
  },
  
  // Workflow endpoints
  WORKFLOWS: {
    LIST: '/api/workflows',
    GET: (id: string) => `/api/workflows/${id}`,
    SAVE: '/api/workflows/save',
    DELETE: (id: string) => `/api/workflows/${id}`,
    RUN: (id: string) => `/api/workflows/${id}/run`,
    STOP: (id: string) => `/api/workflows/${id}/stop`,
    PAUSE: (id: string) => `/api/workflows/${id}/pause`,
    RESUME: (id: string) => `/api/workflows/${id}/resume`,
    STATUS: (id: string) => `/api/workflows/${id}/status`,
    LOGS: (id: string) => `/api/workflows/${id}/logs`
  },
  
  // WebSocket endpoints
  WS: {
    DEVICE_TELEMETRY: (id: string) => `/ws/devices/${id}`,
    WORKFLOW_STATUS: (id: string) => `/ws/workflows/${id}`,
    SYSTEM_STATUS: '/ws/system'
  }
} as const

// API client interface
export interface ApiClient {
  // Project operations
  saveProject: (project: Project) => Promise<ApiResponse<{ success: boolean }>>
  loadProject: () => Promise<ApiResponse<Project>>
  exportProject: (project: Project) => Promise<ApiResponse<{ url: string }>>
  importProject: (data: string) => Promise<ApiResponse<Project>>
  
  // Device operations
  getDevices: () => Promise<ApiResponse<DeviceBinding[]>>
  getDevice: (id: string) => Promise<ApiResponse<DeviceBinding>>
  executeDeviceCommand: (id: string, command: DeviceCommandRequest) => Promise<ApiResponse<DeviceCommandResponse>>
  getDeviceStatus: (id: string) => Promise<ApiResponse<{ status: 'green' | 'red' | 'gray' }>>
  
  // Extension operations
  getExtensions: () => Promise<ApiResponse<ExtensionManifest[]>>
  installExtension: (name: string) => Promise<ApiResponse<{ success: boolean }>>
  uninstallExtension: (name: string) => Promise<ApiResponse<{ success: boolean }>>
  enableExtension: (name: string) => Promise<ApiResponse<{ success: boolean }>>
  disableExtension: (name: string) => Promise<ApiResponse<{ success: boolean }>>
  
  // Workflow operations
  getWorkflows: () => Promise<ApiResponse<Workflow[]>>
  getWorkflow: (id: string) => Promise<ApiResponse<Workflow>>
  saveWorkflow: (workflow: Workflow) => Promise<ApiResponse<{ success: boolean }>>
  deleteWorkflow: (id: string) => Promise<ApiResponse<{ success: boolean }>>
  runWorkflow: (id: string) => Promise<ApiResponse<{ executionId: string }>>
  stopWorkflow: (id: string) => Promise<ApiResponse<{ success: boolean }>>
  pauseWorkflow: (id: string) => Promise<ApiResponse<{ success: boolean }>>
  resumeWorkflow: (id: string) => Promise<ApiResponse<{ success: boolean }>>
  getWorkflowStatus: (id: string) => Promise<ApiResponse<WorkflowExecution>>
  getWorkflowLogs: (id: string) => Promise<ApiResponse<{ logs: any[] }>>
  
  // WebSocket connections
  connectDeviceTelemetry: (id: string, onData: (data: TelemetryData) => void) => () => void
  connectWorkflowStatus: (id: string, onStatus: (status: WorkflowExecution) => void) => () => void
  connectSystemStatus: (onStatus: (status: any) => void) => () => void
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const


