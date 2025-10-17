# Device Template

This is a template for creating new device packages in the LightWorks hardware folder structure.

## Structure

```
device-template/
├── README.md              # This file
├── device-config.json     # Device configuration and capabilities
├── QUICK_START.md         # Quick start guide
├── CHANGELOG.md           # Version history
├── scripts/               # Python controller scripts
│   ├── __init__.py
│   ├── template_controller.py
│   ├── capabilities.py
│   └── example.py
└── documentation/         # Additional documentation
    ├── API.md
    └── TROUBLESHOOTING.md
```

## Usage

1. **Copy the template**: Copy this entire folder and rename it to your device (e.g., `camera.newmodel`)
2. **Update device-config.json**: Modify the device configuration with your device's specifications
3. **Implement controller**: Fill in the Python controller in `scripts/template_controller.py`
4. **Define capabilities**: Update `scripts/capabilities.py` with your device's feature matrix
5. **Add documentation**: Update README.md and other documentation files
6. **Test**: Run the example script to verify functionality
7. **Register device**: Add your device to the device registry

## Device Configuration

The `device-config.json` file contains all the device metadata:

### Basic Information
- `type`: Unique device type identifier (e.g., "camera.dmk37")
- `label`: Human-readable device name
- `icon`: Emoji icon for the device
- `color`: Tailwind CSS color class
- `category`: Device category (laser, optics, detection, motion, analysis)
- `description`: Device description
- `size`: Device size on the workbench grid

### Commands
Define all available device operations:
```json
{
  "name": "command_name",
  "label": "Command Label",
  "description": "Command description",
  "args": [
    {
      "name": "arg_name",
      "type": "string|number|boolean",
      "required": true|false,
      "default": "default_value"
    }
  ]
}
```

### Telemetry
Define real-time data streams:
```json
{
  "name": "data_name",
  "label": "Data Label",
  "unit": "unit_symbol",
  "type": "number|string|image"
}
```

### Properties
Define configurable device parameters:
```json
{
  "name": "prop_name",
  "label": "Property Label",
  "type": "string|number|boolean|select",
  "default": "default_value",
  "options": ["option1", "option2"]
}
```

### Driver Configuration
Specify the Python module and class:
```json
{
  "module": "DeviceName.scripts.device_controller",
  "class": "DeviceController",
  "connection": {
    "type": "usb|serial|ethernet",
    "port": "auto|specific_port",
    "timeout": 1.0
  }
}
```

### Capabilities
Define platform-specific feature support:
```json
{
  "windows": {
    "os": "Windows",
    "transport": "Native Driver",
    "features": {
      "feature1": true,
      "feature2": false
    },
    "limits": {
      "maxValue": 100,
      "minValue": 0
    }
  }
}
```

## Python Controller

The main controller class should inherit from a base device class and implement:

### Required Methods
- `connect(identifier)`: Connect to device
- `disconnect()`: Disconnect from device
- `is_connected()`: Check connection status
- `get_capabilities()`: Get platform capabilities
- `get_model()`: Get device model
- `get_serial()`: Get device serial number
- `get_firmware_version()`: Get firmware version

### Device-Specific Methods
Add methods for your device's specific functionality:
- Control operations
- Configuration settings
- Data acquisition
- Status monitoring

### Error Handling
Use appropriate exception types:
- `DeviceError`: Base exception
- `ConnectionError`: Connection failures
- `UnsupportedFeatureError`: Unsupported features

## Capability Detection

Implement capability detection in `scripts/capabilities.py`:

1. **Static capabilities**: Define what works on each platform
2. **Runtime detection**: Check for actual driver availability
3. **Fallback handling**: Gracefully degrade when drivers aren't available
4. **Feature checking**: Provide functions to check feature support

## Platform-Specific Notes

### Windows
- Use native drivers when available
- Fall back to generic drivers if needed
- Check for driver installation at runtime

### Linux
- Prefer V4L2 for video devices
- Use libusb for USB devices
- Check for kernel modules and libraries

### macOS
- Use AVFoundation for cameras
- UVC often the only option for scientific devices
- Check for framework availability

## Testing

Create comprehensive tests:

1. **Unit tests**: Test individual methods
2. **Integration tests**: Test with device registry
3. **Platform tests**: Test on each target platform
4. **Capability tests**: Verify capability detection

## Documentation

Update all documentation files:

1. **README.md**: Device overview and usage
2. **QUICK_START.md**: Step-by-step setup guide
3. **CHANGELOG.md**: Version history
4. **API.md**: Complete API documentation
5. **TROUBLESHOOTING.md**: Common issues and solutions

## Integration

1. **Device Registry**: Add your device to the registry
2. **UI Components**: Create capability-driven UI components
3. **Commands**: Implement device-specific commands
4. **Telemetry**: Set up real-time data streams

## Best Practices

1. **Start with capabilities**: Define what works where first
2. **Graceful degradation**: Handle missing features gracefully
3. **Clear error messages**: Use descriptive error messages
4. **Comprehensive testing**: Test on all target platforms
5. **Documentation**: Keep documentation up to date
6. **Version control**: Use semantic versioning
7. **Backward compatibility**: Maintain compatibility when possible

## Example: Creating a New Motor

1. Copy `device-template/` to `motor.newmodel/`
2. Update `device-config.json`:
   - Change type to "motor.newmodel"
   - Add motor-specific commands (move, home, etc.)
   - Add motor telemetry (position, velocity, etc.)
   - Define motor capabilities
3. Implement `scripts/motor_controller.py`:
   - Add motor control methods
   - Implement platform-specific drivers
   - Add capability detection
4. Update documentation
5. Test on all platforms
6. Add to device registry

This template provides a solid foundation for creating new device packages that integrate seamlessly with the LightWorks capability-driven architecture.