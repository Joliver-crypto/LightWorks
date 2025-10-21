"""
Template Device Capabilities Detection

Provides capability detection and platform-specific feature mapping
for template devices across Windows, Linux, and macOS.
"""

import platform
import json
import os
from typing import Dict, Any, Optional

# Load capabilities from device-config.json
def load_device_capabilities() -> Dict[str, Any]:
    """Load capabilities from device-config.json"""
    config_path = os.path.join(os.path.dirname(__file__), '..', 'device-config.json')
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        return config.get('capabilities', {})
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Could not load device capabilities: {e}")
        return {}

def get_capabilities() -> Dict[str, Any]:
    """Get capabilities for current platform"""
    capabilities = load_device_capabilities()
    current_platform = platform.system().lower()
    
    # Map platform names
    platform_map = {
        'windows': 'windows',
        'linux': 'linux', 
        'darwin': 'macos'
    }
    
    platform_key = platform_map.get(current_platform, 'macos')
    return capabilities.get(platform_key, capabilities.get('macos', {}))

def detect_platform_capabilities() -> Dict[str, Any]:
    """Detect actual platform capabilities at runtime"""
    base_capabilities = get_capabilities()
    detected_capabilities = base_capabilities.copy()
    
    current_platform = platform.system().lower()
    
    try:
        if current_platform == 'windows':
            # Check for native driver
            has_native_driver = check_native_driver()
            if not has_native_driver:
                # Fallback to generic capabilities
                generic_caps = load_device_capabilities().get('linux', {})
                detected_capabilities.update(generic_caps)
                detected_capabilities['transport'] = 'Generic'
                print("Native driver not found, falling back to generic")
                
        elif current_platform == 'linux':
            # Check for V4L2/USB support
            has_v4l2 = check_v4l2_support()
            if not has_v4l2:
                # Fallback to generic capabilities
                generic_caps = load_device_capabilities().get('macos', {})
                detected_capabilities.update(generic_caps)
                detected_capabilities['transport'] = 'Generic'
                print("V4L2 not found, falling back to generic")
                
        elif current_platform == 'darwin':
            # Check for UVC/AVFoundation support
            has_uvc = check_uvc_support()
            if not has_uvc:
                raise RuntimeError("No device drivers available on macOS")
                
    except Exception as e:
        print(f"Warning: Capability detection failed: {e}")
        # Use static capabilities as fallback
        
    return detected_capabilities

def check_native_driver() -> bool:
    """Check if native Windows driver is available"""
    try:
        # Try to import native driver
        # This would be implemented with actual driver detection
        return True
    except ImportError:
        return False

def check_v4l2_support() -> bool:
    """Check if V4L2 is available on Linux"""
    try:
        import v4l2
        return True
    except ImportError:
        # Check if V4L2 devices exist
        import glob
        video_devices = glob.glob('/dev/video*')
        return len(video_devices) > 0

def check_uvc_support() -> bool:
    """Check if UVC is available on macOS"""
    try:
        import cv2
        # Try to open a device
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            cap.release()
            return True
        return False
    except ImportError:
        return False

def get_limited_features() -> list:
    """Get list of features that are limited on current platform"""
    capabilities = get_capabilities()
    features = capabilities.get('features', {})
    
    limited = []
    for feature, supported in features.items():
        if not supported:
            limited.append(feature)
    
    return limited

def is_feature_supported(feature: str) -> bool:
    """Check if a specific feature is supported on current platform"""
    capabilities = get_capabilities()
    features = capabilities.get('features', {})
    return features.get(feature, False)

def get_feature_limits() -> Dict[str, Any]:
    """Get feature limits for current platform"""
    capabilities = get_capabilities()
    return capabilities.get('limits', {})

def get_platform_info() -> Dict[str, str]:
    """Get platform information"""
    capabilities = get_capabilities()
    return {
        'os': capabilities.get('os', 'Unknown'),
        'transport': capabilities.get('transport', 'Unknown'),
        'platform': platform.system(),
        'version': platform.version()
    }


