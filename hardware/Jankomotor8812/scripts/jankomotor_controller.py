#!/usr/bin/env python3
"""
Simple Jankomotor 8812 Controller

High-level Python interface for the Arduino "middle man" controller.
This script handles the complex logic while the Arduino just executes commands.

Usage:
    from simple_controller import SimpleJankomotorController
    
    controller = SimpleJankomotorController('/dev/ttyUSB0')
    controller.connect()
    
    # Move motors
    controller.move_to(1000, 500)
    controller.raster_scan(0, 0, 2000, 1500, 100, 100)
    
    controller.disconnect()
"""

import serial
import time
import logging
from typing import Tuple, Optional, Callable
from dataclasses import dataclass

@dataclass
class Position:
    x: int
    y: int

class SimpleJankomotorController:
    """Simple high-level controller for Jankomotor 8812"""
    
    def __init__(self, port: str, baudrate: int = 9600, timeout: float = 1.0):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial_conn: Optional[serial.Serial] = None
        self.logger = logging.getLogger(__name__)
        self.position = Position(0, 0)
        self.enabled = False
        
    def connect(self) -> bool:
        """Connect to Arduino controller"""
        try:
            self.serial_conn = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout
            )
            time.sleep(2)  # Wait for Arduino to initialize
            
            # Read ready message
            response = self.serial_conn.readline().decode('ascii').strip()
            self.logger.info(f"Arduino response: {response}")
            
            if "READY" in response:
                self.logger.info("Connected to Jankomotor controller")
                return True
            else:
                self.logger.error("Arduino not ready")
                return False
                
        except serial.SerialException as e:
            self.logger.error(f"Failed to connect: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from Arduino"""
        if self.serial_conn and self.serial_conn.is_open:
            self.disable()
            self.serial_conn.close()
            self.logger.info("Disconnected from Jankomotor controller")
    
    def _send_command(self, command: str) -> str:
        """Send command to Arduino and return response"""
        if not self.serial_conn or not self.serial_conn.is_open:
            raise ConnectionError("Not connected to Arduino")
        
        cmd_bytes = (command + '\n').encode('ascii')
        self.serial_conn.write(cmd_bytes)
        response = self.serial_conn.readline().decode('ascii').strip()
        self.logger.debug(f"Sent: {command}, Received: {response}")
        return response
    
    def enable(self) -> bool:
        """Enable motor system"""
        response = self._send_command("ENABLE")
        if response == "OK":
            self.enabled = True
            return True
        return False
    
    def disable(self) -> bool:
        """Disable motor system"""
        response = self._send_command("DISABLE")
        if response == "OK":
            self.enabled = False
            return True
        return False
    
    def get_position(self) -> Position:
        """Get current position"""
        response = self._send_command("POSITION")
        if response.startswith("POS X="):
            # Parse: "POS X=123 Y=456"
            parts = response.split()
            x = int(parts[1].split('=')[1])
            y = int(parts[2].split('=')[1])
            self.position = Position(x, y)
        return self.position
    
    def move_to(self, x: int, y: int) -> bool:
        """Move to absolute position"""
        current = self.get_position()
        x_steps = x - current.x
        y_steps = y - current.y
        
        return self.move_relative(x_steps, y_steps)
    
    def move_relative(self, x_steps: int, y_steps: int) -> bool:
        """Move relative distance"""
        if not self.enabled:
            self.logger.error("System not enabled")
            return False
        
        # Move X axis
        if x_steps != 0:
            response = self._send_command(f"MOVE X {x_steps}")
            if response != "OK":
                self.logger.error(f"X move failed: {response}")
                return False
        
        # Move Y axis
        if y_steps != 0:
            response = self._send_command(f"MOVE Y {y_steps}")
            if response != "OK":
                self.logger.error(f"Y move failed: {response}")
                return False
        
        # Update position
        self.position.x += x_steps
        self.position.y += y_steps
        
        return True
    
    def home(self) -> bool:
        """Home both axes"""
        response = self._send_command("HOME")
        if response == "OK":
            self.position = Position(0, 0)
            return True
        return False
    
    def raster_scan(self, x_start: int, y_start: int, x_end: int, y_end: int,
                   x_step: int, y_step: int, callback: Optional[Callable] = None) -> bool:
        """Perform raster scan with optional callback for each point"""
        
        # Move to start position
        if not self.move_to(x_start, y_start):
            return False
        
        # Calculate scan parameters
        x_points = (x_end - x_start) // x_step
        y_points = (y_end - y_start) // y_step
        
        self.logger.info(f"Starting raster scan: {x_points}x{y_points} points")
        
        # Perform raster scan
        for y_idx in range(y_points + 1):
            for x_idx in range(x_points + 1):
                # Calculate current position
                current_x = x_start + x_idx * x_step
                current_y = y_start + y_idx * y_step
                
                # Move to current point
                if not self.move_to(current_x, current_y):
                    self.logger.error("Raster scan failed")
                    return False
                
                # Call callback if provided
                if callback:
                    callback(current_x, current_y, x_idx, y_idx)
                
                # Small delay for stability
                time.sleep(0.01)
        
        self.logger.info("Raster scan completed")
        return True
    
    def get_status(self) -> dict:
        """Get system status"""
        response = self._send_command("STATUS")
        if response.startswith("STATUS"):
            parts = response.split()
            return {
                'enabled': parts[1].split('=')[1] == '1',
                'moving': parts[2].split('=')[1] == '1',
                'x_pos': int(parts[3].split('=')[1]),
                'y_pos': int(parts[4].split('=')[1])
            }
        return {'enabled': False, 'moving': False, 'x_pos': 0, 'y_pos': 0}
    
    def get_safety_status(self) -> dict:
        """Get safety system status"""
        response = self._send_command("SAFETY")
        if response.startswith("SAFETY"):
            parts = response.split()
            return {
                'emergency_stop': parts[1].split('=')[1] == '1',
                'x_limit_min': parts[2].split('=')[1] == '1',
                'x_limit_max': parts[3].split('=')[1] == '1',
                'y_limit_min': parts[4].split('=')[1] == '1',
                'y_limit_max': parts[5].split('=')[1] == '1',
                'current_overload': parts[6].split('=')[1] == '1'
            }
        return {'emergency_stop': False, 'x_limit_min': False, 'x_limit_max': False,
                'y_limit_min': False, 'y_limit_max': False, 'current_overload': False}
    
    def emergency_stop(self) -> bool:
        """Emergency stop all movement"""
        response = self._send_command("STOP")
        return response == "OK"
    
    def set_limits(self, x_min: int, x_max: int, y_min: int, y_max: int) -> bool:
        """Set software position limits"""
        response = self._send_command(f"SET_LIMITS {x_min} {x_max} {y_min} {y_max}")
        return response == "OK"

# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Example usage
    controller = SimpleJankomotorController('/dev/ttyUSB0')
    
    if controller.connect():
        try:
            # Enable system
            controller.enable()
            
            # Move to position
            controller.move_to(1000, 500)
            
            # Get position
            pos = controller.get_position()
            print(f"Current position: X={pos.x}, Y={pos.y}")
            
            # Raster scan with callback
            def scan_callback(x, y, x_idx, y_idx):
                print(f"Scanning point ({x}, {y}) - {x_idx},{y_idx}")
            
            controller.raster_scan(0, 0, 1000, 1000, 100, 100, scan_callback)
            
            # Get safety status
            safety = controller.get_safety_status()
            print(f"Safety status: {safety}")
            
            controller.disable()
            
        finally:
            controller.disconnect()
    else:
        print("Failed to connect to Jankomotor controller")
