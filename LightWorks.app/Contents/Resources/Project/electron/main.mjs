import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import { promises as fs } from 'fs'
import fsSync from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
import { SerialPort } from 'serialport'
// Import path utilities - we'll implement them inline for now
// import { nextUniqueExperimentPath, getExperimentsDir } from './utils/paths.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Serial port management
let serialPort = null
let isSerialConnected = false

// Path utilities
function getDocumentsDir() {
  try { 
    return app.getPath('documents'); 
  } catch { 
    return app.getPath('home'); 
  }
}

function getExperimentsDir() {
  const custom = process.env.LIGHTWORKS_EXPERIMENTS_DIR?.trim();
  if (custom && custom.length > 0) {
    fsSync.mkdirSync(custom, { recursive: true });
    return custom;
  }
  
  // Use the project's local Experiments folder
  const projectRoot = path.join(__dirname, '..');
  const experimentsDir = path.join(projectRoot, 'Experiments');
  fsSync.mkdirSync(experimentsDir, { recursive: true });
  return experimentsDir;
}

function sanitizeFileName(name) {
  const safe = (name || 'Untitled').replace(/[\/\\?%*:|"<>]/g, '-').trim();
  return safe.length ? safe : 'Untitled';
}

function nextUniqueExperimentPath(baseName) {
  const dir = getExperimentsDir();
  const root = sanitizeFileName(baseName);
  let candidate = path.join(dir, `${root}.lightworks`);
  let i = 1;
  while (fsSync.existsSync(candidate)) {
    const n = String(i).padStart(2, '0');
    candidate = path.join(dir, `${root}-${n}.lightworks`);
    i++;
  }
  return candidate;
}

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // macOS style
    show: false // Don't show until ready
  })

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3006')
    
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// File system operations for Electron
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('readdir', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath)
    return { success: true, files }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('mkdir', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('stat', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath)
    return { 
      success: true, 
      isDirectory: stats.isDirectory(),
      mtime: stats.mtime
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('exists', async (event, filePath) => {
  try {
    await fs.access(filePath)
    return { success: true, exists: true }
  } catch (error) {
    return { success: true, exists: false }
  }
})

ipcMain.handle('show-save-dialog', async (event, options = {}) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'LightWorks Files', extensions: ['lightworks'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    defaultPath: options.defaultPath || 'experiment.lightworks',
    ...options
  })
  return result
})

ipcMain.handle('show-open-dialog', async (event, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'LightWorks Files', extensions: ['lightworks'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile'],
    ...options
  })
  return result
})

ipcMain.handle('show-directory-dialog', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result
})

ipcMain.handle('get-home-dir', async () => {
  return os.homedir()
})

// Experiments API
ipcMain.handle('experiments:create', async (_evt, args) => {
  const filePath = nextUniqueExperimentPath(args?.name || 'Untitled');
  const now = new Date().toISOString();
  const payload = {
    schemaVersion: 1,
    createdAt: now,
    name: args?.name || 'Untitled',
    config: {
      ...args?.config ?? {},
      lastSaved: now
    },
  };
  fsSync.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  return { filePath };
});

ipcMain.handle('experiments:get-dir', async () => getExperimentsDir());

ipcMain.handle('experiments:open-dir', async () => {
  const dir = getExperimentsDir();
  await shell.openPath(dir);
  return dir;
});

// Serial communication handlers
ipcMain.handle('connect-serial', async (event, options = {}) => {
  try {
    // Close existing connection if any
    if (serialPort && isSerialConnected) {
      await serialPort.close()
      serialPort = null
      isSerialConnected = false
    }

    // Find available ports
    const ports = await SerialPort.list()
    console.log('Available serial ports:', ports)

    // Find Arduino port (look for common Arduino identifiers)
    let targetPort = null
    if (options.port && options.port !== 'auto') {
      targetPort = options.port
    } else {
      // Auto-detect Arduino port
      const arduinoPort = ports.find(port => 
        port.manufacturer?.toLowerCase().includes('arduino') ||
        port.productId?.toLowerCase().includes('arduino') ||
        port.vendorId?.toLowerCase().includes('arduino') ||
        port.friendlyName?.toLowerCase().includes('arduino')
      )
      
      if (arduinoPort) {
        targetPort = arduinoPort.path
      } else if (ports.length > 0) {
        // Fallback to first available port
        targetPort = ports[0].path
      }
    }

    if (!targetPort) {
      return { success: false, error: 'No serial ports found' }
    }

    // Create serial port connection
    serialPort = new SerialPort({
      path: targetPort,
      baudRate: options.baudRate || 9600,
      autoOpen: false,
      // Disable DTR/RTS to prevent Arduino resets
      dtr: false,
      rts: false
    })

    // Set up event handlers
    serialPort.on('open', () => {
      console.log('Serial port opened:', targetPort)
      isSerialConnected = true
    })

    serialPort.on('error', (err) => {
      console.error('Serial port error:', err)
      isSerialConnected = false
    })

    serialPort.on('close', () => {
      console.log('Serial port closed')
      isSerialConnected = false
    })

    // Open the port
    await new Promise((resolve, reject) => {
      serialPort.open((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

    return { 
      success: true, 
      port: targetPort,
      message: `Connected to Arduino on ${targetPort}`
    }

  } catch (error) {
    console.error('Serial connection failed:', error)
    return { 
      success: false, 
      error: `Failed to connect to Arduino: ${error.message}` 
    }
  }
})

ipcMain.handle('send-serial-command', async (event, command) => {
  try {
    if (!serialPort || !isSerialConnected) {
      return { 
        success: false, 
        error: 'Arduino not connected' 
      }
    }

    // Send command to Arduino
    const commandWithNewline = command + '\n'
    
    return new Promise((resolve) => {
      let response = ''
      let timeout = null

      // Set up response handler
      const dataHandler = (data) => {
        response += data.toString()
        
        // Clear timeout and resolve if we get a complete response
        if (response.includes('OK') || response.includes('ERROR')) {
          if (timeout) clearTimeout(timeout)
          serialPort.removeListener('data', dataHandler)
          resolve({
            success: !response.includes('ERROR'),
            response: response.trim(),
            data: { command, response: response.trim() }
          })
        }
      }

      // Set up timeout
      timeout = setTimeout(() => {
        serialPort.removeListener('data', dataHandler)
        resolve({
          success: false,
          error: 'Command timeout - no response from Arduino'
        })
      }, 5000) // 5 second timeout

      // Listen for response
      serialPort.on('data', dataHandler)

      // Send command
      serialPort.write(commandWithNewline, (err) => {
        if (err) {
          if (timeout) clearTimeout(timeout)
          serialPort.removeListener('data', dataHandler)
          resolve({
            success: false,
            error: `Failed to send command: ${err.message}`
          })
        }
      })
    })

  } catch (error) {
    console.error('Serial command failed:', error)
    return { 
      success: false, 
      error: `Command failed: ${error.message}` 
    }
  }
})

ipcMain.handle('disconnect-serial', async () => {
  try {
    if (serialPort && isSerialConnected) {
      await serialPort.close()
      serialPort = null
      isSerialConnected = false
      return { success: true, message: 'Arduino disconnected' }
    }
    return { success: true, message: 'Already disconnected' }
  } catch (error) {
    return { success: false, error: `Disconnect failed: ${error.message}` }
  }
})

// App event handlers
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
  })
})
