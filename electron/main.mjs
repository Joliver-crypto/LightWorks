import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import { promises as fs } from 'fs'
import fsSync from 'fs'
import os from 'os'
import { fileURLToPath } from 'url'
// Import path utilities - we'll implement them inline for now
// import { nextUniqueExperimentPath, getExperimentsDir } from './utils/paths.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

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
  const base = custom && custom.length > 0
    ? custom
    : path.join(getDocumentsDir(), 'LightWorks', 'Experiments');
  fsSync.mkdirSync(base, { recursive: true });
  return base;
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
    mainWindow.loadURL('http://localhost:3005')
    
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
  const payload = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    name: args?.name || 'Untitled',
    config: args?.config ?? {},
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
