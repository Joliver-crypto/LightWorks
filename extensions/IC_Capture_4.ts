import { ExtensionManifest } from '../src/models/extensions'

export const IC_Capture_4: ExtensionManifest = {
  name: 'ic-capture-4',
  version: '4.0.1',
  type: ['driver'],
  os: ['windows', 'linux'], // Cross-platform support
  sizeMB: 150,
  badges: ['Cross-platform'],
  description: 'IC Capture 4 driver for The Imaging Source cameras with cross-platform support (Windows & Linux)',
  author: 'The Imaging Source',
  license: 'Proprietary',
  entrypoint: 'IC_Capture_4',
  driverId: 'ic-capture-4',
  // Hardware tags - supports DMK37 and other The Imaging Source cameras
  hardware: ['camera.dmk37', 'camera.dmk33', 'camera.dmk42', 'camera.dfk'],
  devices: [
    {
      kind: 'camera.dmk37', // Maps to DMK37 camera type
      commands: {
        connect: { args: [{ name: 'serial', type: 'string' }] },
        disconnect: { args: [] },
        start_acquisition: { args: [] },
        stop_acquisition: { args: [] },
        set_exposure: { args: [{ name: 'exposure_us', type: 'number' }] },
        set_gain: { args: [{ name: 'gain_db', type: 'number' }] },
        set_roi: { args: [
          { name: 'x', type: 'number' },
          { name: 'y', type: 'number' },
          { name: 'width', type: 'number' },
          { name: 'height', type: 'number' }
        ]},
        software_trigger: { args: [] },
        set_trigger_mode: { args: [{ name: 'enabled', type: 'boolean' }] },
        set_trigger_source: { args: [{ name: 'source', type: 'string' }] }
      },
      telemetry: ['temperature', 'exposure_time', 'frame_rate', 'gain', 'image', 'roi', 'trigger_mode']
    }
  ]
}
