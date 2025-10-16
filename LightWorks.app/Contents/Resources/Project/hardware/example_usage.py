#!/usr/bin/env python3
"""
Hardware Control Example

This script demonstrates how to use the hardware control modules
from the LightWorks hardware folder.

Usage:
    python example_usage.py
"""

import sys
import os

# Add the hardware folder to Python path
hardware_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, hardware_path)

# Import hardware control modules
try:
    from Jankomotor8812.scripts.jankomotor_client import JankomotorClient
    print("✓ Jankomotor 8812 control module loaded")
except ImportError as e:
    print(f"✗ Failed to load Jankomotor 8812 module: {e}")

def demo_jankomotor():
    """Demonstrate Jankomotor 8812 control"""
    print("\n=== Jankomotor 8812 Demo ===")
    
    # Note: This is a demo - actual hardware connection would require
    # a real serial port and connected device
    
    # Simulate controller initialization
    print("Initializing Jankomotor 8812 controller...")
    print("Note: This demo shows the interface - actual hardware required for real control")
    
    # Show available commands
    print("\nAvailable commands:")
    print("- enable() - Enable motor system")
    print("- disable() - Disable motor system") 
    print("- move_x(steps) - Move X axis relative")
    print("- move_y(steps) - Move Y axis relative")
    print("- move_xy(x_steps, y_steps) - Move both axes")
    print("- get_position() - Get current X,Y position")
    print("- home() - Home both axes")
    print("- set_timing() - Set timing parameters")
    print("- start_raster_scan() - Start raster scan")
    print("- stop() - Emergency stop all motion")

def main():
    """Main example function"""
    print("LightWorks Hardware Control Example")
    print("=" * 40)
    
    # Demo Jankomotor 8812
    demo_jankomotor()
    
    print("\n" + "=" * 40)
    print("Example completed!")
    print("\nTo use with real hardware:")
    print("1. Upload Jankomotor8812.ino to your Arduino")
    print("2. Connect Arduino via USB serial")
    print("3. Update the serial port in the scripts")
    print("4. Run the example_usage.py script")
    print("5. Or integrate into your LightWorks application")

if __name__ == "__main__":
    main()

