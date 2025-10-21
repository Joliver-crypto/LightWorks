# DMK 37BUX252 Quick Start Guide

Get up and running with the DMK 37BUX252 camera in under 5 minutes.

## Prerequisites

- DMK 37BUX252 camera connected via USB
- LightWorks application running
- Platform-specific drivers (see below)

## Platform Setup

### Windows
1. Install [IC Imaging Control](https://www.theimagingsource.com/support/downloads/)
2. Restart LightWorks
3. Camera should be detected automatically

### Linux
1. Install V4L2 utilities: `sudo apt-get install v4l-utils`
2. Check camera detection: `ls /dev/video*`
3. Camera should appear as `/dev/video0`

### macOS
1. No additional drivers needed (UVC support built-in)
2. Camera should be detected automatically
3. Note: Limited features available (see capabilities table)

## Step-by-Step Setup

### 1. Connect Camera
- Connect DMK 37BUX252 via USB
- Wait for system to recognize device
- Check device manager (Windows) or system info (Linux/macOS)

### 2. Open LightWorks
- Launch LightWorks application
- Create new project or open existing one

### 3. Add Camera to Project
- Drag camera from device palette to workbench
- Camera appears as 📷 icon

### 4. Configure Camera
- Select camera device
- Open device inspector panel
- Click "Connect" button
- Status should show "Connected"

### 5. Basic Configuration
- **Exposure**: Start with 1000μs (1ms)
- **Gain**: Start with 0dB
- **Resolution**: Use 1920x1080 for best quality
- **Frame Rate**: 30fps (60fps on Windows)

### 6. Start Acquisition
- Click "Start Acquisition" button
- Camera begins capturing frames
- View live feed in image display

## Common Settings

### For Bright Objects
- Exposure: 100-500μs
- Gain: 0-10dB
- Frame Rate: 30-60fps

### For Dim Objects
- Exposure: 1000-10000μs
- Gain: 10-50dB
- Frame Rate: 10-30fps

### For High Speed
- Exposure: 100-1000μs
- Gain: 0-20dB
- Frame Rate: 60fps (Windows only)

## Troubleshooting

### Camera Not Detected
- Check USB connection
- Try different USB port
- Restart LightWorks
- Check platform-specific drivers

### Connection Failed
- Ensure camera is not used by another application
- Check USB cable
- Verify driver installation
- Try different USB port

### Poor Image Quality
- Increase exposure time
- Adjust gain settings
- Check lighting conditions
- Verify focus

### Limited Features on macOS
- ROI not available (UVC limitation)
- Hardware trigger not supported
- Use Windows/Linux for full features

## Next Steps

- Explore advanced features in device inspector
- Set up automated workflows
- Configure data logging
- Integrate with other devices

## Support

- Check [README.md](README.md) for detailed documentation
- See [CHANGELOG.md](CHANGELOG.md) for updates
- Report issues in LightWorks project repository


