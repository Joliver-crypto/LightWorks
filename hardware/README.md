# LightWorks Hardware Control

This directory contains hardware control scripts, commands, and documentation for all devices supported by LightWorks. The system is designed to be modular and extensible, allowing easy addition of new hardware devices.

## Architecture

LightWorks uses a **dynamic device registry system** that automatically loads device configurations from the hardware folders. This means:

- ✅ **Easy to add new hardware** - Just create a folder with a `device-config.json` file
- ✅ **Self-contained devices** - Each device has its own scripts, docs, and configuration
- ✅ **No code changes needed** - New devices appear automatically in the UI
- ✅ **Modular design** - Each device is independent and can be developed separately

## Folder Structure

Each hardware device has its own subdirectory containing:

```
hardware/
├── README.md                    # This file
├── example_usage.py             # Example usage script
├── device-template/             # Template for new devices
│   ├── device-config.json       # Device configuration template
│   └── README.md                # Template documentation
└── DeviceName/                  # Individual device folders
    ├── device-config.json       # Device configuration (REQUIRED)
    ├── README.md                # Device documentation
    ├── commands/
    │   └── command_reference.md # Command documentation
    ├── documentation/
    │   └── specifications.md    # Technical specifications
    ├── drivers/                 # Device drivers and software
    └── scripts/
        ├── device_control.py    # Control library
        └── demo_script.py       # Example usage
```

## Supported Hardware

### Motion Control
- **Picomotor 8812** - Newport precision motor controller
- **Thorlabs KDC101** - Thorlabs motor controller
- **Newport ESP Stage** - Newport precision stage

### Detection
- **Andor Camera** - Scientific imaging camera
- **Generic Sensor** - Various sensor types

### Analysis
- **Andor SR-750** - Spectrograph

### Optics
- **Generic Laser** - Laser sources
- **Generic Mirror** - Beam steering mirrors
- **Generic Beam Splitter** - Power division optics

## Adding New Hardware

### Quick Start

1. **Copy the template**:
   ```bash
   cp -r hardware/device-template/ hardware/YourDeviceName/
   ```

2. **Edit the configuration**:
   - Modify `hardware/YourDeviceName/device-config.json`
   - Set the device type, name, commands, etc.

3. **Create control scripts**:
   - Implement the control library in `scripts/`
   - Add any necessary drivers

4. **Test the integration**:
   - The device will automatically appear in LightWorks
   - No code changes needed!

### Detailed Steps

1. **Create Device Folder**: `hardware/YourDeviceName/`
2. **Configure Device**: Edit `device-config.json` (see template)
3. **Implement Control**: Create Python control scripts
4. **Add Documentation**: Write README and specifications
5. **Test Integration**: Verify device appears in LightWorks UI

### Device Configuration

The `device-config.json` file defines how your device appears in LightWorks:

```json
{
  "type": "device.manufacturer.model",
  "label": "Device Name",
  "icon": "🔧",
  "color": "bg-blue-500",
  "category": "motion",
  "description": "Brief description",
  "size": { "width": 2, "height": 1 },
  "commands": [...],
  "telemetry": [...],
  "properties": [...],
  "driver": {...}
}
```

See `device-template/README.md` for detailed configuration options.

## Usage

### In LightWorks Application

Hardware control is integrated through the device inspector panel:

1. **Add Device**: Drag from device palette to optical bench
2. **Configure**: Set connection parameters in device inspector
3. **Control**: Use commands in the device inspector panel
4. **Monitor**: View telemetry data in real-time
5. **Automate**: Include in workflows for automated experiments

### Direct Hardware Control

For direct hardware control, use the scripts in each device's `scripts/` directory:

```python
from Picomotor_8812.scripts.picomotor_control import PicomotorController

controller = PicomotorController('/dev/ttyUSB0')
controller.connect()
controller.enable()
controller.move_absolute(1000)
controller.disconnect()
```

## Development

### For Device Developers

- Use the `device-template/` as a starting point
- Follow the folder structure conventions
- Include comprehensive documentation
- Test thoroughly before sharing

### For LightWorks Developers

- The device registry automatically loads all devices
- Use `deviceRegistry.getDeviceConfig(type)` to get device info
- Device types are dynamically discovered
- No hardcoded device lists needed

## Examples

See the `Picomotor_8812/` folder for a complete example of a hardware device implementation.
