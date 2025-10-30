#!/usr/bin/env python3
"""
Template Device Example

Demonstrates basic usage of the template device controller with
capability detection and cross-platform support.
"""

import sys
import time
from template_controller import TemplateController, DeviceError, UnsupportedFeatureError

def main():
    """Main example function"""
    print("Template Device Example")
    print("=" * 50)
    
    # Create device controller
    device = TemplateController()
    
    try:
        # Show platform capabilities
        print(f"Platform: {device.capabilities['os']} ({device.capabilities['transport']})")
        print(f"Features: {device.capabilities['features']}")
        print()
        
        # Connect to device
        print("Connecting to device...")
        device.connect("TEMPLATE-001")
        
        if not device.is_connected():
            print("Failed to connect to device")
            return 1
        
        print("Connected successfully!")
        print()
        
        # Initialize device
        print("Initializing device...")
        device.initialize()
        print("✓ Device initialized")
        
        # Configure device settings
        print("Configuring device...")
        
        # Enable device
        try:
            device.set_enabled(True)
            print("✓ Device enabled")
        except UnsupportedFeatureError as e:
            print(f"✗ Device control not available: {e}")
        
        # Set mode (if supported)
        try:
            device.set_mode("high_performance")
            print("✓ Mode set to high_performance")
        except UnsupportedFeatureError as e:
            print(f"✗ Advanced control not available: {e}")
        
        # Set timeout
        try:
            device.set_timeout(10.0)
            print("✓ Timeout set to 10.0s")
        except Exception as e:
            print(f"✗ Failed to set timeout: {e}")
        
        print()
        
        # Get device status
        print("Getting device status...")
        status = device.get_status()
        print(f"Status: {status['status']}")
        print(f"Temperature: {status['temperature']}°C")
        print(f"Voltage: {status['voltage']}V")
        print(f"Current: {status['current']}A")
        
        print()
        
        # Reset device
        print("Resetting device...")
        device.reset()
        print("✓ Device reset")
        
        print()
        
        # Show current settings
        print("Current settings:")
        print(f"  Enabled: {device.enabled}")
        print(f"  Mode: {device.mode}")
        print(f"  Timeout: {device.timeout}s")
        
    except DeviceError as e:
        print(f"Device error: {e}")
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    finally:
        # Disconnect
        if device.is_connected():
            print("Disconnecting...")
            device.disconnect()
            print("✓ Disconnected")
    
    print("\nExample completed successfully!")
    return 0

def test_capabilities():
    """Test capability detection"""
    print("Testing Capability Detection")
    print("=" * 30)
    
    device = TemplateController()
    capabilities = device.get_capabilities()
    
    print(f"OS: {capabilities['os']}")
    print(f"Transport: {capabilities['transport']}")
    print()
    
    print("Feature Support:")
    for feature, supported in capabilities['features'].items():
        status = "✓" if supported else "✗"
        print(f"  {status} {feature}")
    
    print()
    print("Limits:")
    for limit, value in capabilities['limits'].items():
        print(f"  {limit}: {value}")
    
    print()
    print("Supported Features:")
    supported = [f for f, s in capabilities['features'].items() if s]
    print(f"  {', '.join(supported)}")
    
    print()
    print("Limited Features:")
    limited = [f for f, s in capabilities['features'].items() if not s]
    if limited:
        print(f"  {', '.join(limited)}")
    else:
        print("  None")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_capabilities()
    else:
        sys.exit(main())





