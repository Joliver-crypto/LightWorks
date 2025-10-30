# DMK 37BUX252 Camera

The Imaging Source DMK 37BUX252 scientific camera with cross-platform support.

## Features

- **Cross-platform support**: Windows (IC Imaging Control), Linux (V4L2), macOS (UVC)
- **Capability-driven UI**: Controls automatically adapt based on platform capabilities
- **High resolution**: Up to 1920x1080 at 60fps (Windows) or 30fps (Linux/macOS)
- **Advanced controls**: Exposure, gain, ROI, hardware/software triggering
- **Scientific imaging**: 12-bit mono support on Windows/Linux

## Platform Capabilities

| Feature | Windows | Linux | macOS |
|---------|---------|-------|-------|
| Exposure Control | ✅ | ✅ | ✅ |
| Gain Control | ✅ | ✅ | ✅ |
| ROI | ✅ | ✅ | ❌ |
| 12-bit Mono | ✅ | ❌ | ❌ |
| Hardware Trigger | ✅ | ✅ | ❌ |
| Software Trigger | ✅ | ✅ | ❌ |
| Strobe Output | ✅ | ❌ | ❌ |
| Binning | ✅ | ✅ | ❌ |
| Frame Rate | 60 fps | 30 fps | 30 fps |

## Quick Start

1. **Connect the camera** via USB
2. **Select the device** in LightWorks
3. **Click Connect** in the device inspector
4. **Configure settings** (exposure, gain, etc.)
5. **Start acquisition** to begin capturing frames

## Usage

### Basic Operation

```python
from DMK37.scripts.dmk37_controller import DMK37Controller

# Create controller
camera = DMK37Controller()

# Connect
camera.connect()

# Configure
camera.set_exposure(1000)  # 1ms exposure
camera.set_gain(0)         # 0dB gain

# Start acquisition
camera.start_acquisition()

# Get frames
frame = camera.get_frame()

# Stop acquisition
camera.stop_acquisition()
camera.disconnect()
```

### Advanced Features (Windows/Linux)

```python
# Set ROI (not available on macOS)
camera.set_roi(100, 100, 800, 600)

# Enable hardware trigger
camera.set_trigger_mode(True)
camera.set_trigger_source("Line0")

# Software trigger
camera.software_trigger()
```

## Device Configuration

The device configuration is stored in `device-config.json` and includes:

- **Commands**: Available camera operations
- **Telemetry**: Real-time data streams
- **Properties**: Configurable parameters
- **Capabilities**: Platform-specific feature matrix
- **Driver**: Connection and module information

## Troubleshooting

### Connection Issues

- **Windows**: Ensure IC Imaging Control is installed
- **Linux**: Check V4L2 support: `ls /dev/video*`
- **macOS**: Verify UVC compatibility

### Limited Features on macOS

The macOS implementation uses UVC (USB Video Class) which provides basic functionality but lacks advanced features like ROI and hardware triggering. For full functionality, use Windows or Linux.

### Performance

- **Windows**: Best performance with native IC Imaging Control
- **Linux**: Good performance with V4L2
- **macOS**: Basic performance with UVC limitations

## Development

### Adding New Features

1. Update `device-config.json` with new commands/telemetry
2. Implement in `scripts/dmk37_controller.py`
3. Add platform-specific code in OS-specific files
4. Update capability matrix for new features

### Testing

```bash
# Run tests
python -m pytest DMK37/tests/

# Test specific platform
python -m pytest DMK37/tests/test_windows.py
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

This device driver is part of the LightWorks project.





