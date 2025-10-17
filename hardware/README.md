# LightWorks Hardware Components

This directory contains all hardware device components for LightWorks, organized by device type and following a consistent structure.

## Architecture

LightWorks uses a **capability-driven architecture** where:

- **Single device package per hardware family** (e.g., `DMK37/` for cameras)
- **Cross-platform support** with automatic driver selection
- **Capability detection** that adapts UI based on platform features
- **Graceful degradation** when advanced features aren't available

## Device Structure

Each device follows this standard structure:

```
DeviceName/
├── README.md              # Device overview and usage
├── device-config.json     # Device configuration and capabilities
├── QUICK_START.md         # Quick start guide
├── CHANGELOG.md           # Version history
├── scripts/               # Python controller scripts
│   ├── __init__.py
│   ├── device_controller.py
│   ├── capabilities.py
│   └── example.py
└── documentation/         # Additional documentation
    ├── API.md
    └── TROUBLESHOOTING.md
```

## Available Devices

### Cameras
- **DMK37** - The Imaging Source DMK 37BUX252 scientific camera
  - Cross-platform support (Windows IC Imaging Control, Linux V4L2, macOS UVC)
  - Capability-driven UI that adapts to platform limitations
  - Full feature set on Windows, good features on Linux, basic on macOS

### Motors
- **Jankomotor8812** - Newport Picomotor 8812 precision motor controller
  - Arduino-based control with STEP/DIR interface
  - Corner actuator and tip/tilt control
  - Serial communication with safety features

### Template
- **device-template** - Template for creating new devices
  - Complete example implementation
  - Cross-platform capability system
  - Documentation and testing framework

## Capability System

### Platform Capabilities

| Feature | Windows | Linux | macOS |
|---------|---------|-------|-------|
| Native Drivers | ✅ | ✅ | ❌ |
| Advanced Control | ✅ | Partial | ❌ |
| Hardware Triggering | ✅ | ✅ | ❌ |
| ROI Control | ✅ | ✅ | ❌ |
| 12-bit Imaging | ✅ | ❌ | ❌ |

### Capability Detection

Devices automatically detect platform capabilities and adapt accordingly:

```python
# Check if feature is supported
if device.is_feature_supported('roi'):
    device.set_roi(100, 100, 800, 600)
else:
    print("ROI not supported on this platform")
```

### UI Adaptation

The UI automatically adapts based on device capabilities:

- **Disabled controls** for unsupported features
- **Tooltips** explaining limitations
- **Capability banners** showing what's limited and why
- **Graceful degradation** with clear user feedback

## Adding New Devices

### 1. Copy Template
```bash
cp -r device-template/ my-new-device/
cd my-new-device/
```

### 2. Update Configuration
Edit `device-config.json`:
- Change device type and metadata
- Define commands and telemetry
- Set platform capabilities
- Configure driver information

### 3. Implement Controller
Edit `scripts/device_controller.py`:
- Add device-specific methods
- Implement platform-specific drivers
- Add capability detection
- Handle errors gracefully

### 4. Test and Document
- Run example scripts
- Test on all platforms
- Update documentation
- Add to device registry

## Platform-Specific Notes

### Windows
- **Best performance** with native drivers
- **Full feature set** available
- **IC Imaging Control** for cameras
- **DirectShow** for video devices
- **Fallback to UVC** when native drivers unavailable

### Linux
- **Good performance** with V4L2/USB
- **Most features** available
- **V4L2** for video devices
- **libusb** for USB devices
- **Fallback to UVC** when V4L2 unavailable

### macOS
- **Limited features** with UVC/AVFoundation
- **Basic functionality** only
- **UVC** for most devices
- **AVFoundation** for cameras
- **No native drivers** for scientific devices

## Device Registry

Devices are registered in `hardware/deviceRegistry.ts`:

```typescript
// Add to deviceFolders array
deviceFolders = [
  'GenericLaser',
  'GenericMirror',
  'Jankomotor8812',
  'DMK37',
  'MyNewDevice'  // Add your device here
]

// Add device configuration
'MyNewDevice': {
  type: 'device.mynewdevice',
  label: 'My New Device',
  // ... configuration
}
```

## Best Practices

### Device Development
1. **Start with capabilities** - Define what works where first
2. **Graceful degradation** - Handle missing features gracefully
3. **Clear error messages** - Use descriptive error messages
4. **Comprehensive testing** - Test on all target platforms
5. **Documentation** - Keep documentation up to date

### UI Integration
1. **Capability-driven** - Use capability detection for UI
2. **Clear feedback** - Show users what's limited and why
3. **Consistent patterns** - Follow established UI patterns
4. **Accessibility** - Ensure controls are accessible

### Error Handling
1. **Specific exceptions** - Use appropriate exception types
2. **User-friendly messages** - Provide clear error messages
3. **Recovery options** - Offer ways to recover from errors
4. **Logging** - Log errors for debugging

## Troubleshooting

### Common Issues

#### Device Not Detected
- Check USB connection
- Verify driver installation
- Check device permissions
- Try different USB port

#### Connection Failed
- Ensure device not used by another application
- Check connection parameters
- Verify device is powered on
- Check driver installation

#### Limited Features
- Check platform capabilities
- Verify driver installation
- Use fallback implementations
- Check device compatibility

### Platform-Specific Issues

#### Windows
- Install native drivers (IC Imaging Control, etc.)
- Check device manager for conflicts
- Run as administrator if needed

#### Linux
- Install V4L2 utilities: `sudo apt-get install v4l-utils`
- Check device permissions: `ls -la /dev/video*`
- Install required libraries

#### macOS
- Check UVC compatibility
- Verify camera permissions
- Use compatible devices

## Support

- **Documentation**: Check device-specific README files
- **Examples**: Run example scripts for guidance
- **Testing**: Test on all target platforms
- **Issues**: Report problems in project repository

## Contributing

1. **Follow structure** - Use the device template as a guide
2. **Test thoroughly** - Test on all target platforms
3. **Document completely** - Update all documentation
4. **Follow patterns** - Use established patterns and conventions
5. **Submit PRs** - Submit pull requests for review