#!/bin/bash

# LightWorks Linux AppImage Creator
# This script creates a Linux AppImage for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║              LightWorks Linux AppImage Creator              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this from the LightWorks project directory.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Node.js is not installed. Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"

# Check if npm is installed
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: npm is not installed.${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm installed: v$NPM_VERSION${NC}"

echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Create Linux AppImage
echo -e "${BLUE}📦 Creating Linux AppImage...${NC}"
npm run dist
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ AppImage creation failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Linux AppImage created successfully!${NC}"
echo ""
echo -e "${BLUE}📁 AppImage location: dist-electron/${NC}"
echo ""
echo -e "${YELLOW}💡 To deploy to Linux lab computers:${NC}"
echo -e "${YELLOW}   1. Copy the .AppImage file from dist-electron/${NC}"
echo -e "${YELLOW}   2. Make it executable: chmod +x LightWorks-*.AppImage${NC}"
echo -e "${YELLOW}   3. Run: ./LightWorks-*.AppImage${NC}"
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    AppImage Created!                        ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"


