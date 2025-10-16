# Hardware Integration

This directory contains hardware integration modules for LightWorks.

## Arduino Integration

### Jankomotor8812 Controller

The Jankomotor8812 device provides a specialized interface for controlling New Focus Picomotor 8812 actuators via Arduino.

#### Features

- **Three Input Fields**: A (X axis), B (Y axis), C (combined)
- **One Run Button**: Executes all entered values in sequence
- **System Controls**: Enable, Disable, Home, Stop
- **Real-time Status**: Shows command execution status
- **Arduino Communication**: Sends commands to Arduino via serial

#### Usage

1. **Drag Jankomotor8812** from the component palette onto the canvas
2. **Select the device** to open the inspector panel
3. **Go to Commands tab** to see the control interface
4. **Enter values** in A, B, C fields (positive/negative numbers)
5. **Click "Run Movement"** to execute all commands
6. **Use system controls** for Enable/Disable/Home/Stop

#### Command Mapping

- **A (X Axis)**: `MOVE X <value>`
- **B (Y Axis)**: `MOVE Y <value>`
- **C (Combined)**: `MOVE XY <value> <value>`
- **Enable**: `ENABLE`
- **Disable**: `DISABLE`
- **Home**: `HOME`
- **Stop**: `STOP`

#### Arduino Communication

The system uses the `ArduinoClient` class to communicate with the Arduino:

```typescript
import { executeArduinoCommand } from './arduinoClient'

// Execute a command
const response = await executeArduinoCommand('MOVE X 100')
console.log(response.message) // "Moved X axis 100 steps"
```

#### Current Implementation

- **Mock Mode**: Currently simulates Arduino responses for testing
- **Serial Communication**: Ready for real Arduino integration
- **Error Handling**: Proper error handling and status reporting
- **Status Updates**: Real-time feedback on command execution

#### Future Enhancements

- **Real Serial Communication**: Connect to actual Arduino via Web Serial API
- **Position Tracking**: Display current motor positions
- **Safety Limits**: Visual indication of limit switch status
- **Raster Scanning**: Built-in raster scan functionality
- **Configuration**: Adjustable timing parameters

## Adding New Hardware

To add new hardware devices:

1. **Create device folder** in `/hardware/`
2. **Add device-config.json** with device specification
3. **Update deviceRegistry.ts** to include the new device
4. **Add device type** to `project.ts` enum
5. **Create specialized UI** if needed in DeviceInspector

## File Structure

```
src/hardware/
├── deviceRegistry.ts      # Device configuration registry
├── arduinoClient.ts       # Arduino communication client
└── README.md             # This file
```
