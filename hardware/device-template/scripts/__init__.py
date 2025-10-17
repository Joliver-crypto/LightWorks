# Device Template Controller Package
"""
Template Device Controller

Cross-platform device control with capability detection and automatic
driver selection for Windows, Linux, and macOS.
"""

from .template_controller import TemplateController
from .capabilities import get_capabilities, detect_platform_capabilities

__version__ = "1.0.0"
__author__ = "LightWorks Team"

__all__ = [
    "TemplateController",
    "get_capabilities", 
    "detect_platform_capabilities"
]
