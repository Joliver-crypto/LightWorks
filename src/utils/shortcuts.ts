// Keyboard shortcuts and command palette utilities

export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
}

// Common keyboard shortcuts
export const SHORTCUTS = {
  // File operations
  NEW: 'Ctrl+N',
  OPEN: 'Ctrl+O',
  SAVE: 'Ctrl+S',
  SAVE_AS: 'Ctrl+Shift+S',
  
  // Edit operations
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Shift+Z',
  CUT: 'Ctrl+X',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  DELETE: 'Delete',
  DUPLICATE: 'Ctrl+D',
  
  // View operations
  ZOOM_IN: 'Ctrl+=',
  ZOOM_OUT: 'Ctrl+-',
  ZOOM_FIT: 'Ctrl+0',
  ZOOM_100: 'Ctrl+1',
  TOGGLE_GRID: 'Ctrl+G',
  TOGGLE_SNAP: 'Ctrl+Shift+S',
  TOGGLE_LEFT_SIDEBAR: 'Ctrl+B',
  TOGGLE_RIGHT_SIDEBAR: 'Ctrl+Shift+B',
  
  // Selection
  SELECT_ALL: 'Ctrl+A',
  DESELECT: 'Escape',
  
  // Device operations
  ROTATE: 'R',
  ROTATE_REVERSE: 'Shift+R',
  
  // Command palette
  COMMAND_PALETTE: 'Ctrl+K',
  
  // Workflow
  RUN_WORKFLOW: 'F5',
  STOP_WORKFLOW: 'Escape',
  PAUSE_WORKFLOW: 'F6',
} as const

// Parse keyboard event to shortcut string
export function parseShortcut(event: KeyboardEvent): string {
  const parts: string[] = []
  
  if (event.ctrlKey) parts.push('Ctrl')
  if (event.shiftKey) parts.push('Shift')
  if (event.altKey) parts.push('Alt')
  if (event.metaKey) parts.push('Meta')
  
  // Normalize key names
  let key = event.key
  if (key === ' ') key = 'Space'
  if (key === 'ArrowUp') key = 'Up'
  if (key === 'ArrowDown') key = 'Down'
  if (key === 'ArrowLeft') key = 'Left'
  if (key === 'ArrowRight') key = 'Right'
  
  parts.push(key)
  
  return parts.join('+')
}

// Check if event matches shortcut
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const eventShortcut = parseShortcut(event)
  return eventShortcut === shortcut
}

// Create shortcut handler
export function createShortcutHandler(shortcuts: Record<string, () => void>) {
  return (event: KeyboardEvent) => {
    const shortcut = parseShortcut(event)
    const handler = shortcuts[shortcut]
    
    if (handler) {
      event.preventDefault()
      handler()
    }
  }
}

// Format shortcut for display
export function formatShortcut(shortcut: string): string {
  return shortcut
    .replace('Ctrl', '⌃')
    .replace('Shift', '⇧')
    .replace('Alt', '⌥')
    .replace('Meta', '⌘')
    .replace('Space', '␣')
    .replace('Up', '↑')
    .replace('Down', '↓')
    .replace('Left', '←')
    .replace('Right', '→')
}

// Check if platform is Mac
export function isMac(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}

// Get platform-specific shortcut
export function getPlatformShortcut(shortcut: string): string {
  if (isMac()) {
    return shortcut.replace('Ctrl', '⌘')
  }
  return shortcut
}

// Command palette item
export interface CommandPaletteItem {
  id: string
  title: string
  description?: string
  shortcut?: string
  icon?: string
  category: string
  action: () => void
}

// Default command palette items
export const DEFAULT_COMMANDS: CommandPaletteItem[] = [
  // File
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Create a new project',
    shortcut: SHORTCUTS.NEW,
    icon: '📄',
    category: 'File',
    action: () => {}
  },
  {
    id: 'open-project',
    title: 'Open Project',
    description: 'Open an existing project',
    shortcut: SHORTCUTS.OPEN,
    icon: '📂',
    category: 'File',
    action: () => {}
  },
  {
    id: 'save-project',
    title: 'Save Project',
    description: 'Save the current project',
    shortcut: SHORTCUTS.SAVE,
    icon: '💾',
    category: 'File',
    action: () => {}
  },
  
  // Edit
  {
    id: 'undo',
    title: 'Undo',
    description: 'Undo last action',
    shortcut: SHORTCUTS.UNDO,
    icon: '↶',
    category: 'Edit',
    action: () => {}
  },
  {
    id: 'redo',
    title: 'Redo',
    description: 'Redo last action',
    shortcut: SHORTCUTS.REDO,
    icon: '↷',
    category: 'Edit',
    action: () => {}
  },
  {
    id: 'duplicate',
    title: 'Duplicate',
    description: 'Duplicate selected devices',
    shortcut: SHORTCUTS.DUPLICATE,
    icon: '📋',
    category: 'Edit',
    action: () => {}
  },
  
  // View
  {
    id: 'zoom-fit',
    title: 'Fit to Screen',
    description: 'Fit all devices to screen',
    shortcut: SHORTCUTS.ZOOM_FIT,
    icon: '🔍',
    category: 'View',
    action: () => {}
  },
  {
    id: 'toggle-grid',
    title: 'Toggle Grid',
    description: 'Show/hide grid',
    shortcut: SHORTCUTS.TOGGLE_GRID,
    icon: '⊞',
    category: 'View',
    action: () => {}
  },
  {
    id: 'toggle-snap',
    title: 'Toggle Snap',
    description: 'Enable/disable grid snapping',
    shortcut: SHORTCUTS.TOGGLE_SNAP,
    icon: '🧲',
    category: 'View',
    action: () => {}
  },
  {
    id: 'toggle-left-sidebar',
    title: 'Toggle Left Sidebar',
    description: 'Show/hide left sidebar',
    shortcut: SHORTCUTS.TOGGLE_LEFT_SIDEBAR,
    icon: '📋',
    category: 'View',
    action: () => {}
  },
  {
    id: 'toggle-right-sidebar',
    title: 'Toggle Right Sidebar',
    description: 'Show/hide right sidebar',
    shortcut: SHORTCUTS.TOGGLE_RIGHT_SIDEBAR,
    icon: '📋',
    category: 'View',
    action: () => {}
  },
  
  // Workflow
  {
    id: 'run-workflow',
    title: 'Run Workflow',
    description: 'Start workflow execution',
    shortcut: SHORTCUTS.RUN_WORKFLOW,
    icon: '▶️',
    category: 'Workflow',
    action: () => {}
  },
  {
    id: 'stop-workflow',
    title: 'Stop Workflow',
    description: 'Stop workflow execution',
    shortcut: SHORTCUTS.STOP_WORKFLOW,
    icon: '⏹️',
    category: 'Workflow',
    action: () => {}
  }
]

// Search commands
export function searchCommands(commands: CommandPaletteItem[], query: string): CommandPaletteItem[] {
  if (!query.trim()) return commands
  
  const lowercaseQuery = query.toLowerCase()
  
  return commands.filter(command => 
    command.title.toLowerCase().includes(lowercaseQuery) ||
    command.description?.toLowerCase().includes(lowercaseQuery) ||
    command.category.toLowerCase().includes(lowercaseQuery)
  )
}

// Group commands by category
export function groupCommandsByCategory(commands: CommandPaletteItem[]): Record<string, CommandPaletteItem[]> {
  return commands.reduce((groups, command) => {
    if (!groups[command.category]) {
      groups[command.category] = []
    }
    groups[command.category].push(command)
    return groups
  }, {} as Record<string, CommandPaletteItem[]>)
}
