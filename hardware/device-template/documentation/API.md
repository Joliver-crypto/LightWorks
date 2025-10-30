# Template Device API Documentation

## Overview

The template device controller provides a unified interface for controlling devices across Windows, Linux, and macOS platforms. The API automatically selects the best available driver and provides capability-based feature access.

## Class: TemplateController

### Constructor

```python
device = TemplateController()
```

Creates a new device controller instance. The controller automatically detects the current platform and initializes the appropriate driver.

### Connection Methods

#### `connect(identifier: Optional[str] = None) -> bool`

Connects to the device.

**Parameters:**
- `identifier` (Optional[str]): Device identifier for connection

**Returns:**
- `bool`: True if connection successful

**Raises:**
- `ConnectionError`: If connection fails

**Example:**
```python
device.connect("DEVICE-001")
```

#### `disconnect() -> bool`

Disconnects from the device.

**Returns:**
- `bool`: True if disconnection successful

**Example:**
```python
device.disconnect()
```

#### `is_connected() -> bool`

Checks if the device is connected.

**Returns:**
- `bool`: True if connected

### Device Control

#### `initialize() -> bool`

Initializes the device.

**Returns:**
- `bool`: True if initialization successful

**Raises:**
- `DeviceError`: If not connected or initialization fails

**Example:**
```python
device.initialize()
```

#### `reset() -> bool`

Resets the device to default state.

**Returns:**
- `bool`: True if reset successful

**Raises:**
- `DeviceError`: If not connected or reset fails

**Example:**
```python
device.reset()
```

#### `get_status() -> Dict[str, Any]`

Gets the device status.

**Returns:**
- `Dict[str, Any]`: Dictionary containing device status

**Raises:**
- `DeviceError`: If not connected or status retrieval fails

**Example:**
```python
status = device.get_status()
print(f"Status: {status['status']}")
```

### Device Settings

#### `set_enabled(enabled: bool) -> bool`

Enables or disables the device.

**Parameters:**
- `enabled` (bool): True to enable device

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DeviceError`: If not connected or setting fails
- `UnsupportedFeatureError`: If basic control not supported

**Example:**
```python
device.set_enabled(True)
```

#### `set_mode(mode: str) -> bool`

Sets the device mode.

**Parameters:**
- `mode` (str): Device mode ("normal", "high_performance", "low_power")

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DeviceError`: If not connected or setting fails
- `UnsupportedFeatureError`: If advanced control not supported

**Example:**
```python
device.set_mode("high_performance")
```

#### `set_timeout(timeout: float) -> bool`

Sets the device timeout.

**Parameters:**
- `timeout` (float): Timeout in seconds

**Returns:**
- `bool`: True if setting successful

**Raises:**
- `DeviceError`: If not connected or setting fails

**Example:**
```python
device.set_timeout(10.0)
```

### Capability Detection

#### `get_capabilities() -> Dict[str, Any]`

Gets the current platform capabilities.

**Returns:**
- `Dict[str, Any]`: Capability dictionary

**Example:**
```python
caps = device.get_capabilities()
print(f"OS: {caps['os']}")
print(f"Features: {caps['features']}")
```

#### `get_limits() -> Dict[str, Any]`

Gets the feature limits for the current platform.

**Returns:**
- `Dict[str, Any]`: Limits dictionary

**Example:**
```python
limits = device.get_limits()
print(f"Max value: {limits['maxValue']}")
```

#### `is_feature_supported(feature: str) -> bool`

Checks if a feature is supported on the current platform.

**Parameters:**
- `feature` (str): Feature name to check

**Returns:**
- `bool`: True if feature is supported

**Example:**
```python
if device.is_feature_supported('advancedControl'):
    device.set_mode("high_performance")
```

## Capability Matrix

| Feature | Windows | Linux | macOS |
|---------|---------|-------|-------|
| Basic Control | ✅ | ✅ | ✅ |
| Advanced Control | ✅ | ❌ | ❌ |
| Monitoring | ✅ | ✅ | ❌ |
| Configuration | ✅ | ❌ | ❌ |
| Calibration | ✅ | ❌ | ❌ |

## Error Handling

### Exception Types

#### `DeviceError`
Base exception for all device errors.

#### `ConnectionError(DeviceError)`
Raised when device connection fails.

#### `UnsupportedFeatureError(DeviceError)`
Raised when a feature is not supported on the current platform.

### Error Handling Example

```python
try:
    device.set_mode("high_performance")
except UnsupportedFeatureError:
    print("Advanced control not supported on this platform")
except DeviceError as e:
    print(f"Device error: {e}")
```

## Platform-Specific Notes

### Windows
- Uses native drivers for full feature support
- Falls back to generic drivers if native drivers not available
- Best performance and feature set

### Linux
- Uses V4L2/USB for good feature support
- Falls back to generic drivers if V4L2 not available
- Good performance with most features

### macOS
- Uses UVC/AVFoundation with limited features
- No advanced control, monitoring, or configuration
- Basic functionality only

## Complete Example

```python
from template_controller import TemplateController, DeviceError, UnsupportedFeatureError

# Create device controller
device = TemplateController()

try:
    # Connect
    device.connect("DEVICE-001")
    
    # Initialize
    device.initialize()
    
    # Configure settings
    device.set_enabled(True)
    
    # Set mode if supported
    if device.is_feature_supported('advancedControl'):
        device.set_mode("high_performance")
    
    # Set timeout
    device.set_timeout(10.0)
    
    # Get status
    status = device.get_status()
    print(f"Status: {status['status']}")
    
    # Reset device
    device.reset()
    
except UnsupportedFeatureError as e:
    print(f"Feature not supported: {e}")
except DeviceError as e:
    print(f"Device error: {e}")
finally:
    if device.is_connected():
        device.disconnect()
```

## Customization

To customize this template for your specific device:

1. **Update device-config.json**: Modify device configuration
2. **Implement device-specific methods**: Add your device's functionality
3. **Update capabilities**: Define what works on each platform
4. **Add platform-specific drivers**: Implement OS-specific code
5. **Update documentation**: Modify for your device

## Best Practices

1. **Check capabilities**: Always check if features are supported
2. **Handle errors gracefully**: Use appropriate exception handling
3. **Document limitations**: Clearly document platform limitations
4. **Test thoroughly**: Test on all target platforms
5. **Provide fallbacks**: Implement graceful degradation


