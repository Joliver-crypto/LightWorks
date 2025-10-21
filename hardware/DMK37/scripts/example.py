#!/usr/bin/env python3
"""
DMK37 Camera Example

Demonstrates basic usage of the DMK37 camera controller with
capability detection and cross-platform support.
"""

import sys
import time
from dmk37_controller import DMK37Controller, DMK37Error, UnsupportedFeatureError

def main():
    """Main example function"""
    print("DMK37 Camera Example")
    print("=" * 50)
    
    # Create camera controller
    camera = DMK37Controller()
    
    try:
        # Show platform capabilities
        print(f"Platform: {camera.capabilities['os']} ({camera.capabilities['transport']})")
        print(f"Features: {camera.capabilities['features']}")
        print()
        
        # Connect to camera
        print("Connecting to camera...")
        camera.connect("DMK37-001")
        
        if not camera.is_connected():
            print("Failed to connect to camera")
            return 1
        
        print("Connected successfully!")
        print()
        
        # Configure camera settings
        print("Configuring camera...")
        
        # Set exposure
        try:
            camera.set_exposure(1000)  # 1ms
            print("✓ Exposure set to 1000μs")
        except UnsupportedFeatureError as e:
            print(f"✗ Exposure control not available: {e}")
        
        # Set gain
        try:
            camera.set_gain(10)  # 10dB
            print("✓ Gain set to 10dB")
        except UnsupportedFeatureError as e:
            print(f"✗ Gain control not available: {e}")
        
        # Set ROI (if supported)
        try:
            camera.set_roi(100, 100, 800, 600)
            print("✓ ROI set to 100,100 800x600")
        except UnsupportedFeatureError as e:
            print(f"✗ ROI not available: {e}")
        
        # Configure trigger (if supported)
        try:
            camera.set_trigger_mode(True)
            camera.set_trigger_source("Line0")
            print("✓ Hardware trigger configured")
        except UnsupportedFeatureError as e:
            print(f"✗ Hardware trigger not available: {e}")
        
        print()
        
        # Start acquisition
        print("Starting acquisition...")
        camera.start_acquisition()
        
        if camera.is_acquiring():
            print("✓ Acquisition started")
            
            # Capture a few frames
            print("Capturing frames...")
            for i in range(5):
                frame = camera.get_frame()
                if frame:
                    print(f"  Frame {i+1}: {len(frame)} bytes")
                else:
                    print(f"  Frame {i+1}: No data")
                time.sleep(0.1)
            
            # Software trigger (if supported)
            try:
                camera.software_trigger()
                print("✓ Software trigger executed")
            except UnsupportedFeatureError as e:
                print(f"✗ Software trigger not available: {e}")
            
            # Stop acquisition
            print("Stopping acquisition...")
            camera.stop_acquisition()
            print("✓ Acquisition stopped")
        else:
            print("✗ Failed to start acquisition")
        
        print()
        
        # Show current settings
        print("Current settings:")
        print(f"  Exposure: {camera.exposure}μs")
        print(f"  Gain: {camera.gain}dB")
        print(f"  ROI: {camera.roi}")
        print(f"  Trigger Mode: {camera.trigger_mode}")
        print(f"  Trigger Source: {camera.trigger_source}")
        
    except DMK37Error as e:
        print(f"Camera error: {e}")
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    finally:
        # Disconnect
        if camera.is_connected():
            print("Disconnecting...")
            camera.disconnect()
            print("✓ Disconnected")
    
    print("\nExample completed successfully!")
    return 0

def test_capabilities():
    """Test capability detection"""
    print("Testing Capability Detection")
    print("=" * 30)
    
    camera = DMK37Controller()
    capabilities = camera.get_capabilities()
    
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


