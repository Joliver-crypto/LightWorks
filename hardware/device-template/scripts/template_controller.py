"""
Template Device Controller

Main controller class for template device with cross-platform support.
Automatically selects the best available driver for the current platform.
"""

import platform
import time
from typing import Optional, Dict, Any
from .capabilities import get_capabilities, is_feature_supported, get_feature_limits

class DeviceError(Exception):
    """Base exception for device errors"""
    pass

class UnsupportedFeatureError(DeviceError):
    """Raised when a feature is not supported on current platform"""
    pass

class ConnectionError(DeviceError):
    """Raised when device connection fails"""
    pass

class TemplateController:
    """
    Template Device Controller
    
    Provides cross-platform device control with automatic driver selection
    and capability-based feature availability.
    """
    
    def __init__(self):
        self.connected = False
        self.model = "Template Device"
        self.serial = ""
        self.firmware_version = "1.0.0"
        
        # Get platform capabilities
        self.capabilities = get_capabilities()
        self.limits = self.capabilities.get('limits', {})
        
        # Current settings
        self.enabled = False
        self.mode = "normal"
        self.timeout = 5.0
        
        # Platform-specific driver
        self._driver = None
        self._init_driver()
    
    def _init_driver(self):
        """Initialize platform-specific driver"""
        current_platform = platform.system().lower()
        
        if current_platform == 'windows':
            self._driver = WindowsTemplateDriver()
        elif current_platform == 'linux':
            self._driver = LinuxTemplateDriver()
        elif current_platform == 'darwin':
            self._driver = MacOSTemplateDriver()
        else:
            raise DeviceError(f"Unsupported platform: {current_platform}")
    
    def connect(self, identifier: Optional[str] = None) -> bool:
        """
        Connect to device
        
        Args:
            identifier: Optional device identifier
            
        Returns:
            True if connection successful
            
        Raises:
            ConnectionError: If connection fails
        """
        try:
            success = self._driver.connect(identifier)
            if success:
                self.connected = True
                self.serial = identifier or "TEMPLATE-001"
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
        Disconnect from device
        
        Returns:
            True if disconnection successful
        """
        success = self._driver.disconnect()
        if success:
            self.connected = False
            print("Disconnected from device")
        return success
    
    def is_connected(self) -> bool:
        """Check if device is connected"""
        return self.connected and self._driver.is_connected()
    
    def initialize(self) -> bool:
        """
        Initialize device
        
        Returns:
            True if initialization successful
            
        Raises:
            DeviceError: If not connected or initialization fails
        """
        if not self.connected:
            raise DeviceError("Device not connected")
        
        try:
            success = self._driver.initialize()
            if success:
                print("Device initialized")
            return success
        except Exception as e:
            raise DeviceError(f"Failed to initialize: {e}")
    
    def reset(self) -> bool:
        """
        Reset device to default state
        
        Returns:
            True if reset successful
            
        Raises:
            DeviceError: If not connected or reset fails
        """
        if not self.connected:
            raise DeviceError("Device not connected")
        
        try:
            success = self._driver.reset()
            if success:
                print("Device reset to default state")
            return success
        except Exception as e:
            raise DeviceError(f"Failed to reset: {e}")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get device status
        
        Returns:
            Dictionary containing device status
            
        Raises:
            DeviceError: If not connected or status retrieval fails
        """
        if not self.connected:
            raise DeviceError("Device not connected")
        
        try:
            status = self._driver.get_status()
            return status
        except Exception as e:
            raise DeviceError(f"Failed to get status: {e}")
    
    def set_enabled(self, enabled: bool) -> bool:
        """
        Enable/disable device
        
        Args:
            enabled: True to enable device
            
        Returns:
            True if setting successful
            
        Raises:
            DeviceError: If not connected or setting fails
        """
        if not self.connected:
            raise DeviceError("Device not connected")
        
        if not is_feature_supported('basicControl'):
            raise UnsupportedFeatureError("Basic control not supported on this platform")
        
        success = self._driver.set_enabled(enabled)
        if success:
            self.enabled = enabled
            print(f"Device {'enabled' if enabled else 'disabled'}")
        return success
    
    def set_mode(self, mode: str) -> bool:
        """
        Set device mode
        
        Args:
            mode: Device mode ("normal", "high_performance", "low_power")
            
        Returns:
            True if setting successful
            
        Raises:
            DeviceError: If not connected or setting fails
            UnsupportedFeatureError: If advanced control not supported
        """
        if not self.connected:
            raise DeviceError("Device not connected")
        
        if not is_feature_supported('advancedControl'):
            raise UnsupportedFeatureError("Advanced control not supported on this platform")
        
        if mode not in ["normal", "high_performance", "low_power"]:
            raise DeviceError("Invalid mode")
        
        success = self._driver.set_mode(mode)
        if success:
            self.mode = mode
            print(f"Device mode set to {mode}")
        return success
    
    def set_timeout(self, timeout: float) -> bool:
        """
        Set device timeout
        
        Args:
            timeout: Timeout in seconds
            
        Returns:
            True if setting successful
            
        Raises:
            DeviceError: If not connected or setting fails
        """
        if not self.connected:
            raise DeviceError("Device not connected")
        
        success = self._driver.set_timeout(timeout)
        if success:
            self.timeout = timeout
            print(f"Timeout set to {timeout}s")
        return success
    
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

class WindowsTemplateDriver:
    """Windows driver using native API"""
    
    def __init__(self):
        self.connected = False
    
    def connect(self, identifier: Optional[str]) -> bool:
        print("Connecting via Windows native driver...")
        # Simulate connection
        self.connected = True
        return True
    
    def disconnect(self) -> bool:
        self.connected = False
        return True
    
    def is_connected(self) -> bool:
        return self.connected
    
    def initialize(self) -> bool:
        print("Initializing device (Windows native)")
        return True
    
    def reset(self) -> bool:
        print("Resetting device (Windows native)")
        return True
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "ready",
            "temperature": 25.0,
            "voltage": 12.0,
            "current": 1.5
        }
    
    def set_enabled(self, enabled: bool) -> bool:
        print(f"Setting enabled: {enabled} (Windows native)")
        return True
    
    def set_mode(self, mode: str) -> bool:
        print(f"Setting mode: {mode} (Windows native)")
        return True
    
    def set_timeout(self, timeout: float) -> bool:
        print(f"Setting timeout: {timeout}s (Windows native)")
        return True


class LinuxTemplateDriver:
    """Linux driver using V4L2/USB"""
    
    def __init__(self):
        self.connected = False
    
    def connect(self, identifier: Optional[str]) -> bool:
        print("Connecting via Linux driver...")
        # Simulate connection
        self.connected = True
        return True
    
    def disconnect(self) -> bool:
        self.connected = False
        return True
    
    def is_connected(self) -> bool:
        return self.connected
    
    def initialize(self) -> bool:
        print("Initializing device (Linux)")
        return True
    
    def reset(self) -> bool:
        print("Resetting device (Linux)")
        return True
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "ready",
            "temperature": 25.0,
            "voltage": 12.0,
            "current": 1.5
        }
    
    def set_enabled(self, enabled: bool) -> bool:
        print(f"Setting enabled: {enabled} (Linux)")
        return True
    
    def set_mode(self, mode: str) -> bool:
        print(f"Setting mode: {mode} (Linux)")
        return True
    
    def set_timeout(self, timeout: float) -> bool:
        print(f"Setting timeout: {timeout}s (Linux)")
        return True


class MacOSTemplateDriver:
    """macOS driver using UVC/AVFoundation (limited features)"""
    
    def __init__(self):
        self.connected = False
    
    def connect(self, identifier: Optional[str]) -> bool:
        print("Connecting via macOS driver (limited features)...")
        # Simulate connection
        self.connected = True
        return True
    
    def disconnect(self) -> bool:
        self.connected = False
        return True
    
    def is_connected(self) -> bool:
        return self.connected
    
    def initialize(self) -> bool:
        print("Initializing device (macOS)")
        return True
    
    def reset(self) -> bool:
        print("Resetting device (macOS)")
        return True
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "status": "ready",
            "temperature": 25.0,
            "voltage": 12.0,
            "current": 1.5
        }
    
    def set_enabled(self, enabled: bool) -> bool:
        print(f"Setting enabled: {enabled} (macOS)")
        return True
    
    def set_mode(self, mode: str) -> bool:
        raise UnsupportedFeatureError("Advanced control not supported on macOS")
    
    def set_timeout(self, timeout: float) -> bool:
        print(f"Setting timeout: {timeout}s (macOS)")
        return True
