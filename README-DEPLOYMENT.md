# LightWorks Cross-Platform Deployment

## ✅ Project Status: Ready for Cross-Platform Deployment

Your LightWorks project is now configured for cross-platform deployment from GitHub. Here's what has been set up:

## 🚀 Quick Start

### For Lab Computers (Recommended)
```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.sh | bash

# Windows
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.bat' -OutFile 'setup-lab-computer.bat'; .\setup-lab-computer.bat"
```

### For Distribution
```bash
# Build for all platforms
npm run dist

# Or build for specific platform
npm run dist:mac    # macOS
npm run dist:win    # Windows  
npm run dist:linux  # Linux
```

## 🔧 What Was Fixed

### 1. Cross-Platform Build Configuration
- ✅ Added `electron-builder.json` with multi-platform targets
- ✅ Added build scripts for macOS, Windows, and Linux
- ✅ Configured proper file inclusion and output directories

### 2. Platform-Specific Script Issues
- ✅ Created `utils/cross-platform.js` with OS-agnostic utilities
- ✅ Fixed hardcoded commands (`lsof`, `osascript`, `curl`)
- ✅ Added fallbacks for different operating systems

### 3. Repository Configuration
- ✅ Updated GitHub repository URLs in all scripts
- ✅ Fixed hardcoded paths and references

### 4. Dependencies
- ✅ All dependencies are cross-platform compatible
- ✅ SerialPort will install correct native bindings per platform
- ✅ Electron will bundle appropriate binaries

## 📦 Build Outputs

After running `npm run dist`, you'll get:

### macOS
- `LightWorks-0.1.0.dmg` - Installer
- `LightWorks-0.1.0-mac.zip` - Portable app

### Windows  
- `LightWorks Setup 0.1.0.exe` - Installer
- `LightWorks-0.1.0-win.zip` - Portable app

### Linux
- `LightWorks-0.1.0.AppImage` - Portable app
- `LightWorks-0.1.0.deb` - Debian package

## 🛠️ Prerequisites for Lab Computers

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Internet connection** (for GitHub method)

### Platform-Specific Requirements

#### Windows
- Windows 10 or later
- PowerShell 5.0+ (included with Windows 10)
- Visual C++ Redistributable (for native modules)

#### macOS
- macOS 10.15 (Catalina) or later
- Xcode Command Line Tools: `xcode-select --install`

#### Linux
- Ubuntu 18.04+ or equivalent
- Build tools: `sudo apt-get install build-essential`
- For AppImage: `sudo apt-get install fuse`

## 🔄 Update Process

### Automatic Updates (GitHub Method)
```bash
cd ~/LightWorks
git pull origin main
npm install
```

### Manual Updates (App Bundle Method)
1. Download new installer from GitHub releases
2. Run installer to update
3. No additional steps needed

## 🐛 Troubleshooting

### Common Issues

**"Node.js not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart terminal after installation

**"Permission denied" (Linux/macOS)**
- Make scripts executable: `chmod +x *.sh`
- Check file permissions

**"Port 3006 in use"**
- The cross-platform utilities will automatically handle this
- Or manually kill processes using the provided utilities

**"Serial port access denied" (Linux)**
- Add user to dialout group: `sudo usermod -a -G dialout $USER`
- Log out and back in

**Build fails on Windows**
- Install Visual Studio Build Tools
- Or install Visual Studio Community with C++ workload

**Build fails on Linux**
- Install build essentials: `sudo apt-get install build-essential`
- Install additional dependencies: `sudo apt-get install libnss3-dev libatk-bridge2.0-dev libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2`

## 📋 Testing Checklist

Before deploying to lab computers:

- [ ] Test on macOS (if available)
- [ ] Test on Windows (if available)  
- [ ] Test on Linux (if available)
- [ ] Verify serial port communication works
- [ ] Test file operations (save/load experiments)
- [ ] Verify update mechanism works
- [ ] Test app bundle creation

## 🔐 Security Notes

- Source code is bundled but not obfuscated in development builds
- For production, consider code signing and obfuscation
- Use private GitHub repositories for sensitive code
- Implement proper access controls on lab computers

## 📞 Support

If you encounter issues:

1. Check the main README.md for development setup
2. Review the DEPLOYMENT.md for detailed instructions
3. Open an issue on GitHub with:
   - Operating system and version
   - Node.js version (`node --version`)
   - Error messages and logs
   - Steps to reproduce the issue

---

**Your LightWorks project is now ready for cross-platform deployment! 🎉**


