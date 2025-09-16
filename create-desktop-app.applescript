-- Script to create the LightWorks Development desktop application
-- This will compile the AppleScript into a proper .app bundle

set scriptPath to POSIX path of (path to me)
set projectDir to text 1 thru -25 of scriptPath -- Remove the script filename
set launcherScript to projectDir & "dev-launcher.sh"
set applescriptFile to projectDir & "LightWorks-Dev.applescript"

-- Check if the launcher script exists
try
    do shell script "test -f " & quoted form of launcherScript
on error
    display dialog "Error: dev-launcher.sh not found at " & launcherScript buttons {"OK"} default button "OK"
    return
end try

-- Check if the AppleScript file exists
try
    do shell script "test -f " & quoted form of applescriptFile
on error
    display dialog "Error: LightWorks-Dev.applescript not found at " & applescriptFile buttons {"OK"} default button "OK"
    return
end try

-- Create the application bundle
set appPath to (path to desktop as string) & "LightWorks Dev.app"
set appPathPOSIX to POSIX path of appPath

try
    -- Remove existing app if it exists
    do shell script "rm -rf " & quoted form of appPathPOSIX
    
    -- Compile the AppleScript into an application
    do shell script "osacompile -o " & quoted form of appPathPOSIX & " " & quoted form of applescriptFile
    
    -- Set the application icon (using a system icon for now)
    do shell script "cp /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/DeveloperFolderIcon.icns " & quoted form of appPathPOSIX & "/Contents/Resources/applet.icns"
    
    display dialog "✅ LightWorks Development app created successfully on your Desktop!" & return & return & "The app will:" & return & "• Start both Vite dev server and Electron" & return & "• Show error codes if anything fails" & return & "• Keep the terminal open for debugging" buttons {"OK"} default button "OK"
    
on error errorMessage
    display dialog "Error creating application: " & errorMessage buttons {"OK"} default button "OK"
end try
