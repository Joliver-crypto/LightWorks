const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  readdir: (dirPath) => ipcRenderer.invoke('readdir', dirPath),
  mkdir: (dirPath) => ipcRenderer.invoke('mkdir', dirPath),
  stat: (filePath) => ipcRenderer.invoke('stat', filePath),
  exists: (filePath) => ipcRenderer.invoke('exists', filePath),
  
  // Dialog operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showDirectoryDialog: () => ipcRenderer.invoke('show-directory-dialog'),
  
  // Platform info
  platform: process.platform,
  isElectron: true,
  getHomeDir: () => ipcRenderer.invoke('get-home-dir')
})

// Experiments API
contextBridge.exposeInMainWorld('api', {
  createExperiment: (name, config) => {
    console.log('Preload: createExperiment called with', { name, config });
    return ipcRenderer.invoke('experiments:create', { name, config });
  },
  
  getExperimentsDir: () => {
    console.log('Preload: getExperimentsDir called');
    return ipcRenderer.invoke('experiments:get-dir');
  },
  
  openExperimentsFolder: () => {
    console.log('Preload: openExperimentsFolder called');
    return ipcRenderer.invoke('experiments:open-dir');
  }
})

// Debug: Log what we're exposing
console.log('Preload: Exposed electronAPI and api to window');
