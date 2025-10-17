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
    """Windows driver using IC Imaging Control"""
    
    def __init__(self):
        self.connected = False
        self.acquiring = False
    
    def connect(self, serial: Optional[str]) -> bool:
        print("Connecting via IC Imaging Control...")
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
        print(f"Setting exposure to {exposure_us}μs (IC Imaging Control)")
        return True
    
    def set_gain(self, gain_db: int) -> bool:
        print(f"Setting gain to {gain_db}dB (IC Imaging Control)")
        return True
    
    def set_roi(self, x: int, y: int, width: int, height: int) -> bool:
        print(f"Setting ROI to {x},{y} {width}x{height} (IC Imaging Control)")
        return True
    
    def set_trigger_mode(self, enabled: bool) -> bool:
        print(f"Setting trigger mode: {enabled} (IC Imaging Control)")
        return True
    
    def set_trigger_source(self, source: str) -> bool:
        print(f"Setting trigger source to {source} (IC Imaging Control)")
        return True
    
    def software_trigger(self) -> bool:
        print("Software trigger (IC Imaging Control)")
        return True
    
    def get_frame(self) -> Optional[bytes]:
        # Simulate frame data
        return b"mock_frame_data"


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
