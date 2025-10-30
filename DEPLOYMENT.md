# LightWorks Deployment Guide

This guide explains how to deploy LightWorks to lab computers and other systems.

## 🚀 Quick Deployment Options

### Option 1: GitHub Pull (Recommended for Lab)
**Best for: Lab computers with internet access**

**macOS/Linux:**
```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.sh | bash
```

**Windows:**
```cmd
# Download and run the setup script
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/justinoliver/LightWorks/main/setup-lab-computer.bat' -OutFile 'setup-lab-computer.bat'; .\setup-lab-computer.bat"
```

### Option 2: Platform-Specific Installers
**Best for: Offline computers or easy distribution**

**macOS:**
```bash
./create-app-bundle.sh
# Creates: LightWorks.app (double-click to run)
```

**Windows:**
```powershell
.\create-windows-installer.ps1
# Creates: dist-electron/LightWorks-Setup.exe (run installer)
```

**Linux:**
```bash
./create-linux-appimage.sh
# Creates: dist-electron/LightWorks-*.AppImage (make executable and run)
```

### Option 3: Universal GitHub Method
**One repository, all platforms:**

```bash
# Clone the repository
git clone https://github.com/justinoliver/LightWorks.git
cd LightWorks

# Run platform-specific setup:
# macOS/Linux: ./setup-lab-computer.sh
# Windows: setup-lab-computer.bat
```

## 📁 What Gets Deployed

### GitHub Pull Method
- **Location:** `~/LightWorks/`
- **Contains:** Full source code, dependencies, build tools
- **Updates:** Via `git pull` + `npm install`
- **Size:** ~200MB (with node_modules)

### App Bundle Method
- **Location:** `LightWorks.app/Contents/Resources/Project/`
- **Contains:** Full source code, dependencies embedded
- **Updates:** Replace entire `.app` bundle
- **Size:** ~300MB (self-contained)

## 🔧 Lab Computer Requirements

### Prerequisites
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **Internet connection** (for GitHub method)

### Supported Systems
- ✅ **macOS** 10.15+ (Catalina or later)
- ✅ **Windows 10+** (with WSL or Git Bash)
- ✅ **Linux** (Ubuntu 18.04+, CentOS 7+)

## 🛡️ Code Protection

### What's Protected
- **Source code** is minified and obfuscated in production builds
- **Dependencies** are bundled and not easily extractable
- **Business logic** is compiled and optimized

### What's Not Protected
- **Configuration files** (package.json, etc.)
- **Static assets** (images, fonts)
- **Project files** (.lightworks files)

### For Maximum Protection
1. Use the **App Bundle method** (harder to reverse engineer)
2. Consider **code signing** for production releases
3. Use **private GitHub repository** with access controls

## 🔄 Update Strategies

### Automatic Updates (GitHub Method)
```bash
# Check for updates
cd ~/LightWorks
git fetch origin

# Update if available
git pull origin main
npm install
```

### Manual Updates (App Bundle Method)
1. Download new `LightWorks.app` from GitHub releases
2. Replace old app bundle
3. No installation needed

## 🐧 Linux Edge Deployment (Future)

For deploying to Linux edge devices (like Portal Robotics FlexPondi):

### Docker Approach
```dockerfile
FROM node:18-alpine
COPY . /app
WORKDIR /app
RUN npm install && npm run build
EXPOSE 3006
CMD ["npm", "run", "electron"]
```

### Systemd Service
```ini
[Unit]
Description=LightWorks Optics Lab
After=network.target

[Service]
Type=simple
User=lightworks
WorkingDirectory=/opt/lightworks
ExecStart=/usr/bin/npm run electron
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📋 Deployment Checklist

### Before Deployment
- [ ] Update `GITHUB_REPO` URL in setup scripts
- [ ] Test app bundle creation locally
- [ ] Verify all dependencies are included
- [ ] Check that serial port permissions work

### After Deployment
- [ ] Test app launch and functionality
- [ ] Verify file operations work
- [ ] Check serial port communication
- [ ] Test update mechanism

## 🆘 Troubleshooting

### Common Issues

**"Node.js not found"**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart terminal after installation

**"Permission denied"**
- Make scripts executable: `chmod +x *.sh`
- Check file permissions

**"Port 3006 in use"**
- Kill existing processes: `lsof -ti:3006 | xargs kill -9`
- Or change port in `vite.config.ts`

**"Serial port access denied"**
- Add user to dialout group: `sudo usermod -a -G dialout $USER`
- Log out and back in

### Getting Help
- Check the main README.md for development setup
- Open an issue on GitHub for bugs
- Contact the development team for deployment issues

## 🔐 Security Considerations

### For Lab Environments
- Use **private GitHub repositories** for sensitive code
- Implement **access controls** on lab computers
- Consider **network isolation** for sensitive experiments
- Regular **security updates** of dependencies

### For Production
- **Code signing** for app bundles
- **Encrypted communication** for updates
- **Audit logging** for experiment data
- **Backup strategies** for project files
