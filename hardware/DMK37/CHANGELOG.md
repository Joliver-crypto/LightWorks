# Changelog

All notable changes to the DMK 37BUX252 camera device will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial device configuration
- Cross-platform capability matrix
- Windows IC Imaging Control support
- Linux V4L2 support
- macOS UVC support
- Capability-driven UI components
- Device template for future cameras

### Changed
- Moved from src/components to hardware folder structure
- Updated documentation to reflect hardware organization

### Fixed
- Platform-specific feature detection
- Capability matrix accuracy

## [1.0.0] - 2024-01-XX

### Added
- Initial release
- Basic camera control interface
- Cross-platform driver selection
- Capability detection system
- Device configuration schema
- Documentation and quick start guide

### Features
- **Windows**: Full feature support via IC Imaging Control
- **Linux**: Good feature support via V4L2
- **macOS**: Basic feature support via UVC
- **Capability-driven UI**: Controls adapt based on platform capabilities
- **Automatic driver selection**: Best available driver chosen at runtime
- **Graceful degradation**: Limited features clearly indicated to users

### Technical Details
- Device type: `camera.dmk37`
- Supported platforms: Windows, Linux, macOS
- Connection: USB
- Resolution: Up to 1920x1080
- Frame rate: 30-60fps (platform dependent)
- Bit depth: 8-bit (UVC), 12-bit (Windows/Linux native)

### Known Limitations
- macOS limited to UVC features only
- ROI not available on macOS
- Hardware triggering not supported on macOS
- 12-bit mono not available on macOS
- Frame rate limited to 30fps on Linux/macOS


