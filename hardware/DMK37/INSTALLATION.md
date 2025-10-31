# DMK37 Camera Installation Guide

## Windows Setup (IC Imaging Control SDK)

The DMK37 camera uses the **IC Imaging Control SDK** on Windows, which is the same SDK used by IC Capture 2.5 and IC Capture 4. This provides full access to all camera features.

### Note on Camera Software Versions

- **IC Capture 2.5** (latest: 2.5.1557.4007, May 2023) - Stable version with full feature set including AVI recording
- **IC Capture 4** (latest: 4.0.1.539, May 2025) - New unified application merging IC Capture and IC Measure
  - Enhanced features and improved performance
  - Cross-platform support (Windows and Linux)
  - Note: Some differences from 2.5 (e.g., no AVI recording in 4.x)

**For LightWorks Integration:** We use the **IC Imaging Control SDK** directly, which is compatible with both IC Capture 2.5 and IC Capture 4. The SDK version is independent of the IC Capture application version.

### Prerequisites

1. **IC Imaging Control SDK** (Required)
   - Download from: https://www.theimagingsource.com/support/downloads/ic-imaging-control-sdk/
   - Install the SDK version that matches your system (32-bit or 64-bit)
   - The SDK includes the COM interface used by IC Capture 2.5

2. **Python Windows Extensions** (Required)
   ```bash
   pip install pywin32
   ```

3. **Camera Drivers** (Required)
   - The DMK37 camera drivers are typically included with IC Imaging Control SDK
   - If not, download from: https://www.theimagingsource.com/support/downloads/

### Installation Steps

1. **Install IC Imaging Control SDK**
   - Run the SDK installer
   - Ensure it installs to the default location (usually `C:\Program Files\The Imaging Source Europe GmbH\IC Imaging Control SDK`)
   - Register the COM components during installation

2. **Install Python Dependencies**
   ```bash
   pip install pywin32
   ```

3. **Verify Installation**
   - Open IC Capture 2.5 (if installed) to verify the camera works
   - Or run a test Python script:
   ```python
   import win32com.client
   ic = win32com.client.Dispatch("IC Imaging Control.IC Imaging Control.1")
   print("IC Imaging Control installed successfully!")
   print(f"Devices: {ic.Device.Count}")
   ```

### Testing the Integration

1. **Connect your DMK37 camera** via USB

2. **Test in LightWorks**
   - Open LightWorks
   - Add a DMK37 camera device to your project
   - Click "Connect" in the device inspector
   - You should see: "Connected via IC Imaging Control (same SDK as IC Capture 2.5)..."

3. **Verify Features**
   - Try setting exposure time
   - Try setting gain
   - Try setting ROI (if supported)
   - Start acquisition to capture frames

### Troubleshooting

**Error: "IC Imaging Control not available"**
- Ensure IC Imaging Control SDK is installed
- Verify COM components are registered: Run `regsvr32` on the IC Imaging Control DLLs
- Check that you're running Python as administrator (sometimes needed for COM registration)

**Error: "win32com not available"**
- Install pywin32: `pip install pywin32`
- If using a virtual environment, ensure pywin32 is installed in that environment

**Error: "No cameras found"**
- Ensure camera is connected via USB
- Check Device Manager to see if camera is recognized
- Try opening IC Capture 2.5 first to verify camera works
- Some cameras may need the vendor driver installed separately

**Error: "Failed to create IC Imaging Control object"**
- COM object may not be registered properly
- Try running: `python -m win32com.client.makepy "IC Imaging Control.IC Imaging Control.1"`
- Reinstall IC Imaging Control SDK

**Limited Features**
- If some features don't work, check the camera's GenICam properties
- IC Imaging Control exposes camera properties via GenICam standard
- Property names may vary between camera models

### Integration with IC Capture 2.5

Since LightWorks uses the same IC Imaging Control SDK as IC Capture 2.5:

- **Settings configured in IC Capture 2.5** may be visible in LightWorks
- **Camera state** is shared between applications (if camera allows)
- **Multiple applications** can access the camera, but typically only one can control it at a time
- **Close IC Capture 2.5** when using the camera in LightWorks to avoid conflicts

### Advanced Configuration

#### Custom Property Access

If you need to access camera-specific properties not exposed by the standard interface:

```python
# Access any GenICam property
property = controller._driver.ic_imaging_control.Property("PropertyName")
value = property.Value
property.Value = new_value
```

#### Multiple Cameras

To use a specific camera by serial number:

```python
controller = DMK37Controller()
controller.connect(serial="DMK37-12345")  # Specify serial number
```

## Linux Setup (V4L2)

### Prerequisites

1. **V4L2 Support** (Built into Linux kernel)
   - Check: `ls /dev/video*`
   - Should show video devices if camera is connected

2. **Python V4L2 Bindings** (Optional, for advanced features)
   ```bash
   pip install v4l2
   ```

### Installation Steps

1. **Connect Camera** via USB

2. **Verify Device**
   ```bash
   ls -l /dev/video*
   v4l2-ctl --list-devices
   ```

3. **Test with v4l2-ctl**
   ```bash
   v4l2-ctl --device=/dev/video0 --list-formats
   ```

## macOS Setup (UVC)

### Prerequisites

1. **OpenCV** (for UVC camera access)
   ```bash
   pip install opencv-python
   ```

### Installation Steps

1. **Connect Camera** via USB

2. **Verify Device**
   - Check System Information > USB
   - Camera should appear as UVC device

3. **Note**: macOS has limited features compared to Windows/Linux
   - No ROI support
   - No hardware trigger support
   - Basic exposure/gain control only

## Development Notes

### Adding New Features

When adding new camera features:

1. **Update `device-config.json`** with new commands/telemetry
2. **Implement in `dmk37_controller.py`** platform-specific drivers
3. **Update capability matrix** in `device-config.json`
4. **Test on target platform**

### Property Name Variations

IC Imaging Control uses GenICam properties, which may have different names:
- `ExposureTime` vs `Exposure`
- `Gain` vs `Gain_dB`
- `TriggerMode` vs `Trigger`

The driver includes fallbacks for common variations.

