# Jankomotor 8812 Quick Start

## 🚀 **Ready to Use!**

The Arduino code has been simplified to a single, production-ready file with safety features.

## 📁 **Clean Structure**

```
hardware/Jankomotor8812/
├── arduino/
│   ├── Jankomotor8812.ino      # Single production sketch
│   └── README.md               # Arduino setup guide
├── scripts/
│   ├── jankomotor_controller.py # Python controller
│   └── example.py              # Usage example
├── device-config.json          # LightWorks integration
└── README.md                   # Full documentation
```

## ⚡ **Quick Setup**

### 1. Upload Arduino Code
- Open `arduino/Jankomotor8812.ino` in Arduino IDE
- Upload to your Arduino

### 2. Connect Safety Hardware
```
Pin 2  → Emergency Stop Button (to GND)
Pin 3  → X Min Limit Switch (to GND)
Pin 4  → X Max Limit Switch (to GND)
Pin 7  → Y Min Limit Switch (to GND)
Pin 8  → Y Max Limit Switch (to GND)
Pin A0 → Current Sense (from motor driver)
```

### 3. Test Basic Operation
```python
from jankomotor_controller import SimpleJankomotorController

controller = SimpleJankomotorController('/dev/ttyUSB0')
controller.connect()
controller.enable()
controller.move_to(1000, 500)
controller.disconnect()
```

## 🛡️ **Safety Features**

- ✅ Emergency stop button
- ✅ Limit switches
- ✅ Current monitoring
- ✅ Watchdog timer
- ✅ Software position limits
- ✅ Automatic shutdown on errors

## 📋 **Commands**

- `ENABLE` - Enable motor system
- `MOVE X <steps>` - Move X axis
- `MOVE Y <steps>` - Move Y axis
- `POSITION` - Get position
- `STATUS` - Get status
- `STOP` - Emergency stop
- `HELP` - Show all commands

## 🎯 **Next Steps**

1. **Add safety hardware** (limit switches, emergency stop)
2. **Test with small movements** first
3. **Set appropriate software limits**
4. **Use Python controller** for automation
5. **Integrate with LightWorks** app

The Arduino is now a simple, reliable "middle man" that safely executes commands while your Python scripts handle the complex logic!
