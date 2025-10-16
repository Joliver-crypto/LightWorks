# Generic Laser Device

This is an example of how to add a new hardware device to LightWorks using the modular system.

## Device Information

- **Type**: `laser.generic`
- **Category**: Laser
- **Description**: Generic laser source for optical experiments
- **Connection**: Simulated (for demonstration)

## Features

- Power control (0-100%)
- Wavelength setting
- Temperature monitoring
- Enable/disable control

## Usage

This device demonstrates the modular hardware system. It's a simulated laser that can be used for testing and development.

## Configuration

The device configuration is defined in `device-config.json` and includes:

- Commands for laser control
- Telemetry data (power, wavelength, temperature)
- Properties (wavelength, max power, enabled state)
- Driver information

## Adding to LightWorks

This device will automatically appear in the LightWorks device palette under the "Laser" category. No code changes are needed - just the presence of the `device-config.json` file makes it available.




