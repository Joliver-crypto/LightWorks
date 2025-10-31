# DMK37 Camera Quick Start Guide

## Easiest Integration Path: IC Capture Software Control in LightWorks

The DMK37 camera is now fully integrated with LightWorks using the **same IC Imaging Control SDK** that IC Capture 2.5 and IC Capture 4 use. This means you get all the same controls and features directly in LightWorks!

### Software Versions Available

- **IC Capture 2.5** (recommended for stability) - Latest version 2.5.1557.4007
  - Full feature set including AVI recording
  - Proven stable with DMK37 cameras
  
- **IC Capture 4** (latest unified application) - Version 4.0.1.539
  - Merges IC Capture and IC Measure into one application
  - Enhanced features and cross-platform support
  - Note: Some differences from 2.5 (no AVI recording)

**For LightWorks:** We use the underlying **IC Imaging Control SDK** which works with both versions.

## Step-by-Step Setup

### 1. Install IC Imaging Control SDK

**Download and install the SDK:**
- Visit: https://www.theimagingsource.com/support/downloads/ic-imaging-control-sdk/
- Download the latest version matching your system (32-bit or 64-bit)
- Run the installer
- **Important**: This is the same SDK used by IC Capture 2.5 and IC Capture 4, so you get identical functionality

### 2. Install Python Dependencies

```bash
pip install pywin32
```

### 3. Connect Your Camera

1. Connect your DMK37 camera via USB
2. Windows should automatically recognize it (or install the driver if prompted)
3. Verify it works in IC Capture 2.5 (optional, but recommended for testing)

### 4. Use in LightWorks

1. **Open LightWorks**
2. **Add a DMK37 camera device** to your project (drag from palette or add from menu)
3. **Select the device** in the project
4. **Open the Device Inspector** panel
5. **Click "Connect"** button
   - You'll see: "Connected via IC Imaging Control (same SDK as IC Capture 2.5)..."
6. **Configure camera settings:**
   - Exposure time (in microseconds)
   - Gain (in dB)
   - ROI (Region of Interest) if needed
   - Trigger settings if using hardware triggers
7. **Click "Start Acquisition"** to begin capturing frames
8. **View images** in the telemetry panel

## Features Available

All the same controls you have in IC Capture 2.5 are now available in LightWorks:

✅ **Exposure Control** - Set exposure time in microseconds  
✅ **Gain Control** - Adjust gain in dB  
✅ **ROI Selection** - Set region of interest  
✅ **Hardware Triggering** - Line0, Line1 trigger sources  
✅ **Software Triggering** - Trigger single frames  
✅ **Frame Acquisition** - Continuous or single frame capture  
✅ **Full Resolution** - Up to 1920x1080 at 60fps  

## Troubleshooting

### Camera Not Found

**Problem**: "DMK37 camera not found"  
**Solution**: 
- Ensure camera is connected via USB
- Check Device Manager for camera recognition
- Try opening IC Capture 2.5 first to verify camera works
- Ensure IC Imaging Control SDK is installed

### IC Imaging Control Not Available

**Problem**: "IC Imaging Control not available"  
**Solution**:
- Verify IC Imaging Control SDK is installed
- Run: `python -m win32com.client.makepy "IC Imaging Control.IC Imaging Control.1"`
- Reinstall IC Imaging Control SDK if needed

### win32com Not Available

**Problem**: "win32com not available"  
**Solution**:
```bash
pip install pywin32
```

### Multiple Cameras

If you have multiple DMK37 cameras:

```python
# In your Python script, specify serial number
camera = DMK37Controller()
camera.connect(serial="DMK37-12345")  # Use your camera's serial number
```

In LightWorks, you can bind specific devices to specific cameras via the device binding panel.

## Integration Notes

- **Same SDK as IC Capture software**: You get identical functionality to IC Capture 2.5 and IC Capture 4
- **Settings may persist**: Camera settings configured in IC Capture may be visible in LightWorks
- **Close IC Capture**: When using camera in LightWorks, close IC Capture (2.5 or 4) to avoid conflicts
- **Full feature parity**: All IC Capture features are available in LightWorks
- **SDK independent**: The IC Imaging Control SDK version is independent of IC Capture application version

## Next Steps

1. **Configure camera settings** for your experiment
2. **Set up workflows** to automate camera operations
3. **Integrate with other devices** in your optical bench setup
4. **Record and analyze** captured images

For detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md)
