// Platform detection utilities
export type Platform = 'windows' | 'linux' | 'mac' | 'unknown'

/**
 * Detect the current operating system
 * Works in browser, Electron, and Node.js environments
 */
export function detectPlatform(): Platform {
  // Check if running in Electron
  if (typeof window !== 'undefined' && (window as any).electronAPI?.platform) {
    const electronPlatform = (window as any).electronAPI.platform
    if (electronPlatform === 'win32') return 'windows'
    if (electronPlatform === 'linux') return 'linux'
    if (electronPlatform === 'darwin') return 'mac'
  }
  
  // Check user agent (browser fallback)
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) return 'windows'
    if (userAgent.includes('linux')) return 'linux'
    if (userAgent.includes('mac') || userAgent.includes('darwin')) return 'mac'
  }
  
  // Node.js environment
  if (typeof process !== 'undefined' && process.platform) {
    if (process.platform === 'win32') return 'windows'
    if (process.platform === 'linux') return 'linux'
    if (process.platform === 'darwin') return 'mac'
  }
  
  return 'unknown'
}

/**
 * Check if an extension is compatible with the current platform
 */
export function isExtensionCompatible(extension: { os: Platform[] }, currentPlatform?: Platform): boolean {
  const platform = currentPlatform || detectPlatform()
  if (platform === 'unknown') return true // Show all if we can't detect
  return extension.os.includes(platform)
}

/**
 * Get platform display name
 */
export function getPlatformName(platform: Platform): string {
  switch (platform) {
    case 'windows': return 'Windows'
    case 'linux': return 'Linux'
    case 'mac': return 'macOS'
    default: return 'Unknown'
  }
}

/**
 * Get platform icon
 */
export function getPlatformIcon(platform: Platform): string {
  switch (platform) {
    case 'windows': return '🪟'
    case 'linux': return '🐧'
    case 'mac': return '🍎'
    default: return '💻'
  }
}

