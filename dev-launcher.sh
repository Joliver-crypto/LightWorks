#!/bin/bash

# LightWorks Development Launcher
# This script runs both the Vite dev server and Electron in one command

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Clear screen and show header
clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    LightWorks Development                   ║${NC}"
echo -e "${PURPLE}║                    Starting Environment...                 ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this from the LightWorks project directory.${NC}"
    echo -e "${YELLOW}Current directory: $(pwd)${NC}"
    echo -e "${YELLOW}Press any key to close this window...${NC}"
    read -n 1 -s
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install first...${NC}"
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ npm install failed. Please check your Node.js installation.${NC}"
        echo -e "${YELLOW}Press any key to close this window...${NC}"
        read -n 1 -s
        exit 1
    fi
    echo ""
fi

# Check for port conflicts and clean up
echo -e "${BLUE}🔍 Checking for port conflicts...${NC}"
if ! check_port 3006; then
    echo -e "${YELLOW}⚠️  Port 3006 is already in use. Cleaning up...${NC}"
    kill_port 3006
    sleep 2
fi

echo -e "${BLUE}🚀 Starting LightWorks Development Environment...${NC}"
echo -e "${CYAN}   • Vite dev server (http://localhost:3006)${NC}"
echo -e "${CYAN}   • Electron application${NC}"
echo ""
echo -e "${YELLOW}💡 Press Ctrl+C to stop both processes${NC}"
echo -e "${YELLOW}💡 This window will stay open to show any errors${NC}"
echo ""

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
        echo -e "${YELLOW}Press any key to close this window...${NC}"
        read -n 1 -s
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

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${PURPLE}║${GREEN} ✅ Development environment stopped successfully${NC}${PURPLE} ║${NC}"
else
    echo -e "${PURPLE}║${RED} ❌ Development environment stopped with error code: $EXIT_CODE${NC}${PURPLE} ║${NC}"
fi
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Press any key to close this window...${NC}"
read -n 1 -s
