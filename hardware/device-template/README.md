# Hardware Device Template

This template shows how to add a new hardware device to LightWorks.

## Folder Structure

```
hardware/
└── YourDeviceName/
    ├── device-config.json      # Device configuration (REQUIRED)
    ├── README.md               # Device documentation
    ├── commands/
    │   └── command_reference.md # Command documentation
    ├── documentation/
    │   └── specifications.md   # Technical specifications
    ├── drivers/                # Device drivers and software
    └── scripts/
        ├── device_control.py   # Control library
        └── demo_script.py      # Example usage
```

## Required Files

### 1. device-config.json (REQUIRED)

This file defines how your device appears in LightWorks. Copy from the template and modify:

```json
{
  "type": "device.manufacturer.model",
  "label": "Device Name",
  "icon": "🔧",
  "color": "bg-blue-500",
  "category": "motion",
  "description": "Brief description of the device",
  "size": { "width": 2, "height": 1 },
  "commands": [...],
  "telemetry": [...],
  "properties": [...],
  "driver": {...}
}
```

**Key Fields:**
- `type`: Unique identifier (e.g., "motor.newport.picomotor8812")
- `label`: Display name in UI
- `icon`: Emoji or icon identifier
- `color`: Tailwind CSS color class
- `category`: One of: laser, optics, detection, motion, analysis
- `size`: Device size in grid units
- `commands`: Available control commands
- `telemetry`: Data the device can provide
- `properties`: Configurable device properties
- `driver`: Python module and connection info

### 2. Control Scripts

Create Python scripts in the `scripts/` folder:

```python
# device_control.py
class DeviceController:
    def __init__(self, connection_params):
        # Initialize connection to device
        pass
    
    def enable(self):
        # Enable device
        pass
    
    def disable(self):
        # Disable device
        pass
    
    # Add other control methods
```

## Adding Your Device

1. **Create Device Folder**: `hardware/YourDeviceName/`
2. **Copy Template**: Copy `device-template/` contents
3. **Configure Device**: Edit `device-config.json`
4. **Implement Control**: Create control scripts
5. **Add Documentation**: Write README and specs
6. **Test Integration**: Verify device appears in LightWorks

## Device Categories

- **laser**: Laser sources and related equipment
- **optics**: Mirrors, lenses, beam splitters, etc.
- **detection**: Cameras, sensors, detectors
- **motion**: Motors, stages, actuators
- **analysis**: Spectrometers, analyzers, etc.

## Command Types

Commands can have these argument types:
- `string`: Text input
- `number`: Numeric input
- `boolean`: True/false toggle

## Telemetry Types

Telemetry data can be:
- `number`: Numeric values
- `string`: Text status
- `image`: Image data

## Connection Types

Supported connection types:
- `serial`: RS-232 serial communication
- `usb`: USB communication
- `ethernet`: Network communication
- `gpib`: GPIB communication

## Example: Adding a Simple Device

1. Create folder: `hardware/MyLaser/`
2. Copy template files
3. Edit `device-config.json`:
   ```json
   {
     "type": "laser.mycompany.model123",
     "label": "My Laser",
     "icon": "🔴",
     "color": "bg-red-500",
     "category": "laser",
     "description": "My company laser model 123",
     "size": { "width": 2, "height": 2 },
     "commands": [
       {
         "name": "enable",
         "label": "Enable",
         "description": "Turn on laser",
         "args": []
       }
     ],
     "telemetry": [
       {
         "name": "power",
         "label": "Power",
         "unit": "%",
         "type": "number"
       }
     ],
     "properties": [
       {
         "name": "wavelength",
         "label": "Wavelength",
         "type": "number",
         "default": 632.8
       }
     ]
   }
   ```
4. Create control script
5. Test in LightWorks

## Tips

- Use descriptive device types: `manufacturer.product.model`
- Choose appropriate icons and colors
- Keep commands simple and intuitive
- Provide good documentation
- Test thoroughly before sharing




