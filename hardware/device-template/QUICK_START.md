# Device Template Quick Start

Get up and running with the device template in under 5 minutes.

## Prerequisites

- LightWorks application
- Python 3.7+ (for device scripts)
- Platform-specific drivers (if required)

## Step 1: Copy the Template

```bash
# Copy the template to your new device
cp -r device-template/ my-new-device/

# Navigate to your new device
cd my-new-device/
```

## Step 2: Update Device Configuration

Edit `device-config.json`:

```json
{
  "type": "device.mynewdevice",
  "label": "My New Device",
  "icon": "🔧",
  "color": "bg-blue-500",
  "category": "motion",
  "description": "Description of your device",
  // ... update other fields
}
```

## Step 3: Implement Controller

Edit `scripts/template_controller.py`:

```python
class MyNewDeviceController:
    def __init__(self):
        self.connected = False
    
    def connect(self, identifier=None):
        # Implement connection logic
        self.connected = True
        return True
    
    def disconnect(self):
        # Implement disconnection logic
        self.connected = False
        return True
    
    # Add your device-specific methods
    def my_device_method(self):
        pass
```

## Step 4: Define Capabilities

Edit `scripts/capabilities.py`:

```python
def get_capabilities():
    return {
        "windows": {
            "os": "Windows",
            "transport": "Native Driver",
            "features": {
                "myFeature": True,
                "advancedFeature": True
            }
        },
        "linux": {
            "os": "Linux", 
            "transport": "V4L2",
            "features": {
                "myFeature": True,
                "advancedFeature": False
            }
        },
        "macos": {
            "os": "macOS",
            "transport": "UVC",
            "features": {
                "myFeature": True,
                "advancedFeature": False
            }
        }
    }
```

## Step 5: Test Your Device

```bash
# Run the example script
python scripts/example.py

# Test capabilities
python scripts/example.py test
```

## Step 6: Update Documentation

1. Edit `README.md` with your device information
2. Update `QUICK_START.md` with device-specific instructions
3. Add any additional documentation to `documentation/`

## Step 7: Register Device

Add your device to the device registry in LightWorks:

1. Open `hardware/deviceRegistry.ts`
2. Add your device to the `deviceFolders` array
3. Add device configuration to the `deviceConfigs` object

## Common Patterns

### Basic Device Control

```python
# Connect
device.connect("DEVICE-001")

# Configure
device.set_parameter(value)

# Start operation
device.start_operation()

# Get data
data = device.get_data()

# Stop operation
device.stop_operation()

# Disconnect
device.disconnect()
```

### Capability Checking

```python
# Check if feature is supported
if device.is_feature_supported('advancedFeature'):
    device.use_advanced_feature()
else:
    print("Advanced feature not available on this platform")
```

### Error Handling

```python
try:
    device.connect()
    device.advanced_operation()
except UnsupportedFeatureError:
    print("Feature not supported on this platform")
except ConnectionError as e:
    print(f"Connection failed: {e}")
except DeviceError as e:
    print(f"Device error: {e}")
```

## Platform-Specific Implementation

### Windows
```python
class WindowsDeviceDriver:
    def connect(self):
        # Use Windows-specific API
        pass
```

### Linux
```python
class LinuxDeviceDriver:
    def connect(self):
        # Use V4L2, libusb, etc.
        pass
```

### macOS
```python
class MacOSDeviceDriver:
    def connect(self):
        # Use AVFoundation, UVC, etc.
        pass
```

## Testing Checklist

- [ ] Device connects successfully
- [ ] All commands work as expected
- [ ] Capability detection works correctly
- [ ] Error handling works properly
- [ ] Documentation is complete
- [ ] Works on all target platforms
- [ ] Integrates with device registry
- [ ] UI components work correctly

## Troubleshooting

### Device Not Detected
- Check USB connection
- Verify driver installation
- Check device permissions

### Connection Failed
- Ensure device is not used by another application
- Check connection parameters
- Verify device is powered on

### Limited Features
- Check platform capabilities
- Verify driver installation
- Use fallback implementations

## Next Steps

1. **Advanced Features**: Add more sophisticated functionality
2. **UI Integration**: Create custom UI components
3. **Data Logging**: Implement data recording
4. **Automation**: Add workflow automation
5. **Testing**: Add comprehensive test suite

## Support

- Check device documentation
- Review example implementations
- Test on all target platforms
- Report issues in project repository
