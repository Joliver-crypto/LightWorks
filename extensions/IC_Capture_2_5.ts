import { ExtensionManifest } from '../src/models/extensions'

export const IC_Capture_2_5: ExtensionManifest = {
  name: 'ic-capture-2.5',
  version: '2.5.1557',
  type: ['driver'],
  os: ['windows'],
  sizeMB: 120,
  badges: ['Windows-only', 'Stable', 'AVI Recording'],
  description: 'IC Capture 2.5 driver for The Imaging Source cameras with AVI recording support',
  author: 'The Imaging Source',
  license: 'Proprietary',
  entrypoint: 'IC_Capture_2_5',
  driverId: 'ic-capture-2.5',
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
