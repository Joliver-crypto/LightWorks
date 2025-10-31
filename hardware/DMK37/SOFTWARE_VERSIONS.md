# Camera Software Versions and Compatibility

## Available Camera Software from The Imaging Source

### IC Capture 2.5 (Stable Version)
- **Latest Version**: 2.5.1557.4007 (Released May 16, 2023)
- **Features**: 
  - Full feature set including AVI recording
  - Export Device State function (XML export for IC Imaging Control)
  - Proven stable with DMK37 cameras
- **Download**: https://www.theimagingsource.com/support/download/iccapture-2.5.1525.3931/

### IC Capture 4 (Latest Unified Application)
- **Latest Version**: 4.0.1.539 (Released May 2025)
- **Features**:
  - Merges IC Capture and IC Measure into one application
  - Enhanced features and improved performance
  - Cross-platform support (Windows and Linux, x86_64 and ARM 64-bit)
  - Advanced measurement tools
- **Note**: Some differences from 2.5 (no AVI recording in 4.x)
- **Download**: Available from The Imaging Source website

## IC Imaging Control SDK (What LightWorks Uses)

### For Integration with LightWorks

**What we use**: The underlying **IC Imaging Control SDK**, not the IC Capture application itself.

**Key Points**:
- The SDK is independent of IC Capture version
- The same SDK is used by both IC Capture 2.5 and IC Capture 4
- LightWorks accesses the SDK directly via Python COM interface
- SDK version should be latest available from The Imaging Source

### SDK Compatibility

The IC Imaging Control SDK provides:
- Same functionality regardless of IC Capture version
- Direct camera control via COM interface
- GenICam property access
- Full camera feature support

## Recommendations for LightWorks Integration

### Use Latest IC Imaging Control SDK

1. **Download Latest SDK**:
   - Visit: https://www.theimagingsource.com/support/downloads/ic-imaging-control-sdk/
   - Download the latest version matching your system (32-bit or 64-bit)
   - The SDK version is separate from IC Capture application version

2. **IC Capture Application is Optional**:
   - You don't need IC Capture 2.5 or IC Capture 4 installed to use the camera in LightWorks
   - However, having IC Capture installed is useful for:
     - Testing camera connectivity
     - Verifying camera settings
     - Exporting device state configurations

### Which IC Capture Version to Use (Optional)

**For testing and verification:**
- **IC Capture 2.5** - If you need AVI recording and want proven stability
- **IC Capture 4** - If you want the latest features and cross-platform support

**For LightWorks:**
- Use the latest **IC Imaging Control SDK** (independent of IC Capture version)
- LightWorks integration works with either IC Capture version installed
- Camera control is via SDK, not through IC Capture application

## Version Compatibility Matrix

| Component | Version | Compatible with LightWorks? |
|-----------|---------|----------------------------|
| IC Imaging Control SDK | Latest | ✅ **Required** - Direct integration |
| IC Capture 2.5 | 2.5.1557.4007 | ✅ Optional - Uses same SDK |
| IC Capture 4 | 4.0.1.539 | ✅ Optional - Uses same SDK |
| IC Measure | Merged into IC Capture 4 | ✅ Not needed - SDK provides all features |

## Updating Your Installation

### To Use Latest Features

1. **Update IC Imaging Control SDK**:
   - Download latest from The Imaging Source website
   - Install over existing installation
   - LightWorks will automatically use updated SDK

2. **Optionally Update IC Capture** (for testing):
   - Can install IC Capture 4 alongside IC Capture 2.5
   - Both use same SDK, so no conflicts
   - Choose based on whether you need AVI recording (2.5) or latest features (4)

### Testing Compatibility

After installing SDK updates, test camera connection:

```python
import win32com.client
ic = win32com.client.Dispatch("IC Imaging Control.IC Imaging Control.1")
print(f"SDK Version: {ic.Version if hasattr(ic, 'Version') else 'Unknown'}")
print(f"Devices Found: {ic.Device.Count if hasattr(ic.Device, 'Count') else 'Unknown'}")
```

## Summary

**For LightWorks DMK37 Integration:**
- ✅ **Required**: Latest IC Imaging Control SDK
- ⚠️ **Optional**: IC Capture 2.5 or IC Capture 4 (for testing/verification)
- ✅ **Result**: Full camera control with same features as IC Capture software

The SDK provides direct access to all camera features, independent of which IC Capture version (if any) is installed.

