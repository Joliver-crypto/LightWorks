#!/usr/bin/env python3
"""
Jankomotor 8812 Example Script

Simple example showing how to use the Jankomotor controller
with the Arduino "middle man" setup.

Usage:
    python example.py [serial_port]
    
Example:
    python example.py /dev/ttyUSB0
    python example.py COM3
"""

import sys
import time
import logging
from jankomotor_controller import SimpleJankomotorController

def main():
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Get serial port from command line or use default
    port = sys.argv[1] if len(sys.argv) > 1 else '/dev/ttyUSB0'
    
    print("Jankomotor 8812 Example")
    print(f"Using serial port: {port}")
    
    # Initialize controller
    controller = SimpleJankomotorController(port)
    
    # Connect to Arduino
    if not controller.connect():
        print(f"Failed to connect to Arduino on {port}")
        print("Make sure the Arduino is connected and the port is correct")
        return 1
    
    try:
        # Enable system
        print("Enabling motor system...")
        if not controller.enable():
            print("Failed to enable motor system")
            return 1
        
        # Get initial position
        pos = controller.get_position()
        print(f"Initial position: X={pos.x}, Y={pos.y}")
        
        # Move to a position
        print("Moving to position (1000, 500)...")
        if controller.move_to(1000, 500):
            pos = controller.get_position()
            print(f"New position: X={pos.x}, Y={pos.y}")
        else:
            print("Move failed")
        
        # Move relative
        print("Moving relative (-200, +300)...")
        if controller.move_relative(-200, 300):
            pos = controller.get_position()
            print(f"New position: X={pos.x}, Y={pos.y}")
        else:
            print("Move failed")
        
        # Get status
        status = controller.get_status()
        print(f"System status: {status}")
        
        # Get safety status
        safety = controller.get_safety_status()
        print(f"Safety status: {safety}")
        
        # Example raster scan
        print("Starting raster scan...")
        def scan_callback(x, y, x_idx, y_idx):
            print(f"  Scanning point ({x}, {y}) - grid {x_idx},{y_idx}")
        
        if controller.raster_scan(0, 0, 500, 500, 100, 100, scan_callback):
            print("Raster scan completed")
        else:
            print("Raster scan failed")
        
        # Home position
        print("Homing motors...")
        if controller.home():
            pos = controller.get_position()
            print(f"Homed to: X={pos.x}, Y={pos.y}")
        else:
            print("Home failed")
        
        # Disable system
        print("Disabling motor system...")
        controller.disable()
        
    except KeyboardInterrupt:
        print("\nExample interrupted by user")
        controller.emergency_stop()
    except Exception as e:
        print(f"Error during example: {e}")
        controller.emergency_stop()
    finally:
        controller.disconnect()
    
    print("Example completed")
    return 0

if __name__ == "__main__":
    sys.exit(main())
