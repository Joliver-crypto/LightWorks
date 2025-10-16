import { DeviceType } from './project'
import { deviceRegistry, DeviceConfig } from '../hardware/deviceRegistry'

// Re-export the device registry types for backward compatibility
export type { DeviceConfig as DeviceTypeInfo } from '../hardware/deviceRegistry'

// Legacy function for backward compatibility
export async function getDeviceTypeInfo(type: DeviceType): Promise<DeviceConfig | undefined> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getDeviceConfig(type)
}

// Legacy function for backward compatibility
export async function getDeviceTypesByCategory(category: DeviceConfig['category']): Promise<DeviceType[]> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getDevicesByCategory(category)
}

// Get all device types
export async function getAllDeviceTypes(): Promise<DeviceType[]> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getAllDeviceTypes()
}

// Get device configuration (new preferred method)
export async function getDeviceConfig(type: DeviceType): Promise<DeviceConfig | undefined> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getDeviceConfig(type)
}

// Get devices by category (new preferred method)
export async function getDevicesByCategory(category: DeviceConfig['category']): Promise<DeviceType[]> {
  await deviceRegistry.loadDevices()
  return deviceRegistry.getDevicesByCategory(category)
}

// Initialize the device registry
export async function initializeDeviceRegistry(): Promise<void> {
  await deviceRegistry.loadDevices()
}

// Export the registry instance for advanced usage
export { deviceRegistry }