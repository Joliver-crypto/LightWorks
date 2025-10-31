"""
DMK37 Camera Capabilities Detection

Provides capability detection and platform-specific feature mapping
for the DMK 37BUX252 camera across Windows, Linux, and macOS.
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
            # Check for IC Imaging Control
            has_ic_imaging = check_ic_imaging_control()
            if not has_ic_imaging:
                # Fallback to UVC capabilities
                uvc_caps = load_device_capabilities().get('macos', {})
                detected_capabilities.update(uvc_caps)
                detected_capabilities['transport'] = 'UVC'
                print("IC Imaging Control not found, falling back to UVC")
                
        elif current_platform == 'linux':
            # Check for V4L2
            has_v4l2 = check_v4l2_support()
            if not has_v4l2:
                # Fallback to UVC capabilities
                uvc_caps = load_device_capabilities().get('macos', {})
                detected_capabilities.update(uvc_caps)
                detected_capabilities['transport'] = 'UVC'
                print("V4L2 not found, falling back to UVC")
                
        elif current_platform == 'darwin':
            # Check for UVC support
            has_uvc = check_uvc_support()
            if not has_uvc:
                raise RuntimeError("No camera drivers available on macOS")
                
    except Exception as e:
        print(f"Warning: Capability detection failed: {e}")
        # Use static capabilities as fallback
        
    return detected_capabilities

def check_ic_imaging_control() -> bool:
    """Check if IC Imaging Control is available on Windows"""
    try:
        # Try to import win32com for COM access
        import win32com.client
        # Try to create IC Imaging Control COM object
        ic = win32com.client.Dispatch("IC Imaging Control.IC Imaging Control.1")
        # If successful, return True
        return True
    except (ImportError, Exception):
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
        # Try to open a camera
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





