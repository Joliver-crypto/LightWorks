# Jankomotor 8812 Arduino Controller

A proper Arduino controller for New Focus Picomotor 8812 actuators using H-bridge PH/EN drive pattern with serial command interface and Andor spectrometer integration.

## ⚠️ Important: This is NOT a Stepper Motor Controller

The Jankomotor 8812 uses **PH/EN drive pattern** (not stepper STEP/DIR). This controller generates:
- **Fixed-width ENABLE pulses** (600-1200µs typical)
- **Direction held constant** during movement
- **Gaps between pulses** (2-15ms typical)
- **Takeup steps** after direction changes

## Features

- ✅ **Proper PH/EN Drive Pattern** - Correctly drives Picomotor 8812 actuators
- ✅ **Configurable Timing** - Tunable pulse width, gaps, and settle delays
- ✅ **Raster Scanning** - Built-in raster scan with serpentine pattern
- ✅ **Andor Integration** - Trigger output and expose input handling
- ✅ **Position Tracking** - Accurate position feedback
- ✅ **Serial Protocol** - Clean command interface for automation
- ✅ **Error Handling** - Robust error detection and recovery
- ✅ **Python Client** - High-level Python interface

## Hardware Requirements

### Arduino
- Arduino Uno, Nano, or Pro Mini
- 5V operation (3.3V may work with level shifters)

### Motor Driver
- H-bridge driver (DRV8871, L298N, etc.)
- PH/EN control inputs (not STEP/DIR)
- 5V logic compatible

### Picomotor 8812
- New Focus Picomotor 8812 actuators
- Proper power supply (check specifications)
- Appropriate cabling

### Optional: Andor Spectrometer
- TTL trigger input
- Expose output signal
- Proper grounding

## Pin Configuration

| Function | Arduino Pin | Description |
|----------|-------------|-------------|
| X_PH | 5 | X axis direction (HIGH=forward, LOW=reverse) |
| X_EN | 9 | X axis enable/pulse |
| Y_PH | 6 | Y axis direction |
| Y_EN | 10 | Y axis enable/pulse |
| TRIGGER_OUT | 12 | Trigger output for Andor |
| EXPOSE_IN | 11 | Andor expose input (TTL) |
| LED_PIN | 13 | Status LED |

## Quick Start

### 1. Upload Arduino Code

1. Open `arduino/Jankomotor8812.ino` in Arduino IDE
2. Install required libraries (none required)
3. Select your Arduino board and port
4. Upload the sketch

### 2. Test Basic Operation

1. Open Serial Monitor at 9600 baud
2. Send commands:
   ```
   ENABLE
   MOVE X 100
   MOVE Y -50
   POSITION
   STATUS
   DISABLE
   ```

### 3. Use Python Client

```python
from jankomotor_client import JankomotorClient

# Connect to Arduino
client = JankomotorClient('/dev/ttyUSB0')  # or 'COM3' on Windows
client.connect()

# Enable and configure
client.enable()
client.set_timing(pulse_us=800, gap_ms=6, takeup_steps=8)

# Move motors
client.move_x(1000)
client.move_y(-500)

# Get position
x, y = client.get_position()
print(f"Position: X={x}, Y={y}")

# Disconnect
client.disconnect()
```

## Arduino Code Structure

```
arduino/
├── Jankomotor8812.ino          # Main production sketch
└── README.md                   # Arduino setup instructions
```

## Serial Command Protocol

### Basic Commands
- `ENABLE` - Enable motor system
- `DISABLE` - Disable motor system
- `MOVE X <steps>` - Move X axis relative
- `MOVE Y <steps>` - Move Y axis relative
- `POSITION` - Get current position
- `STATUS` - Get system status
- `HOME` - Home both axes
- `STOP` - Emergency stop

### Configuration Commands
- `SET PARAMS pulse_us=800 gap_ms=6 takeup=8 settleX=35 settleY=45`
- `TRIGGER_ON` - Enable trigger output
- `TRIGGER_OFF` - Disable trigger output

### Raster Scan Commands
- `SCAN RASTER Nx=20 Ny=15 dx=100 dy=100 serpentine=1 andor=1`

### Response Format
- `OK` - Command successful
- `ERROR,<code>` - Command failed
- `POS X=123 Y=456` - Position response
- `STATUS ENABLED=1 MOVING=0 X=123 Y=456 RASTER=0 TRIGGER=1` - Status response

## Python Client API

### Basic Usage

```python
from jankomotor_client import JankomotorClient, JankomotorConfig

# Initialize client
client = JankomotorClient('/dev/ttyUSB0')
client.connect()

# Enable system
client.enable()

# Configure timing
config = JankomotorConfig(
    pulse_us=800,      # Pulse width in microseconds
    gap_ms=6,          # Gap between pulses in milliseconds
    takeup_steps=8,    # Takeup steps after direction change
    settle_x_ms=35,    # X axis settle delay
    settle_y_ms=45     # Y axis settle delay
)
client.set_config(config)

# Move motors
client.move_x(1000)           # Move X axis +1000 steps
client.move_y(-500)           # Move Y axis -500 steps
client.move_xy(100, -200)     # Move both axes

# Get position
x, y = client.get_position()
print(f"Current position: X={x}, Y={y}")

# Raster scanning
client.enable_trigger()  # Enable Andor integration
client.start_raster_scan(
    x_start=0, y_start=0,
    x_end=2000, y_end=1500,
    x_step=100, y_step=100,
    serpentine=True,
    andor_integration=True
)

# Monitor status
while True:
    status = client.get_status()
    if not status['raster_active']:
        break
    time.sleep(0.1)

# Cleanup
client.disable()
client.disconnect()
```

### Advanced Features

```python
# Wait for movement completion
client.move_xy(1000, 1000)
client.wait_for_idle(timeout=10.0)

# Set individual timing parameters
client.set_timing(pulse_us=600, gap_ms=3)  # High speed
client.set_timing(pulse_us=1200, gap_ms=10)  # High precision

# Emergency stop
client.stop()

# Get detailed status
status = client.get_status()
print(f"Enabled: {status['enabled']}")
print(f"Moving: {status['moving']}")
print(f"Position: ({status['x_pos']}, {status['y_pos']})")
print(f"Raster active: {status['raster_active']}")
print(f"Trigger enabled: {status['trigger_enabled']}")
```

## Timing Parameters

### Pulse Width (`pulse_us`)
- **Range**: 300-1500 microseconds
- **Default**: 800µs
- **Effect**: Shorter = faster, longer = more reliable
- **Recommendation**: 600-1000µs for most applications

### Gap Between Pulses (`gap_ms`)
- **Range**: 2-15 milliseconds
- **Default**: 6ms
- **Effect**: Shorter = faster, longer = more stable
- **Recommendation**: 4-8ms for most applications

### Takeup Steps (`takeup_steps`)
- **Range**: 0-50 steps
- **Default**: 8 steps
- **Effect**: More = better direction change handling
- **Recommendation**: 5-15 steps

### Settle Delays (`settle_x_ms`, `settle_y_ms`)
- **Range**: 0-200 milliseconds
- **Default**: 35ms (X), 45ms (Y)
- **Effect**: Longer = more stable positioning
- **Recommendation**: 20-60ms depending on application

## Raster Scanning

The controller supports raster scanning with:
- **Serpentine pattern** - Efficient back-and-forth scanning
- **Andor integration** - Automatic trigger output and expose waiting
- **Configurable grid** - Customizable scan area and step sizes
- **Real-time monitoring** - Status updates during scanning

### Example Raster Scan

```python
# Start 20x15 grid raster scan
client.start_raster_scan(
    x_start=0, y_start=0,      # Start position
    x_end=2000, y_end=1500,    # End position (20x15 grid)
    x_step=100, y_step=100,    # 100µm steps
    serpentine=True,            # Use serpentine pattern
    andor_integration=True      # Enable Andor integration
)

# Monitor progress
while True:
    status = client.get_status()
    if not status['raster_active']:
        print("Raster scan completed")
        break
    print(f"Scanning: X={status['x_pos']}, Y={status['y_pos']}")
    time.sleep(0.5)
```

## Andor Spectrometer Integration

The controller provides:
- **Trigger output** - TTL pulse for each scan point
- **Expose input** - Wait for Andor expose completion
- **Synchronization** - Ensures proper timing between movement and data acquisition

### Hardware Connections
- `TRIGGER_OUT` → Andor trigger input
- `EXPOSE_IN` ← Andor expose output
- Common ground between Arduino and Andor

### Software Usage
```python
# Enable Andor integration
client.enable_trigger()

# Start raster scan with Andor integration
client.start_raster_scan(..., andor_integration=True)

# The controller will automatically:
# 1. Move to scan point
# 2. Send trigger pulse
# 3. Wait for Andor expose to complete
# 4. Move to next point
```

## Troubleshooting

### Motor Not Moving
1. Check power supply to Picomotor
2. Verify H-bridge connections
3. Check PH/EN pin assignments
4. Ensure motor is enabled (`ENABLE` command)
5. Verify timing parameters are appropriate

### Erratic Movement
1. Increase `pulse_us` (try 1000-1200µs)
2. Increase `gap_ms` (try 8-12ms)
3. Increase `takeup_steps` (try 10-15)
4. Check for loose connections
5. Verify proper grounding

### Communication Issues
1. Check serial port and baud rate (9600)
2. Verify Arduino is connected and powered
3. Check for loose USB cable
4. Try different USB port
5. Check for driver issues

### Raster Scan Issues
1. Verify Andor connections if using integration
2. Check trigger output with oscilloscope
3. Verify expose input signal levels
4. Adjust timing parameters for stability

## Examples

### Basic Movement Example
```python
#!/usr/bin/env python3
from jankomotor_client import JankomotorClient

client = JankomotorClient('/dev/ttyUSB0')
client.connect()

# Enable and configure
client.enable()
client.set_timing(pulse_us=800, gap_ms=6)

# Move in a square pattern
client.move_xy(1000, 0)      # Right
client.move_xy(0, 1000)      # Up
client.move_xy(-1000, 0)     # Left
client.move_xy(0, -1000)     # Down

client.disable()
client.disconnect()
```

### Raster Scan Example
```python
#!/usr/bin/env python3
from jankomotor_client import JankomotorClient

client = JankomotorClient('/dev/ttyUSB0')
client.connect()

# Enable and configure
client.enable()
client.set_timing(pulse_us=800, gap_ms=6, settle_x_ms=50, settle_y_ms=60)
client.enable_trigger()

# Start raster scan
client.start_raster_scan(0, 0, 1000, 1000, 50, 50, serpentine=True, andor_integration=True)

# Monitor progress
while True:
    status = client.get_status()
    if not status['raster_active']:
        break
    print(f"Progress: X={status['x_pos']}, Y={status['y_pos']}")
    time.sleep(0.1)

client.disable()
client.disconnect()
```

## License

This project is part of the LightWorks project. See the main project license for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check this README first
2. Check the troubleshooting section
3. Review the example code
4. Open an issue on the project repository

---

**Remember**: This controller uses PH/EN drive pattern, not stepper motor STEP/DIR. Make sure your motor driver supports PH/EN control inputs.