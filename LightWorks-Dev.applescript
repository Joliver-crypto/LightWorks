-- LightWorks Launcher
-- This AppleScript creates a desktop application that launches LightWorks

tell application "Terminal"
    activate
    set currentTab to do script "cd '/Users/justinoliver/LightWorks' && ./dev-launcher.sh"
    set custom title of currentTab to "LightWorks"
    set background color of currentTab to {0, 0, 0}
    set cursor color of currentTab to {65535, 65535, 65535}
end tell
