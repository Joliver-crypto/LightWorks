// Extensions folder - auto-loads all extensions
// Each extension file exports an ExtensionManifest

import { IC_Capture_4 } from './IC_Capture_4'
import { IC_Capture_2_5 } from './IC_Capture_2_5'
import { ExtensionManifest } from '../src/models/extensions'

// Export all extensions
export const EXTENSIONS: ExtensionManifest[] = [
  IC_Capture_4,
  IC_Capture_2_5
]
