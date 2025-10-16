// TypeScript declarations for Electron API
declare global {
  interface Window {
    electronAPI: {
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
      readdir: (dirPath: string) => Promise<{ success: boolean; files?: string[]; error?: string }>
      mkdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>
      stat: (filePath: string) => Promise<{ success: boolean; isDirectory?: boolean; mtime?: Date; error?: string }>
      exists: (filePath: string) => Promise<{ success: boolean; exists?: boolean; error?: string }>
      showSaveDialog: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>
      showOpenDialog: (options?: any) => Promise<{ canceled: boolean; filePaths?: string[] }>
      showDirectoryDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>
      platform: string
      isElectron: boolean
      getHomeDir: () => Promise<string>
    }
    api: {
      createExperiment: (name?: string, config?: any) => Promise<{ filePath: string }>
      getExperimentsDir: () => Promise<string>
      openExperimentsFolder: () => Promise<string>
    }
  }
}

export {}
