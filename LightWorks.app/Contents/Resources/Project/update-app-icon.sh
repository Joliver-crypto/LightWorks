#!/bin/bash

# Script to update the LightWorks Dev app icon
# Usage: ./update-app-icon.sh /path/to/your/icon.icns

if [ $# -eq 0 ]; then
    echo "Usage: $0 /path/to/your/icon.icns"
    echo ""
    echo "This script will replace the current icon of the LightWorks Dev app"
    echo "with your custom icon file."
    echo ""
    echo "Example:"
    echo "  $0 ~/Downloads/my-custom-icon.icns"
    exit 1
fi

ICON_PATH="$1"
APP_PATH="$HOME/Desktop/LightWorks Dev.app"
TARGET_ICON="$APP_PATH/Contents/Resources/applet.icns"

# Check if the app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Error: LightWorks Dev.app not found on Desktop"
    exit 1
fi

# Check if the icon file exists
if [ ! -f "$ICON_PATH" ]; then
    echo "❌ Error: Icon file not found: $ICON_PATH"
    exit 1
fi

# Check if it's an .icns file
if [[ "$ICON_PATH" != *.icns ]]; then
    echo "⚠️  Warning: The file doesn't have .icns extension"
    echo "   Make sure it's a valid macOS icon file"
fi

# Copy the new icon
echo "🔄 Updating icon..."
cp "$ICON_PATH" "$TARGET_ICON"

if [ $? -eq 0 ]; then
    echo "✅ Icon updated successfully!"
    echo "   You may need to restart Finder or log out/in to see the changes"
    
    # Try to refresh the icon cache
    echo "🔄 Refreshing icon cache..."
    touch "$APP_PATH"
    killall Finder 2>/dev/null || true
    
    echo "✅ Done! Check your Desktop for the updated icon."
else
    echo "❌ Failed to update icon"
    exit 1
fi
