"""
DMK37 Camera Controller

Main controller class for DMK 37BUX252 camera with cross-platform support.
Automatically selects the best available driver for the current platform.
"""

import platform
import time
from typing import Optional, Callable, Dict, Any, Tuple
from .capabilities import get_capabilities, is_feature_supported, get_feature_limits

class DMK37Error(Exception):
    """Base exception for DMK37 camera errors"""
    pass

class UnsupportedFeatureError(DMK37Error):
    """Raised when a feature is not supported on current platform"""
    pass

class ConnectionError(DMK37Error):
    """Raised when camera connection fails"""
    pass

class DMK37Controller:
    """
    DMK37 Camera Controller
    
    Provides cross-platform camera control with automatic driver selection
    and capability-based feature availability.
    """
    
    def __init__(self):
        self.connected = False
        self.acquiring = False
        self.model = "DMK 37BUX252"
        self.serial = ""
        self.firmware_version = "1.0.0"
        
        # Get platform capabilities
        self.capabilities = get_capabilities()
        self.limits = self.capabilities.get('limits', {})
        
        # Current settings
        self.exposure = 1000  # microseconds
        self.gain = 0  # dB
        self.roi = (0, 0, 1920, 1080)  # x, y, width, height
        self.trigger_mode = False
        self.trigger_source = "Software"
        
        # Frame callbacks
        self.frame_callbacks = []
        
        # Platform-specific driver
        self._driver = None
        self._init_driver()
    
    def _init_driver(self):
        """Initialize platform-specific driver"""
        current_platform = platform.system().lower()
        
        if current_platform == 'windows':
            self._driver = WindowsDMK37Driver()
        elif current_platform == 'linux':
            self._driver = LinuxDMK37Driver()
        elif current_platform == 'darwin':
            self._driver = MacOSDMK37Driver()
        else:
            raise DMK37Error(f"Unsupported platform: {current_platform}")
    
    def connect(self, serial: Optional[str] = None) -> bool:
        """
        Connect to camera
        
        Args:
            serial: Optional camera serial number
            
        Returns:
            True if connection successful
            
        Raises:
            ConnectionError: If connection fails
        """
        try:
            success = self._driver.connect(serial)
            if success:
                self.connected = True
                self.serial = serial or "DMK37-001"
                print(f"Connected to {self.model} (Serial: {self.serial})")
                print(f"Platform: {self.capabilities['os']} ({self.capabilities['transport']})")
                
                # Show limited features
                limited_features = [f for f, supported in self.capabilities['features'].items() if not supported]
                if limited_features:
                    print(f"Limited features: {', '.join(limited_features)}")
            return success
        except Exception as e:
            raise ConnectionError(f"Failed to connect: {e}")
    
    def disconnect(self) -> bool:
        """
        Disconnect from camera
        
        Returns:
            True if disconnection successful
        """
        if self.acquiring:
            self.stop_acquisition()
        
        success = self._driver.disconnect()
        if success:
            self.connected = False
            print("Disconnected from camera")
        return success
    
    def is_connected(self) -> bool:
        """Check if camera is connected"""
        return self.connected and self._driver.is_connected()
    
    def start_acquisition(self) -> bool:
        """
        Start image acquisition
        
        Returns:
            True if acquisition started successfully
            
        Raises:
            DMK37Error: If not connected or acquisition fails
        """
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Configure camera settings
            self._driver.set_exposure(self.exposure)
            self._driver.set_gain(self.gain)
            
            if is_feature_supported('roi'):
                self._driver.set_roi(*self.roi)
            
            if is_feature_supported('hardwareTrigger'):
                self._driver.set_trigger_mode(self.trigger_mode)
                if self.trigger_mode:
                    self._driver.set_trigger_source(self.trigger_source)
            
            # Start acquisition
            success = self._driver.start_acquisition()
            if success:
                self.acquiring = True
                print("Acquisition started")
            return success
        except Exception as e:
            raise DMK37Error(f"Failed to start acquisition: {e}")
    
    def stop_acquisition(self) -> bool:
        """
        Stop image acquisition
        
        Returns:
            True if acquisition stopped successfully
        """
        success = self._driver.stop_acquisition()
        if success:
            self.acquiring = False
            print("Acquisition stopped")
        return success
    
    def is_acquiring(self) -> bool:
        """Check if camera is acquiring"""
        return self.acquiring and self._driver.is_acquiring()
    
    def set_exposure(self, exposure_us: int) -> bool:
        """
        Set exposure time
        
        Args:
            exposure_us: Exposure time in microseconds
            
        Returns:
            True if setting successful
            
        Raises:
            DMK37Error: If not connected or setting fails
            UnsupportedFeatureError: If exposure control not supported
        """
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        if not is_feature_supported('exposure'):
            raise UnsupportedFeatureError("Exposure control not supported on this platform")
        
        # Check limits
        min_exp = self.limits.get('minExposure', 1)
        max_exp = self.limits.get('maxExposure', 1000000)
        
        if exposure_us < min_exp or exposure_us > max_exp:
            raise DMK37Error(f"Exposure must be between {min_exp} and {max_exp} microseconds")
        
        success = self._driver.set_exposure(exposure_us)
        if success:
            self.exposure = exposure_us
            print(f"Exposure set to {exposure_us}μs")
        return success
    
    def set_gain(self, gain_db: int) -> bool:
        """
        Set camera gain
        
        Args:
            gain_db: Gain in dB
            
        Returns:
            True if setting successful
            
        Raises:
            DMK37Error: If not connected or setting fails
            UnsupportedFeatureError: If gain control not supported
        """
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        if not is_feature_supported('gain'):
            raise UnsupportedFeatureError("Gain control not supported on this platform")
        
        # Check limits
        min_gain = self.limits.get('minGain', 0)
        max_gain = self.limits.get('maxGain', 100)
        
        if gain_db < min_gain or gain_db > max_gain:
            raise DMK37Error(f"Gain must be between {min_gain} and {max_gain} dB")
        
        success = self._driver.set_gain(gain_db)
        if success:
            self.gain = gain_db
            print(f"Gain set to {gain_db}dB")
        return success
    
    def set_roi(self, x: int, y: int, width: int, height: int) -> bool:
        """
        Set region of interest
        
        Args:
            x: X coordinate
            y: Y coordinate  
            width: Width
            height: Height
            
        Returns:
            True if setting successful
            
        Raises:
            DMK37Error: If not connected or setting fails
            UnsupportedFeatureError: If ROI not supported
        """
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        if not is_feature_supported('roi'):
            raise UnsupportedFeatureError("ROI not supported on this platform")
        
        # Check limits
        max_width = self.limits.get('maxWidth', 1920)
        max_height = self.limits.get('maxHeight', 1080)
        
        if width > max_width or height > max_height:
            raise DMK37Error(f"ROI size must not exceed {max_width}x{max_height}")
        
        success = self._driver.set_roi(x, y, width, height)
        if success:
            self.roi = (x, y, width, height)
            print(f"ROI set to {x},{y} {width}x{height}")
        return success
    
    def set_trigger_mode(self, enabled: bool) -> bool:
        """
        Enable/disable hardware trigger mode
        
        Args:
            enabled: True to enable trigger mode
            
        Returns:
            True if setting successful
            
        Raises:
            DMK37Error: If not connected or setting fails
            UnsupportedFeatureError: If hardware trigger not supported
        """
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        if not is_feature_supported('hardwareTrigger'):
            raise UnsupportedFeatureError("Hardware trigger not supported on this platform")
        
        success = self._driver.set_trigger_mode(enabled)
        if success:
            self.trigger_mode = enabled
            print(f"Trigger mode {'enabled' if enabled else 'disabled'}")
        return success
    
    def set_trigger_source(self, source: str) -> bool:
        """
        Set trigger source
        
        Args:
            source: Trigger source ("Software", "Line0", "Line1")
            
        Returns:
            True if setting successful
            
        Raises:
            DMK37Error: If not connected or setting fails
            UnsupportedFeatureError: If hardware trigger not supported
        """
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        if not is_feature_supported('hardwareTrigger'):
            raise UnsupportedFeatureError("Hardware trigger not supported on this platform")
        
        if source not in ["Software", "Line0", "Line1"]:
            raise DMK37Error("Invalid trigger source")
        
        success = self._driver.set_trigger_source(source)
        if success:
            self.trigger_source = source
            print(f"Trigger source set to {source}")
        return success
    
    def software_trigger(self) -> bool:
        """
        Execute software trigger
        
        Returns:
            True if trigger successful
            
        Raises:
            DMK37Error: If not connected or trigger fails
            UnsupportedFeatureError: If software trigger not supported
        """
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        if not is_feature_supported('softwareTrigger'):
            raise UnsupportedFeatureError("Software trigger not supported on this platform")
        
        success = self._driver.software_trigger()
        if success:
            print("Software trigger executed")
        return success
    
    def get_frame(self) -> Optional[bytes]:
        """
        Get latest frame data
        
        Returns:
            Frame data as bytes, or None if no frame available
        """
        if not self.connected or not self.acquiring:
            return None
        
        return self._driver.get_frame()
    
    def on_frame(self, callback: Callable[[bytes], None]):
        """Register frame callback"""
        self.frame_callbacks.append(callback)
    
    def off_frame(self, callback: Callable[[bytes], None]):
        """Unregister frame callback"""
        if callback in self.frame_callbacks:
            self.frame_callbacks.remove(callback)
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get current platform capabilities"""
        return self.capabilities.copy()
    
    def get_limits(self) -> Dict[str, Any]:
        """Get feature limits for current platform"""
        return self.limits.copy()
    
    def is_feature_supported(self, feature: str) -> bool:
        """Check if feature is supported on current platform"""
        return is_feature_supported(feature)


# Platform-specific driver implementations

class WindowsDMK37Driver:
    """Windows driver using IC Imaging Control SDK (same as IC Capture 2.5)"""
    
    def __init__(self):
        self.connected = False
        self.acquiring = False
        self.ic_imaging_control = None
        self.device = None
        self.sink = None
        self._frame_data = None
        self._frame_lock = False
        
        # Try to import IC Imaging Control
        try:
            import win32com.client
            self.win32com = win32com.client
            self.ic_available = True
        except ImportError:
            print("Warning: win32com not available. Install pywin32: pip install pywin32")
            self.ic_available = False
            self.win32com = None
    
    def _get_ic_control(self):
        """Get IC Imaging Control COM object"""
        if not self.ic_available or not self.win32com:
            raise DMK37Error("IC Imaging Control not available. Install IC Imaging Control SDK and pywin32.")
        
        try:
            return self.win32com.Dispatch("IC Imaging Control.IC Imaging Control.1")
        except Exception as e:
            raise ConnectionError(f"Failed to create IC Imaging Control object: {e}")
    
    def _find_camera(self, serial: Optional[str] = None):
        """Find DMK37 camera by serial number or first available"""
        if not self.ic_imaging_control:
            return None
        
        try:
            # Get device list - IC Imaging Control uses DeviceManager
            try:
                # Try DeviceManager property (newer API)
                device_manager = self.ic_imaging_control.DeviceManager
                device_count = device_manager.DeviceCount
                
                if device_count == 0:
                    raise ConnectionError("No cameras found")
                
                # Search for DMK37 or match serial
                for i in range(device_count):
                    device = device_manager.GetDevice(i)
                    device_name = device.Name
                    
                    # Check if it's a DMK37
                    if "DMK37" in device_name.upper() or "37BUX252" in device_name.upper():
                        if serial:
                            # Try to match serial number if provided
                            device_serial = getattr(device, 'SerialNumber', getattr(device, 'Serial', ''))
                            if device_serial == serial:
                                return device_name  # Return device name to use
                        else:
                            # Use first DMK37 found
                            return device_name
                
                # If no DMK37 found, use first device
                if device_count > 0:
                    first_device = device_manager.GetDevice(0)
                    print(f"Warning: DMK37 not found, using device: {first_device.Name}")
                    return first_device.Name
                
            except AttributeError:
                # Fallback to older API - direct Device property
                device_list = self.ic_imaging_control.Device
                if hasattr(device_list, 'Count'):
                    device_count = device_list.Count
                elif hasattr(device_list, '__len__'):
                    device_count = len(device_list)
                else:
                    # Try to get count differently
                    device_count = 0
                    try:
                        while True:
                            device_list.GetItem(device_count)
                            device_count += 1
                    except:
                        pass
                
                if device_count == 0:
                    raise ConnectionError("No cameras found")
                
                # Search for DMK37
                for i in range(device_count):
                    try:
                        device_info = device_list.GetItem(i)
                        device_name = device_info.Name if hasattr(device_info, 'Name') else str(device_info)
                        
                        # Check if it's a DMK37
                        if "DMK37" in device_name.upper() or "37BUX252" in device_name.upper():
                            return device_name  # Return device name
                    except:
                        continue
                
                # Use first device
                if device_count > 0:
                    first_device = device_list.GetItem(0)
                    device_name = first_device.Name if hasattr(first_device, 'Name') else str(first_device)
                    print(f"Warning: DMK37 not found, using device: {device_name}")
                    return device_name
            
            return None
            
        except Exception as e:
            raise ConnectionError(f"Failed to find camera: {e}")
    
    def connect(self, serial: Optional[str] = None) -> bool:
        """Connect to camera using IC Imaging Control"""
        try:
            print("Connecting via IC Imaging Control (same SDK as IC Capture 2.5)...")
            
            # Get IC Imaging Control object
            self.ic_imaging_control = self._get_ic_control()
            
            # Find camera
            device_name = self._find_camera(serial)
            if device_name is None:
                raise ConnectionError("DMK37 camera not found")
            
            # Set device by name
            self.ic_imaging_control.Device = device_name
            
            # Wait for device to be ready
            import time
            time.sleep(0.5)
            
            # Configure sink for image acquisition
            self.sink = self.win32com.Dispatch("IC Imaging Control.IC Sink.1")
            self.sink.SinkType = 2  # Memory buffer sink
            self.ic_imaging_control.Sink = self.sink
            
            # Set up frame ready callback
            try:
                # Register callback for frame ready event
                self.ic_imaging_control.FrameReadyCallback = self._on_frame_ready
            except:
                # Some versions may not support callbacks directly
                pass
            
            self.connected = True
            print(f"Connected to DMK37 camera: {self.ic_imaging_control.Device}")
            return True
            
        except Exception as e:
            raise ConnectionError(f"Failed to connect: {e}")
    
    def disconnect(self) -> bool:
        """Disconnect from camera"""
        try:
            if self.acquiring:
                self.stop_acquisition()
            
            if self.ic_imaging_control:
                try:
                    self.ic_imaging_control.Device = None
                except:
                    pass
                self.ic_imaging_control = None
            
            if self.sink:
                self.sink = None
            
            self.device = None
            self.connected = False
            return True
        except Exception as e:
            print(f"Error during disconnect: {e}")
            return False
    
    def is_connected(self) -> bool:
        """Check if camera is connected"""
        if not self.connected or not self.ic_imaging_control:
            return False
        try:
            # Verify device is still available
            device_name = self.ic_imaging_control.Device
            return device_name is not None and device_name != ""
        except:
            return False
    
    def start_acquisition(self) -> bool:
        """Start image acquisition"""
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Live mode
            self.ic_imaging_control.LiveCaptureContinuous = True
            self.ic_imaging_control.LiveCaptureStart()
            self.acquiring = True
            return True
        except Exception as e:
            raise DMK37Error(f"Failed to start acquisition: {e}")
    
    def stop_acquisition(self) -> bool:
        """Stop image acquisition"""
        try:
            if self.ic_imaging_control:
                self.ic_imaging_control.LiveCaptureStop()
            self.acquiring = False
            return True
        except Exception as e:
            print(f"Error stopping acquisition: {e}")
            return False
    
    def is_acquiring(self) -> bool:
        """Check if camera is acquiring"""
        if not self.connected:
            return False
        try:
            return self.acquiring and self.ic_imaging_control.LiveCaptureActive
        except:
            return self.acquiring
    
    def set_exposure(self, exposure_us: int) -> bool:
        """Set exposure time in microseconds"""
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Convert microseconds to milliseconds for IC Imaging Control
            exposure_ms = exposure_us / 1000.0
            
            # Set exposure using IC Imaging Control properties
            # IC Imaging Control uses milliseconds and property names vary by camera
            try:
                # Try direct property access (GenICam)
                self.ic_imaging_control.Property("ExposureTime").Value = exposure_ms
            except:
                # Fallback to older property names
                try:
                    self.ic_imaging_control.Property("Exposure").Value = exposure_ms
                except:
                    # Try exposure time in microseconds
                    self.ic_imaging_control.Property("ExposureTime").Value = exposure_us
            
            return True
        except Exception as e:
            raise DMK37Error(f"Failed to set exposure: {e}")
    
    def set_gain(self, gain_db: int) -> bool:
        """Set camera gain in dB"""
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Set gain using IC Imaging Control properties
            try:
                self.ic_imaging_control.Property("Gain").Value = gain_db
            except:
                # Try Gain_dB if available
                try:
                    self.ic_imaging_control.Property("Gain_dB").Value = gain_db
                except:
                    # Some cameras use Gain in units, not dB
                    raise DMK37Error("Gain control not available on this camera")
            
            return True
        except Exception as e:
            raise DMK37Error(f"Failed to set gain: {e}")
    
    def set_roi(self, x: int, y: int, width: int, height: int) -> bool:
        """Set region of interest"""
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Stop acquisition if running
            was_acquiring = self.is_acquiring()
            if was_acquiring:
                self.stop_acquisition()
            
            # Set ROI using IC Imaging Control properties
            try:
                # GenICam standard properties
                self.ic_imaging_control.Property("OffsetX").Value = x
                self.ic_imaging_control.Property("OffsetY").Value = y
                self.ic_imaging_control.Property("Width").Value = width
                self.ic_imaging_control.Property("Height").Value = height
            except:
                # Try alternative property names
                try:
                    self.ic_imaging_control.Property("ROI_X").Value = x
                    self.ic_imaging_control.Property("ROI_Y").Value = y
                    self.ic_imaging_control.Property("ROI_Width").Value = width
                    self.ic_imaging_control.Property("ROI_Height").Value = height
                except Exception as e:
                    raise DMK37Error(f"ROI control not available: {e}")
            
            # Restart acquisition if it was running
            if was_acquiring:
                self.start_acquisition()
            
            return True
        except Exception as e:
            raise DMK37Error(f"Failed to set ROI: {e}")
    
    def set_trigger_mode(self, enabled: bool) -> bool:
        """Enable/disable hardware trigger mode"""
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Set trigger mode using IC Imaging Control
            try:
                if enabled:
                    # Enable hardware trigger
                    self.ic_imaging_control.Property("TriggerMode").Value = "On"
                else:
                    # Disable (free run)
                    self.ic_imaging_control.Property("TriggerMode").Value = "Off"
            except:
                # Try alternative property names
                try:
                    self.ic_imaging_control.Property("Trigger").Value = "On" if enabled else "Off"
                except Exception as e:
                    raise DMK37Error(f"Trigger control not available: {e}")
            
            return True
        except Exception as e:
            raise DMK37Error(f"Failed to set trigger mode: {e}")
    
    def set_trigger_source(self, source: str) -> bool:
        """Set trigger source (Software, Line0, Line1)"""
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Map source names to IC Imaging Control values
            source_map = {
                "Software": "Software",
                "Line0": "Line0",
                "Line1": "Line1"
            }
            
            ic_source = source_map.get(source, source)
            
            # Set trigger source
            try:
                self.ic_imaging_control.Property("TriggerSource").Value = ic_source
            except:
                # Try Trigger_Source
                try:
                    self.ic_imaging_control.Property("Trigger_Source").Value = ic_source
                except Exception as e:
                    raise DMK37Error(f"Trigger source control not available: {e}")
            
            return True
        except Exception as e:
            raise DMK37Error(f"Failed to set trigger source: {e}")
    
    def software_trigger(self) -> bool:
        """Execute software trigger"""
        if not self.connected:
            raise DMK37Error("Camera not connected")
        
        try:
            # Send software trigger
            try:
                self.ic_imaging_control.Property("TriggerSoftware").Execute()
            except:
                # Try alternative method
                try:
                    self.ic_imaging_control.Property("SoftwareTrigger").Execute()
                except:
                    # Try direct command
                    self.ic_imaging_control.Command("TriggerSoftware")
            
            return True
        except Exception as e:
            raise DMK37Error(f"Failed to execute software trigger: {e}")
    
    def _on_frame_ready(self):
        """Callback for frame ready event"""
        try:
            # Get frame from sink
            if self.sink:
                image = self.sink.SnapImage(-1)  # -1 = wait indefinitely
                if image:
                    # Convert to bytes
                    width = image.ImageWidth
                    height = image.ImageHeight
                    # Get image data as array
                    # Note: IC Imaging Control returns image data in various formats
                    # This is a simplified version
                    self._frame_data = image.ImageBuffer
        except Exception as e:
            print(f"Error in frame ready callback: {e}")
    
    def get_frame(self) -> Optional[bytes]:
        """Get latest frame data"""
        if not self.connected or not self.acquiring:
            return None
        
        try:
            if not self.sink:
                return None
            
            # Snap image (non-blocking with timeout)
            image = self.sink.SnapImage(100)  # 100ms timeout
            if not image:
                return None
            
            # Get image buffer
            buffer = image.ImageBuffer
            if buffer:
                # Convert to bytes
                # Note: Format depends on pixel format
                # This is a simplified conversion
                if hasattr(buffer, 'toByteArray'):
                    return buffer.toByteArray()
                elif hasattr(buffer, 'tobytes'):
                    return buffer.tobytes()
                else:
                    # Try to convert array to bytes
                    import array
                    return array.array('B', buffer).tobytes()
            
            return None
            
        except Exception as e:
            print(f"Error getting frame: {e}")
            return None


class LinuxDMK37Driver:
    """Linux driver using V4L2"""
    
    def __init__(self):
        self.connected = False
        self.acquiring = False
    
    def connect(self, serial: Optional[str]) -> bool:
        print("Connecting via V4L2...")
        # Simulate connection
        self.connected = True
        return True
    
    def disconnect(self) -> bool:
        self.connected = False
        return True
    
    def is_connected(self) -> bool:
        return self.connected
    
    def start_acquisition(self) -> bool:
        self.acquiring = True
        return True
    
    def stop_acquisition(self) -> bool:
        self.acquiring = False
        return True
    
    def is_acquiring(self) -> bool:
        return self.acquiring
    
    def set_exposure(self, exposure_us: int) -> bool:
        print(f"Setting exposure to {exposure_us}μs (V4L2)")
        return True
    
    def set_gain(self, gain_db: int) -> bool:
        print(f"Setting gain to {gain_db}dB (V4L2)")
        return True
    
    def set_roi(self, x: int, y: int, width: int, height: int) -> bool:
        print(f"Setting ROI to {x},{y} {width}x{height} (V4L2)")
        return True
    
    def set_trigger_mode(self, enabled: bool) -> bool:
        print(f"Setting trigger mode: {enabled} (V4L2)")
        return True
    
    def set_trigger_source(self, source: str) -> bool:
        print(f"Setting trigger source to {source} (V4L2)")
        return True
    
    def software_trigger(self) -> bool:
        print("Software trigger (V4L2)")
        return True
    
    def get_frame(self) -> Optional[bytes]:
        # Simulate frame data
        return b"mock_frame_data"


class MacOSDMK37Driver:
    """macOS driver using UVC (limited features)"""
    
    def __init__(self):
        self.connected = False
        self.acquiring = False
    
    def connect(self, serial: Optional[str]) -> bool:
        print("Connecting via UVC (limited features)...")
        # Simulate connection
        self.connected = True
        return True
    
    def disconnect(self) -> bool:
        self.connected = False
        return True
    
    def is_connected(self) -> bool:
        return self.connected
    
    def start_acquisition(self) -> bool:
        self.acquiring = True
        return True
    
    def stop_acquisition(self) -> bool:
        self.acquiring = False
        return True
    
    def is_acquiring(self) -> bool:
        return self.acquiring
    
    def set_exposure(self, exposure_us: int) -> bool:
        print(f"Setting exposure to {exposure_us}μs (UVC)")
        return True
    
    def set_gain(self, gain_db: int) -> bool:
        print(f"Setting gain to {gain_db}dB (UVC)")
        return True
    
    def set_roi(self, x: int, y: int, width: int, height: int) -> bool:
        raise UnsupportedFeatureError("ROI not supported on macOS UVC")
    
    def set_trigger_mode(self, enabled: bool) -> bool:
        raise UnsupportedFeatureError("Hardware trigger not supported on macOS UVC")
    
    def set_trigger_source(self, source: str) -> bool:
        raise UnsupportedFeatureError("Hardware trigger not supported on macOS UVC")
    
    def software_trigger(self) -> bool:
        raise UnsupportedFeatureError("Software trigger not supported on macOS UVC")
    
    def get_frame(self) -> Optional[bytes]:
        # Simulate frame data
        return b"mock_frame_data"





