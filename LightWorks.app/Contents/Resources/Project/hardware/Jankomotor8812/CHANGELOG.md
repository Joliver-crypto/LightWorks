# Changelog

## Version 2.1 - 2024

### Major Changes
- **Renamed from Picomotor_8812 to Jankomotor8812**
- **Complete rewrite** using proper PH/EN drive pattern (not stepper STEP/DIR)
- **Modular Arduino code structure** with separate header and implementation files
- **Enhanced Python client** with better error handling and configuration management

### New Features
- ✅ **Proper Picomotor Drive Pattern** - Fixed-width ENABLE pulses with direction held constant
- ✅ **Configurable Timing Parameters** - Tunable pulse width, gaps, and settle delays
- ✅ **Raster Scanning** - Built-in raster scan with serpentine pattern
- ✅ **Andor Integration** - Trigger output and expose input handling
- ✅ **Position Tracking** - Accurate position feedback and monitoring
- ✅ **Serial Command Protocol** - Clean, documented command interface
- ✅ **Error Handling** - Robust error detection and recovery
- ✅ **Python Client** - High-level Python interface with examples

### Arduino Code Structure
```
arduino/
├── Jankomotor8812.ino          # Main sketch
├── src/
│   ├── JankomotorConfig.h      # Pin definitions and defaults
│   ├── JankomotorCore.h        # Core data structures
│   ├── JankomotorCore.cpp      # Core motor control functions
│   ├── JankomotorCommands.h    # Command interface
│   ├── JankomotorCommands.cpp  # Command parsing and handling
│   ├── JankomotorRaster.h      # Raster scan functionality
│   └── JankomotorRaster.cpp    # Raster scan implementation
└── examples/
    ├── BasicMovement.ino       # Basic movement example
    └── RasterScan.ino          # Raster scan example
```

### Python Client
- `jankomotor_client.py` - Main client class with full API
- `example_usage.py` - Comprehensive usage examples
- Configuration management with `JankomotorConfig` class
- Status monitoring and error handling

### Breaking Changes
- **Drive Pattern**: Changed from STEP/DIR to PH/EN (required for Picomotor 8812)
- **Command Protocol**: Updated command format and responses
- **File Structure**: Reorganized into modular Arduino code
- **Python API**: New client class with different method names

### Migration Guide
1. **Hardware**: Ensure your motor driver supports PH/EN control (not STEP/DIR)
2. **Arduino**: Upload new `Jankomotor8812.ino` sketch
3. **Python**: Update imports to use `JankomotorClient` instead of `PicomotorController`
4. **Commands**: Update serial commands to new format (see README)

### Technical Details
- **Pulse Width**: 300-1500µs (default: 800µs)
- **Gap Between Pulses**: 2-15ms (default: 6ms)
- **Takeup Steps**: 0-50 (default: 8)
- **Settle Delays**: 0-200ms (default: 35ms X, 45ms Y)
- **Serial Protocol**: 9600 baud, newline-terminated commands
- **Pin Configuration**: X_PH=5, X_EN=9, Y_PH=6, Y_EN=10, TRIGGER_OUT=12, EXPOSE_IN=11

### Known Issues
- None currently known

### Future Plans
- Add limit switch support
- Implement microstepping
- Add more sophisticated acceleration profiles
- Support for multiple motor configurations
