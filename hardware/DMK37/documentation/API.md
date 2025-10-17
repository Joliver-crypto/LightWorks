# DMK37 Camera API Documentation

## Overview

The DMK37 camera controller provides a unified interface for controlling The Imaging Source DMK 37BUX252 camera across Windows, Linux, and macOS platforms. The API automatically selects the best available driver and provides capability-based feature access.

## Class: DMK37Controller

### Constructor

```python
camera = DMK37Controller()
```

Creates a new camera controller instance. The controller automatically detects the current platform and initializes the appropriate driver.

### Connection Methods

#### `connect(serial: Optional[str] = None) -> bool`

Connects to the camera.

**Parameters:**
- `serial` (Optional[str]): Camera serial number for identification

**Returns:**
- `bool`: True if connection successful

**Raises:**
- `ConnectionError`: If connection fails

**Example:**
```python
camera.connect("DMK37-001")
```

#### `disconnect() -> bool`

Disconnects from the camera.

**Returns:**
- `bool`: True if disconnection successful

**Example:**
```python
camera.disconnect()
```

#### `is_connected() -> bool`

Checks if the camera is connected.

**Returns:**
- `bool`: True if connected

### Acquisition Control

#### `start_acquisition() -> bool`

Starts image acquisition.

**Returns:**
- `bool`: True if acquisition started successfully

**Raises:**
- `DMK37Error`: If not connected or acquisition fails

**Example:**
```python
camera.start_acquisition()
```

#### `stop_acquisition() -> bool`

Stops image acquisition.

**Returns:**
- `bool`: True if acquisition stopped successfully

#### `is_acquiring() -> bool`

Checks if the camera is acquiring images.

**Returns:**
- `bool`: True if acquiring

### Camera Settings

#### `set_exposure(exposure_us: int) -> bool`

Sets the exposure time.

**Parameters:**
- `exposure_us` (int): Exposure time in microseconds

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DMK37Error`: If not connected or setting fails
- `UnsupportedFeatureError`: If exposure control not supported

**Example:**
```python
camera.set_exposure(1000)  # 1ms exposure
```

#### `set_gain(gain_db: int) -> bool`

Sets the camera gain.

**Parameters:**
- `gain_db` (int): Gain in dB

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DMK37Error`: If not connected or setting fails
- `UnsupportedFeatureError`: If gain control not supported

**Example:**
```python
camera.set_gain(10)  # 10dB gain
```

#### `set_roi(x: int, y: int, width: int, height: int) -> bool`

Sets the region of interest.

**Parameters:**
- `x` (int): X coordinate
- `y` (int): Y coordinate
- `width` (int): Width
- `height` (int): Height

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DMK37Error`: If not connected or setting fails
- `UnsupportedFeatureError`: If ROI not supported

**Example:**
```python
camera.set_roi(100, 100, 800, 600)
```

### Trigger Control

#### `set_trigger_mode(enabled: bool) -> bool`

Enables or disables hardware trigger mode.

**Parameters:**
- `enabled` (bool): True to enable trigger mode

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DMK37Error`: If not connected or setting fails
- `UnsupportedFeatureError`: If hardware trigger not supported

**Example:**
```python
camera.set_trigger_mode(True)
```

#### `set_trigger_source(source: str) -> bool`

Sets the trigger source.

**Parameters:**
- `source` (str): Trigger source ("Software", "Line0", "Line1")

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DMK37Error`: If not connected or setting fails
- `UnsupportedFeatureError`: If hardware trigger not supported

**Example:**
```python
camera.set_trigger_source("Line0")
```

#### `software_trigger() -> bool`

Executes a software trigger.

**Returns:**
- `bool`: True if trigger successful

**Raises:**
- `DMK37Error`: If not connected or trigger fails
- `UnsupportedFeatureError`: If software trigger not supported

**Example:**
```python
camera.software_trigger()
```

### Frame Handling

#### `get_frame() -> Optional[bytes]`

Gets the latest frame data.

**Returns:**
- `Optional[bytes]`: Frame data as bytes, or None if no frame available

**Example:**
```python
frame = camera.get_frame()
if frame:
    print(f"Frame size: {len(frame)} bytes")
```

#### `on_frame(callback: Callable[[bytes], None])`

Registers a frame callback function.

**Parameters:**
- `callback` (Callable[[bytes], None]): Function to call when new frame arrives

**Example:**
```python
def frame_callback(frame_data):
    print(f"New frame: {len(frame_data)} bytes")

camera.on_frame(frame_callback)
```

#### `off_frame(callback: Callable[[bytes], None])`

Unregisters a frame callback function.

**Parameters:**
- `callback` (Callable[[bytes], None]): Function to unregister

### Capability Detection

#### `get_capabilities() -> Dict[str, Any]`

Gets the current platform capabilities.

**Returns:**
- `Dict[str, Any]`: Capability dictionary

**Example:**
```python
caps = camera.get_capabilities()
print(f"OS: {caps['os']}")
print(f"Features: {caps['features']}")
```

#### `get_limits() -> Dict[str, Any]`

Gets the feature limits for the current platform.

**Returns:**
- `Dict[str, Any]`: Limits dictionary

**Example:**
```python
limits = camera.get_limits()
print(f"Max exposure: {limits['maxExposure']}μs")
```

#### `is_feature_supported(feature: str) -> bool`

Checks if a feature is supported on the current platform.

**Parameters:**
- `feature` (str): Feature name to check

**Returns:**
- `bool`: True if feature is supported

**Example:**
```python
if camera.is_feature_supported('roi'):
    camera.set_roi(100, 100, 800, 600)
```

## Capability Matrix

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

## Error Handling

### Exception Types

#### `DMK37Error`
Base exception for all DMK37 camera errors.

#### `ConnectionError(DMK37Error)`
Raised when camera connection fails.

#### `UnsupportedFeatureError(DMK37Error)`
Raised when a feature is not supported on the current platform.

### Error Handling Example

```python
try:
    camera.set_roi(100, 100, 800, 600)
except UnsupportedFeatureError:
    print("ROI not supported on this platform")
except DMK37Error as e:
    print(f"Camera error: {e}")
```

## Platform-Specific Notes

### Windows
- Uses IC Imaging Control for full feature support
- Falls back to UVC if IC Imaging Control not available
- Best performance and feature set

### Linux
- Uses V4L2 for good feature support
- Falls back to UVC if V4L2 not available
- Good performance with most features

### macOS
- Uses UVC (USB Video Class) with limited features
- No ROI, hardware trigger, or 12-bit support
- Basic functionality only

## Complete Example

```python
from dmk37_controller import DMK37Controller, DMK37Error, UnsupportedFeatureError

# Create camera controller
camera = DMK37Controller()

try:
    # Connect
    camera.connect("DMK37-001")
    
    # Configure settings
    camera.set_exposure(1000)
    camera.set_gain(10)
    
    # Set ROI if supported
    if camera.is_feature_supported('roi'):
        camera.set_roi(100, 100, 800, 600)
    
    # Start acquisition
    camera.start_acquisition()
    
    # Capture frames
    for i in range(10):
        frame = camera.get_frame()
        if frame:
            print(f"Frame {i}: {len(frame)} bytes")
    
    # Stop acquisition
    camera.stop_acquisition()
    
except UnsupportedFeatureError as e:
    print(f"Feature not supported: {e}")
except DMK37Error as e:
    print(f"Camera error: {e}")
finally:
    if camera.is_connected():
        camera.disconnect()
```
