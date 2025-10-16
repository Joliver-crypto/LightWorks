@echo off
REM LightWorks Lab Computer Setup Script for Windows
REM This script sets up LightWorks on a Windows lab computer

echo ========================================
echo    LightWorks Lab Computer Setup
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as administrator - good for installation
) else (
    echo WARNING: Not running as administrator
    echo Some features may require admin privileges
)
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo Node.js is installed: 
    node --version
) else (
    echo ERROR: Node.js is not installed
    echo Please download and install Node.js from https://nodejs.org/
    echo Then run this script again
    pause
    exit /b 1
)
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo Git is installed: 
    git --version
) else (
    echo ERROR: Git is not installed
    echo Please download and install Git from https://git-scm.com/
    echo Then run this script again
    pause
    exit /b 1
)
echo.

REM Configuration
set LIGHTWORKS_DIR=%USERPROFILE%\LightWorks
set GITHUB_REPO=https://github.com/your-username/LightWorks.git
set BRANCH=main

REM Create or update LightWorks directory
if exist "%LIGHTWORKS_DIR%" (
    echo Updating existing LightWorks installation...
    cd /d "%LIGHTWORKS_DIR%"
    
    REM Check if it's a git repository
    if exist ".git" (
        echo Pulling latest changes from GitHub...
        git pull origin %BRANCH%
    ) else (
        echo Directory exists but is not a git repository. Removing and cloning fresh...
        cd /d "%USERPROFILE%"
        rmdir /s /q "%LIGHTWORKS_DIR%"
        git clone %GITHUB_REPO% "%LIGHTWORKS_DIR%"
        cd /d "%LIGHTWORKS_DIR%"
    )
) else (
    echo Cloning LightWorks from GitHub...
    git clone %GITHUB_REPO% "%LIGHTWORKS_DIR%"
    cd /d "%LIGHTWORKS_DIR%"
)

echo.
echo Installing dependencies...
npm install

if %errorLevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo Dependencies installed successfully
echo.

REM Create Windows launcher
echo Creating Windows launcher...
echo @echo off > "%USERPROFILE%\Desktop\LightWorks.bat"
echo cd /d "%LIGHTWORKS_DIR%" >> "%USERPROFILE%\Desktop\LightWorks.bat"
echo npm run dev:electron >> "%USERPROFILE%\Desktop\LightWorks.bat"

REM Create update script
echo Creating update script...
echo @echo off > "%LIGHTWORKS_DIR%\update-lightworks.bat"
echo cd /d "%LIGHTWORKS_DIR%" >> "%LIGHTWORKS_DIR%\update-lightworks.bat"
echo echo Updating LightWorks... >> "%LIGHTWORKS_DIR%\update-lightworks.bat"
echo git pull origin %BRANCH% >> "%LIGHTWORKS_DIR%\update-lightworks.bat"
echo npm install >> "%LIGHTWORKS_DIR%\update-lightworks.bat"
echo echo LightWorks updated successfully! >> "%LIGHTWORKS_DIR%\update-lightworks.bat"
echo pause >> "%LIGHTWORKS_DIR%\update-lightworks.bat"

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo LightWorks has been installed to: %LIGHTWORKS_DIR%
echo Desktop shortcut: %USERPROFILE%\Desktop\LightWorks.bat
echo.
echo To run LightWorks:
echo   1. Double-click LightWorks.bat on your Desktop
echo   2. Or run: cd %LIGHTWORKS_DIR% ^&^& npm run dev:electron
echo.
echo To update LightWorks:
echo   Run: cd %LIGHTWORKS_DIR% ^&^& update-lightworks.bat
echo.
pause


