# DMK37 Camera Controller Package
"""
DMK 37BUX252 Camera Controller

Cross-platform camera control with capability detection and automatic
driver selection for Windows (IC Imaging Control), Linux (V4L2), and macOS (UVC).
"""

from .dmk37_controller import DMK37Controller
from .capabilities import get_capabilities, detect_platform_capabilities

__version__ = "1.0.0"
__author__ = "LightWorks Team"

__all__ = [
    "DMK37Controller",
    "get_capabilities", 
    "detect_platform_capabilities"
]


