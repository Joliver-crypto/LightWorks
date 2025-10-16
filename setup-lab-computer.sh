#!/bin/bash

# LightWorks Lab Computer Setup Script
# This script sets up LightWorks on a lab computer with GitHub integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║              LightWorks Lab Computer Setup                  ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
LIGHTWORKS_DIR="$HOME/LightWorks"
GITHUB_REPO="https://github.com/your-username/LightWorks.git"  # Update this with your actual repo
BRANCH="main"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to show error dialog (macOS)
show_error() {
    if command_exists osascript; then
        osascript -e "display dialog \"$1\" buttons {\"OK\"} default button \"OK\" with icon stop"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

# Function to show success dialog (macOS)
show_success() {
    if command_exists osascript; then
        osascript -e "display dialog \"$1\" buttons {\"OK\"} default button \"OK\" with icon note"
    else
        echo -e "${GREEN}✅ $1${NC}"
    fi
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command_exists node; then
    show_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"

# Check if npm is installed
if ! command_exists npm; then
    show_error "npm is not installed. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm installed: v$NPM_VERSION${NC}"

# Check if Git is installed
if ! command_exists git; then
    show_error "Git is not installed. Please install Git from https://git-scm.com/"
    exit 1
fi

GIT_VERSION=$(git --version)
echo -e "${GREEN}✅ Git installed: $GIT_VERSION${NC}"

echo ""

# Create or update LightWorks directory
if [ -d "$LIGHTWORKS_DIR" ]; then
    echo -e "${BLUE}🔄 Updating existing LightWorks installation...${NC}"
    cd "$LIGHTWORKS_DIR"
    
    # Check if it's a git repository
    if [ -d ".git" ]; then
        echo -e "${BLUE}📥 Pulling latest changes from GitHub...${NC}"
        git pull origin "$BRANCH"
    else
        echo -e "${YELLOW}⚠️  Directory exists but is not a git repository. Removing and cloning fresh...${NC}"
        cd ..
        rm -rf "$LIGHTWORKS_DIR"
        git clone "$GITHUB_REPO" "$LIGHTWORKS_DIR"
        cd "$LIGHTWORKS_DIR"
    fi
else
    echo -e "${BLUE}📥 Cloning LightWorks from GitHub...${NC}"
    git clone "$GITHUB_REPO" "$LIGHTWORKS_DIR"
    cd "$LIGHTWORKS_DIR"
fi

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    show_error "Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Create the app bundle
echo -e "${BLUE}🔨 Creating LightWorks.app bundle...${NC}"
if [ -f "./create-app-bundle.sh" ]; then
    chmod +x ./create-app-bundle.sh
    ./create-app-bundle.sh
else
    echo -e "${YELLOW}⚠️  create-app-bundle.sh not found. Creating basic launcher...${NC}"
    
    # Create a simple launcher script
    cat > "$HOME/Desktop/LightWorks.command" << EOF
#!/bin/bash
cd "$LIGHTWORKS_DIR"
./dev-launcher.sh
EOF
    chmod +x "$HOME/Desktop/LightWorks.command"
fi

# Create update script
echo -e "${BLUE}📝 Creating update script...${NC}"
cat > "$LIGHTWORKS_DIR/update-lightworks.sh" << 'EOF'
#!/bin/bash

# LightWorks Update Script
# Run this script to update LightWorks to the latest version

set -e

LIGHTWORKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$LIGHTWORKS_DIR"

echo "🔄 Updating LightWorks..."

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild if needed
if [ -f "package.json" ]; then
    echo "🔨 Rebuilding application..."
    npm run build
fi

echo "✅ LightWorks updated successfully!"
echo "🚀 You can now run LightWorks.app or ./dev-launcher.sh"
EOF

chmod +x "$LIGHTWORKS_DIR/update-lightworks.sh"

# Create desktop shortcut
echo -e "${BLUE}🔗 Creating desktop shortcut...${NC}"
if [ -f "$LIGHTWORKS_DIR/LightWorks.app" ]; then
    # Copy app bundle to desktop
    cp -r "$LIGHTWORKS_DIR/LightWorks.app" "$HOME/Desktop/"
    echo -e "${GREEN}✅ LightWorks.app copied to Desktop${NC}"
else
    # Create command file
    cat > "$HOME/Desktop/LightWorks.command" << EOF
#!/bin/bash
cd "$LIGHTWORKS_DIR"
./dev-launcher.sh
EOF
    chmod +x "$HOME/Desktop/LightWorks.command"
    echo -e "${GREEN}✅ LightWorks.command created on Desktop${NC}"
fi

echo ""
echo -e "${GREEN}🎉 LightWorks setup complete!${NC}"
echo ""
echo -e "${BLUE}📁 Installation directory: $LIGHTWORKS_DIR${NC}"
echo -e "${BLUE}🖥️  Desktop shortcut: $HOME/Desktop/LightWorks.app${NC}"
echo ""
echo -e "${YELLOW}💡 To run LightWorks:${NC}"
echo -e "${YELLOW}   • Double-click LightWorks.app on your Desktop${NC}"
echo -e "${YELLOW}   • Or run: cd $LIGHTWORKS_DIR && ./dev-launcher.sh${NC}"
echo ""
echo -e "${YELLOW}🔄 To update LightWorks:${NC}"
echo -e "${YELLOW}   • Run: cd $LIGHTWORKS_DIR && ./update-lightworks.sh${NC}"
echo -e "${YELLOW}   • Or just run the update script from the Desktop${NC}"
echo ""

# Create update script on desktop too
cat > "$HOME/Desktop/Update-LightWorks.command" << EOF
#!/bin/bash
cd "$LIGHTWORKS_DIR"
./update-lightworks.sh
read -p "Press Enter to continue..."
EOF
chmod +x "$HOME/Desktop/Update-LightWorks.command"

show_success "LightWorks has been successfully installed and configured!"


