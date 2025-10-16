# LightWorks Hardware Architecture

## Overview

LightWorks now uses a **modular hardware system** where each device is self-contained in its own folder with all necessary configuration, scripts, and documentation.

## Key Benefits

✅ **Easy to add new hardware** - Just create a folder with `device-config.json`  
✅ **Self-contained devices** - Each device has its own scripts, docs, and config  
✅ **No code changes needed** - New devices appear automatically in the UI  
✅ **Modular design** - Each device is independent and can be developed separately  
✅ **Community friendly** - Users can easily share device configurations  

## Architecture Diagram

```
LightWorks Application
├── Device Registry (deviceRegistry.ts)
│   ├── Scans hardware/ folders
│   ├── Loads device-config.json files
│   └── Provides device information to UI
├── Device Inspector Panel
│   ├── Shows device commands
│   ├── Displays telemetry data
│   └── Manages device properties
└── Hardware Folders
    ├── Picomotor_8812/
    │   ├── device-config.json    # Device definition
    │   ├── scripts/              # Control code
    │   ├── commands/             # Documentation
    │   └── documentation/        # Specs and manuals
    ├── GenericLaser/
    │   ├── device-config.json
    │   └── ...
    └── device-template/          # Template for new devices
```

## File Structure

### Device Configuration (`device-config.json`)

Each device must have a `device-config.json` file that defines:

```json
{
  "type": "device.manufacturer.model",     // Unique identifier
  "label": "Device Name",                  // Display name
  "icon": "🔧",                           // UI icon
  "color": "bg-blue-500",                 // UI color
  "category": "motion",                   // Device category
  "description": "Brief description",      // Tooltip text
  "size": { "width": 2, "height": 1 },    // Grid size
  "commands": [...],                      // Available commands
  "telemetry": [...],                     // Data the device provides
  "properties": [...],                    // Configurable properties
  "driver": {...}                         // Control module info
}
```

### Device Categories

- **laser**: Laser sources and related equipment
- **optics**: Mirrors, lenses, beam splitters, etc.
- **detection**: Cameras, sensors, detectors
- **motion**: Motors, stages, actuators
- **analysis**: Spectrometers, analyzers, etc.

## How It Works

### 1. Device Discovery

The device registry scans the `hardware/` folder and loads all `device-config.json` files:

```typescript
// In deviceRegistry.ts
async loadDevices(): Promise<void> {
  // Scan hardware folders
  // Load device-config.json files
  // Register devices in memory
}
```

### 2. UI Integration

The UI components use the registry to get device information:

```typescript
// Get device configuration
const deviceConfig = await deviceRegistry.getDeviceConfig(deviceType)

// Get devices by category
const motionDevices = await deviceRegistry.getDevicesByCategory('motion')
```

### 3. Dynamic Loading

Devices are loaded dynamically - no hardcoded lists:

```typescript
// Old way (hardcoded)
const DEVICE_TYPES = ['laser.generic', 'motor.thorlabs.kdc101']

// New way (dynamic)
const deviceTypes = await deviceRegistry.getAllDeviceTypes()
```

## Adding a New Device

### Step 1: Create Device Folder

```bash
mkdir hardware/MyDevice
cd hardware/MyDevice
```

### Step 2: Copy Template

```bash
cp -r ../device-template/* .
```

### Step 3: Configure Device

Edit `device-config.json`:

```json
{
  "type": "motor.mycompany.model123",
  "label": "My Motor",
  "icon": "⚙️",
  "color": "bg-purple-500",
  "category": "motion",
  "description": "My company motor model 123",
  "size": { "width": 2, "height": 1 },
  "commands": [
    {
      "name": "enable",
      "label": "Enable",
      "description": "Enable motor",
      "args": []
    }
  ],
  "telemetry": [
    {
      "name": "position",
      "label": "Position",
      "unit": "mm",
      "type": "number"
    }
  ],
  "properties": [
    {
      "name": "max_velocity",
      "label": "Max Velocity",
      "type": "number",
      "default": 10.0
    }
  ]
}
```

### Step 4: Add Control Scripts

Create `scripts/device_control.py`:

```python
class DeviceController:
    def __init__(self, connection_params):
        # Initialize connection
        pass
    
    def enable(self):
        # Enable device
        pass
    
    def get_position(self):
        # Get position
        pass
```

### Step 5: Test

The device will automatically appear in LightWorks! No code changes needed.

## Migration from Old System

### Before (Hardcoded)

```typescript
// deviceTypes.ts - 400+ lines of hardcoded device info
export const DEVICE_TYPE_CATALOG = {
  'laser.generic': {
    type: 'laser.generic',
    label: 'Laser',
    // ... 50+ lines of config
  },
  'motor.thorlabs.kdc101': {
    // ... more hardcoded config
  }
  // ... 10+ more devices
}
```

### After (Dynamic)

```typescript
// deviceRegistry.ts - Dynamic loading
async loadDevices(): Promise<void> {
  // Scan hardware folders
  // Load device-config.json files
  // Register devices
}

// Each device in its own folder
hardware/
├── Picomotor_8812/
│   └── device-config.json    # 50 lines
├── GenericLaser/
│   └── device-config.json    # 30 lines
└── device-template/
    └── device-config.json    # Template
```

## Benefits

### For Developers

- **Modular**: Each device is independent
- **Maintainable**: Easy to update individual devices
- **Extensible**: Add new devices without touching core code
- **Testable**: Each device can be tested separately

### For Users

- **Easy to add hardware**: Just copy a folder and edit JSON
- **Community sharing**: Share device configurations easily
- **Self-contained**: All device info in one place
- **No recompilation**: Changes take effect immediately

### For LightWorks

- **Cleaner code**: No massive hardcoded device lists
- **Better performance**: Load only needed devices
- **Easier maintenance**: Device logic separated from core
- **Future-proof**: Easy to add new device types

## Examples

See the following folders for complete examples:

- `Picomotor_8812/` - Real hardware device with full implementation
- `GenericLaser/` - Simple example device
- `device-template/` - Template for new devices

## Future Enhancements

- **Plugin system**: Load devices from external sources
- **Device validation**: Validate device configurations
- **Auto-discovery**: Scan for devices on the network
- **Version management**: Handle device configuration versions
- **Dependency management**: Handle device dependencies




