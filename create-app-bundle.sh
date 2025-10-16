#!/bin/bash

# LightWorks App Bundle Creator
# This script creates a self-contained .app bundle

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                LightWorks App Bundle Creator                ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this from the LightWorks project directory.${NC}"
    exit 1
fi

# Create the app bundle structure
APP_NAME="LightWorks"
APP_BUNDLE="$APP_NAME.app"
BUNDLE_DIR="$APP_BUNDLE/Contents"
MACOS_DIR="$BUNDLE_DIR/MacOS"
RESOURCES_DIR="$BUNDLE_DIR/Resources"

echo -e "${BLUE}🔨 Creating app bundle structure...${NC}"

# Remove existing app bundle
if [ -d "$APP_BUNDLE" ]; then
    rm -rf "$APP_BUNDLE"
fi

# Create directory structure
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Create Info.plist
cat > "$BUNDLE_DIR/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>LightWorks</string>
    <key>CFBundleIdentifier</key>
    <string>com.lightworks.app</string>
    <key>CFBundleName</key>
    <string>LightWorks</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSRequiresAquaSystemAppearance</key>
    <false/>
</dict>
</plist>
EOF

# Create the main executable script
cat > "$MACOS_DIR/LightWorks" << 'EOF'
#!/bin/bash

# LightWorks Launcher Script
# This script runs inside the .app bundle

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
PROJECT_DIR="$APP_DIR/Contents/Resources/Project"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to show error dialog
show_error() {
    osascript -e "display dialog \"$1\" buttons {\"OK\"} default button \"OK\" with icon stop"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔄 Killing existing processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    show_error "LightWorks project not found. Please ensure the app bundle is complete."
    exit 1
fi

cd "$PROJECT_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    show_error "package.json not found in project directory."
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        show_error "Failed to install dependencies. Please check your Node.js installation."
        exit 1
    fi
fi

# Check for port conflicts and clean up
if ! check_port 3006; then
    echo -e "${YELLOW}⚠️  Port 3006 is already in use. Cleaning up...${NC}"
    kill_port 3006
    sleep 2
fi

echo -e "${BLUE}🚀 Starting LightWorks...${NC}"

# Start Vite dev server in background
echo -e "${BLUE}🔄 Starting Vite dev server...${NC}"
npm run dev &
VITE_PID=$!

# Wait for Vite to be ready
echo -e "${YELLOW}⏳ Waiting for Vite dev server to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3006 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Vite dev server is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Timeout waiting for Vite dev server${NC}"
        kill $VITE_PID 2>/dev/null
        show_error "Failed to start Vite dev server. Please check for port conflicts."
        exit 1
    fi
    sleep 1
    echo -n "."
done

echo ""
echo -e "${BLUE}🚀 Starting Electron application...${NC}"

# Start Electron
npm run electron-only &
ELECTRON_PID=$!

# Wait for both processes
wait $VITE_PID $ELECTRON_PID

# Capture the exit code
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    show_error "LightWorks encountered an error (code: $EXIT_CODE)"
fi
EOF

# Make the script executable
chmod +x "$MACOS_DIR/LightWorks"

echo -e "${BLUE}📦 Copying project files to app bundle...${NC}"

# Copy the entire project to Resources/Project
cp -r . "$RESOURCES_DIR/Project/"

# Remove unnecessary files from the copied project
rm -rf "$RESOURCES_DIR/Project/node_modules"
rm -rf "$RESOURCES_DIR/Project/dist"
rm -rf "$RESOURCES_DIR/Project/.git"
rm -rf "$RESOURCES_DIR/Project/$APP_BUNDLE"

# Create a simple icon (using a system icon for now)
echo -e "${BLUE}🎨 Setting up app icon...${NC}"
cp /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/DeveloperFolderIcon.icns "$RESOURCES_DIR/app.icns" 2>/dev/null || true

# Update Info.plist with icon
if [ -f "$RESOURCES_DIR/app.icns" ]; then
    # Add icon reference to Info.plist
    sed -i '' '/<key>NSRequiresAquaSystemAppearance<\/key>/a\
    <key>CFBundleIconFile</key>\
    <string>app</string>' "$BUNDLE_DIR/Info.plist"
fi

echo ""
echo -e "${GREEN}✅ LightWorks.app bundle created successfully!${NC}"
echo ""
echo -e "${BLUE}📁 App bundle location: $(pwd)/$APP_BUNDLE${NC}"
echo -e "${BLUE}📁 Project location: $(pwd)/$APP_BUNDLE/Contents/Resources/Project${NC}"
echo ""
echo -e "${YELLOW}💡 To use this app bundle:${NC}"
echo -e "${YELLOW}   1. Double-click LightWorks.app to run${NC}"
echo -e "${YELLOW}   2. The app will automatically install dependencies on first run${NC}"
echo -e "${YELLOW}   3. Copy the entire .app bundle to deploy to other computers${NC}"
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    Bundle Creation Complete!                 ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"


