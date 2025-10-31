// Extension store for managing extension installation and status
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ExtensionManifest, ExtensionStatus, ExtensionWithStatus } from '../models/extensions'
import { MOCK_EXTENSIONS } from '../models/extensions'

interface ExtensionState {
  installedExtensions: Map<string, ExtensionStatus>
  enabledDrivers: Map<string, string> // device type -> driverId
  getExtensionStatus: (name: string) => ExtensionStatus
  installExtension: (name: string) => Promise<boolean>
  uninstallExtension: (name: string) => Promise<boolean>
  enableDriver: (deviceType: string, driverId: string) => void
  getDriverForDevice: (deviceType: string) => string | null
  getAvailableDrivers: (deviceType: string) => ExtensionManifest[]
  isExtensionInstalled: (name: string) => boolean
  getExtensionsForHardware: (hardwareType: string) => ExtensionManifest[]
}

// Check if extension is actually installed (check IC Imaging Control SDK for IC Capture extensions)
async function checkExtensionInstalled(extensionName: string): Promise<boolean> {
  if (extensionName === 'ic-capture-2.5' || extensionName === 'ic-capture-4') {
    // Check if IC Imaging Control SDK is available
    try {
      // In a real implementation, this would check via Electron backend
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // Check if IC Imaging Control is available
        const result = await (window as any).electronAPI.checkICImagingControl()
        return result.available || false
      }
      // Fallback: try to check via Python backend if available
      return false
    } catch (error) {
      console.error('Error checking extension installation:', error)
      return false
    }
  }
  return false
}

export const useExtensionStore = create<ExtensionState>()(
  persist(
    (set, get) => ({
      installedExtensions: new Map(),
      enabledDrivers: new Map(),

      getExtensionStatus: (name: string) => {
        const state = get()
        return state.installedExtensions.get(name) || 'available'
      },

      installExtension: async (name: string) => {
        set((state) => ({
          installedExtensions: new Map(state.installedExtensions).set(name, 'installing')
        }))

        try {
          // Check if extension is actually available
          const isInstalled = await checkExtensionInstalled(name)
          
          if (isInstalled || name === 'ic-capture-2.5' || name === 'ic-capture-4') {
            // For IC Capture extensions, we just mark as installed
            // The actual SDK must be installed separately by the user
            set((state) => ({
              installedExtensions: new Map(state.installedExtensions).set(name, 'installed')
            }))
            return true
          } else {
            // Simulate installation check
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Mark as installed (in real implementation, verify installation)
            set((state) => ({
              installedExtensions: new Map(state.installedExtensions).set(name, 'installed')
            }))
            return true
          }
        } catch (error) {
          console.error('Failed to install extension:', error)
          set((state) => ({
            installedExtensions: new Map(state.installedExtensions).set(name, 'error')
          }))
          return false
        }
      },

      uninstallExtension: async (name: string) => {
        set((state) => {
          const newMap = new Map(state.installedExtensions)
          newMap.delete(name)
          return { installedExtensions: newMap }
        })
        return true
      },

      enableDriver: (deviceType: string, driverId: string) => {
        set((state) => ({
          enabledDrivers: new Map(state.enabledDrivers).set(deviceType, driverId)
        }))
      },

      getDriverForDevice: (deviceType: string) => {
        const state = get()
        return state.enabledDrivers.get(deviceType) || null
      },

      getAvailableDrivers: (deviceType: string) => {
        const state = get()
        const extensions = MOCK_EXTENSIONS.filter(ext => {
          // Check if extension supports this device type
          const supportsHardware = ext.hardware?.includes(deviceType) || 
                                  ext.devices?.some(d => d.kind === deviceType)
          // Check if extension is installed
          const isInstalled = state.installedExtensions.get(ext.name) === 'installed'
          // Check if it's a driver extension
          const isDriver = ext.type.includes('driver')
          
          return supportsHardware && isInstalled && isDriver && ext.driverId
        })
        return extensions
      },

      isExtensionInstalled: (name: string) => {
        const state = get()
        return state.installedExtensions.get(name) === 'installed'
      },

      getExtensionsForHardware: (hardwareType: string) => {
        return MOCK_EXTENSIONS.filter(ext => 
          ext.hardware?.includes(hardwareType) || 
          ext.devices?.some(d => d.kind === hardwareType)
        )
      }
    }),
    {
      name: 'extension-store',
      partialize: (state) => ({
        installedExtensions: Array.from(state.installedExtensions.entries()),
        enabledDrivers: Array.from(state.enabledDrivers.entries())
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Maps
          state.installedExtensions = new Map(state.installedExtensions as any)
          state.enabledDrivers = new Map(state.enabledDrivers as any)
        }
      }
    }
  )
)

