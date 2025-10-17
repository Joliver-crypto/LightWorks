// Driver selection utility for choosing the best available driver for a device
import { IDeviceFactory } from './interfaces/IDevice'

export interface DriverSelectionOptions {
  model: string
  platform: string
  drivers: Record<string, any>
}

export function pickDriver<T extends IDeviceFactory>(options: DriverSelectionOptions): T {
  const { model, platform, drivers } = options

  // Define fallback order for each platform
  const fallbackOrders: Record<string, string[]> = {
    win32: ['windows', 'macos'], // Windows -> macOS (UVC fallback)
    linux: ['linux', 'macos'],   // Linux -> macOS (UVC fallback)
    darwin: ['macos']            // macOS only
  }

  const fallbackOrder = fallbackOrders[platform] || ['macos']
  
  // Try each driver in fallback order
  for (const driverName of fallbackOrder) {
    const DriverClass = drivers[driverName]
    if (DriverClass) {
      const driver = new DriverClass()
      if (driver.isSupported()) {
        console.log(`Selected ${driverName} driver for ${model} on ${platform}`)
        return driver as T
      }
    }
  }

  // If no driver is supported, throw an error
  throw new Error(`No supported drivers found for ${model} on ${platform}`)
}

// Helper function to check if a specific driver is available
export async function checkDriverAvailability(driverName: string, platform: string): Promise<boolean> {
  try {
    // This would perform actual driver detection
    // For now, return true as a placeholder
    return true
  } catch (error) {
    console.warn(`Driver ${driverName} not available on ${platform}:`, error)
    return false
  }
}

// Helper function to get the best available driver for a device
export async function getBestDriver<T extends IDeviceFactory>(
  model: string,
  platform: string,
  drivers: Record<string, any>
): Promise<T> {
  const fallbackOrders: Record<string, string[]> = {
    win32: ['windows', 'macos'],
    linux: ['linux', 'macos'],
    darwin: ['macos']
  }

  const fallbackOrder = fallbackOrders[platform] || ['macos']
  
  // Check availability of each driver
  for (const driverName of fallbackOrder) {
    const DriverClass = drivers[driverName]
    if (DriverClass) {
      const isAvailable = await checkDriverAvailability(driverName, platform)
      if (isAvailable) {
        const driver = new DriverClass()
        if (driver.isSupported()) {
          console.log(`Selected ${driverName} driver for ${model} on ${platform}`)
          return driver as T
        }
      }
    }
  }

  throw new Error(`No available drivers found for ${model} on ${platform}`)
}
