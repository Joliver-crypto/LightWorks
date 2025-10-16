// Workflow node types
export type NodeId = string

export type NodeBlock = {
  id: NodeId
  kind: 'MoveMirror' | 'AcquireFrame' | 'AcquireSpectrum' | 'Save' | 'Loop' | 'Delay'
  params: Record<string, any>
  next?: NodeId
  position?: { x: number; y: number }
}

export type Workflow = {
  id: string
  name: string
  entry: NodeId
  nodes: Record<NodeId, NodeBlock>
  description?: string
  created: string
  modified: string
}

export type ScriptStep = {
  id: string
  name: string
  code: string // python (for display only in FE)
  description?: string
}

// Workflow execution state
export type WorkflowExecution = {
  id: string
  workflowId: string
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  currentStep?: NodeId
  startTime?: string
  endTime?: string
  logs: WorkflowLog[]
}

export type WorkflowLog = {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  nodeId?: NodeId
}

// Node type metadata
export const NODE_TYPE_METADATA: Record<NodeBlock['kind'], {
  label: string
  icon: string
  color: string
  description: string
  defaultParams: Record<string, any>
}> = {
  MoveMirror: {
    label: 'Move Mirror',
    icon: '🪞',
    color: 'bg-blue-500',
    description: 'Move a mirror to a specific angle',
    defaultParams: { deviceId: '', angle: 0 }
  },
  AcquireFrame: {
    label: 'Acquire Frame',
    icon: '📷',
    color: 'bg-green-500',
    description: 'Capture an image from a camera',
    defaultParams: { deviceId: '', exposure: 100 }
  },
  AcquireSpectrum: {
    label: 'Acquire Spectrum',
    icon: '🌈',
    color: 'bg-purple-500',
    description: 'Capture a spectrum from a spectrograph',
    defaultParams: { deviceId: '', wavelength: 500, exposure: 1000 }
  },
  Save: {
    label: 'Save Data',
    icon: '💾',
    color: 'bg-gray-500',
    description: 'Save acquired data to file',
    defaultParams: { filename: '', format: 'fits' }
  },
  Loop: {
    label: 'Loop',
    icon: '🔄',
    color: 'bg-orange-500',
    description: 'Repeat steps a number of times',
    defaultParams: { count: 1 }
  },
  Delay: {
    label: 'Delay',
    icon: '⏱️',
    color: 'bg-yellow-500',
    description: 'Wait for a specified time',
    defaultParams: { duration: 1000 }
  }
}

// Mock workflows data
export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'basic-alignment',
    name: 'Basic Mirror Alignment',
    entry: 'move1',
    description: 'Simple workflow to align a mirror and capture an image',
    created: '2024-01-15T10:00:00Z',
    modified: '2024-01-15T10:00:00Z',
    nodes: {
      move1: {
        id: 'move1',
        kind: 'MoveMirror',
        params: { deviceId: 'mirrorA', angle: 45 },
        next: 'acquire1',
        position: { x: 100, y: 100 }
      },
      acquire1: {
        id: 'acquire1',
        kind: 'AcquireFrame',
        params: { deviceId: 'cam1', exposure: 100 },
        next: 'save1',
        position: { x: 300, y: 100 }
      },
      save1: {
        id: 'save1',
        kind: 'Save',
        params: { filename: 'alignment_{timestamp}.fits', format: 'fits' },
        position: { x: 500, y: 100 }
      }
    }
  },
  {
    id: 'spectrum-scan',
    name: 'Wavelength Scan',
    entry: 'loop1',
    description: 'Scan through wavelengths and capture spectra',
    created: '2024-01-16T14:30:00Z',
    modified: '2024-01-16T14:30:00Z',
    nodes: {
      loop1: {
        id: 'loop1',
        kind: 'Loop',
        params: { count: 10 },
        next: 'acquire2',
        position: { x: 100, y: 200 }
      },
      acquire2: {
        id: 'acquire2',
        kind: 'AcquireSpectrum',
        params: { deviceId: 'sr750', wavelength: 400, exposure: 2000 },
        next: 'delay1',
        position: { x: 300, y: 200 }
      },
      delay1: {
        id: 'delay1',
        kind: 'Delay',
        params: { duration: 500 },
        next: 'save2',
        position: { x: 500, y: 200 }
      },
      save2: {
        id: 'save2',
        kind: 'Save',
        params: { filename: 'spectrum_{wavelength}_{timestamp}.fits', format: 'fits' },
        position: { x: 700, y: 200 }
      }
    }
  }
]

// Mock script steps
export const MOCK_SCRIPT_STEPS: ScriptStep[] = [
  {
    id: 'calibrate-camera',
    name: 'Camera Calibration',
    description: 'Calibrate camera gain and offset',
    code: `# Camera calibration script
import numpy as np
from lightwork.devices import Camera

def calibrate_camera(camera_id, dark_frames=10):
    """Calibrate camera using dark frames"""
    camera = Camera(camera_id)
    
    # Acquire dark frames
    dark_data = []
    for i in range(dark_frames):
        frame = camera.acquire(exposure=1000, gain=1.0)
        dark_data.append(frame)
    
    # Calculate dark frame average
    dark_avg = np.mean(dark_data, axis=0)
    
    # Save calibration data
    np.save(f'calibration_{camera_id}_dark.npy', dark_avg)
    
    return dark_avg`
  },
  {
    id: 'analyze-spectrum',
    name: 'Spectrum Analysis',
    description: 'Analyze acquired spectrum data',
    code: `# Spectrum analysis script
import numpy as np
import matplotlib.pyplot as plt
from lightwork.devices import Spectrograph

def analyze_spectrum(spectrum_data, wavelength_range):
    """Analyze spectrum and find peaks"""
    wavelengths = np.linspace(wavelength_range[0], wavelength_range[1], len(spectrum_data))
    
    # Find peaks
    from scipy.signal import find_peaks
    peaks, properties = find_peaks(spectrum_data, height=0.1)
    
    # Calculate peak properties
    peak_wavelengths = wavelengths[peaks]
    peak_intensities = spectrum_data[peaks]
    
    return {
        'wavelengths': wavelengths,
        'intensities': spectrum_data,
        'peaks': peak_wavelengths,
        'peak_intensities': peak_intensities
    }`
  }
]


