/**
 * Cross-platform utility functions for LightWorks
 * Provides OS-agnostic alternatives to platform-specific commands
 */

const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Check if a port is available (cross-platform)
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available
 */
async function isPortAvailable(port) {
  try {
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows: use netstat
      const { stdout } = await execAsync(`netstat -an | findstr :${port}`);
      return !stdout.includes(`:${port}`);
    } else {
      // macOS/Linux: use lsof or netstat
      try {
        const { stdout } = await execAsync(`lsof -i :${port}`);
        return stdout.trim() === '';
      } catch (error) {
        // Fallback to netstat if lsof is not available
        try {
          const { stdout } = await execAsync(`netstat -an | grep :${port}`);
          return !stdout.includes(`:${port}`);
        } catch (netstatError) {
          console.warn('Could not check port availability:', netstatError.message);
          return true; // Assume available if we can't check
        }
      }
    }
  } catch (error) {
    console.warn('Port check failed:', error.message);
    return true; // Assume available if check fails
  }
}

/**
 * Kill processes on a specific port (cross-platform)
 * @param {number} port - Port number
 * @returns {Promise<void>}
 */
async function killPort(port) {
  try {
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows: use netstat and taskkill
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n').filter(line => line.includes(`:${port}`));
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          try {
            await execAsync(`taskkill /PID ${pid} /F`);
            console.log(`Killed process ${pid} on port ${port}`);
          } catch (killError) {
            console.warn(`Could not kill process ${pid}:`, killError.message);
          }
        }
      }
    } else {
      // macOS/Linux: use lsof and kill
      try {
        const { stdout } = await execAsync(`lsof -ti :${port}`);
        const pids = stdout.trim().split('\n').filter(pid => pid && !isNaN(pid));
        
        for (const pid of pids) {
          try {
            await execAsync(`kill -9 ${pid}`);
            console.log(`Killed process ${pid} on port ${port}`);
          } catch (killError) {
            console.warn(`Could not kill process ${pid}:`, killError.message);
          }
        }
      } catch (lsofError) {
        // Fallback to netstat and kill
        try {
          const { stdout } = await execAsync(`netstat -tulpn | grep :${port}`);
          const lines = stdout.split('\n').filter(line => line.includes(`:${port}`));
          
          for (const line of lines) {
            const match = line.match(/\s+(\d+)\s+/);
            if (match) {
              const pid = match[1];
              try {
                await execAsync(`kill -9 ${pid}`);
                console.log(`Killed process ${pid} on port ${port}`);
              } catch (killError) {
                console.warn(`Could not kill process ${pid}:`, killError.message);
              }
            }
          }
        } catch (netstatError) {
          console.warn('Could not kill processes on port:', netstatError.message);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to kill processes on port:', error.message);
  }
}

/**
 * Check if a URL is accessible (cross-platform)
 * @param {string} url - URL to check
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if URL is accessible
 */
async function isUrlAccessible(url, timeout = 5000) {
  try {
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows: use PowerShell
      const { stdout } = await execAsync(`powershell -Command "try { Invoke-WebRequest -Uri '${url}' -TimeoutSec ${timeout/1000} -UseBasicParsing | Out-Null; Write-Output 'true' } catch { Write-Output 'false' }"`);
      return stdout.trim() === 'true';
    } else {
      // macOS/Linux: use curl
      try {
        await execAsync(`curl -s --max-time ${timeout/1000} "${url}"`);
        return true;
      } catch (curlError) {
        // Fallback to wget if curl is not available
        try {
          await execAsync(`wget --timeout=${timeout/1000} --tries=1 -q --spider "${url}"`);
          return true;
        } catch (wgetError) {
          return false;
        }
      }
    }
  } catch (error) {
    console.warn('URL accessibility check failed:', error.message);
    return false;
  }
}

/**
 * Show a system notification (cross-platform)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - 'info', 'warning', or 'error'
 * @returns {Promise<void>}
 */
async function showNotification(title, message, type = 'info') {
  try {
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows: use PowerShell
      const icon = type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information';
      await execAsync(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message}', '${title}', 'OK', '${icon}')"`);
    } else if (platform === 'darwin') {
      // macOS: use osascript
      const icon = type === 'error' ? 'stop' : type === 'warning' ? 'caution' : 'note';
      await execAsync(`osascript -e "display dialog \\"${message}\\" buttons {\\"OK\\"} default button \\"OK\\" with icon ${icon}"`);
    } else {
      // Linux: use notify-send or zenity
      try {
        await execAsync(`notify-send "${title}" "${message}"`);
      } catch (notifyError) {
        try {
          const icon = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info';
          await execAsync(`zenity --${icon} --title="${title}" --text="${message}"`);
        } catch (zenityError) {
          console.log(`${title}: ${message}`);
        }
      }
    }
  } catch (error) {
    console.warn('Could not show notification:', error.message);
    console.log(`${title}: ${message}`);
  }
}

/**
 * Get the appropriate command for the current platform
 * @param {Object} commands - Object with platform-specific commands
 * @returns {string} - Command for current platform
 */
function getPlatformCommand(commands) {
  const platform = os.platform();
  
  if (platform === 'win32') {
    return commands.win32 || commands.default;
  } else if (platform === 'darwin') {
    return commands.darwin || commands.default;
  } else {
    return commands.linux || commands.default;
  }
}

module.exports = {
  isPortAvailable,
  killPort,
  isUrlAccessible,
  showNotification,
  getPlatformCommand
};


