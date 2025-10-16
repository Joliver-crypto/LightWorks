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
  getHomeDir: () => ipcRenderer.invoke('get-home-dir'),
  
  // Serial communication
  connectSerial: (options) => ipcRenderer.invoke('connect-serial', options),
  sendSerialCommand: (command) => ipcRenderer.invoke('send-serial-command', command),
  disconnectSerial: () => ipcRenderer.invoke('disconnect-serial')
})

// Experiments API
contextBridge.exposeInMainWorld('api', {
  createExperiment: (name, config) => 
    ipcRenderer.invoke('experiments:create', { name, config }),
  
  getExperimentsDir: () => 
    ipcRenderer.invoke('experiments:get-dir'),
  
  openExperimentsFolder: () => 
    ipcRenderer.invoke('experiments:open-dir')
})
