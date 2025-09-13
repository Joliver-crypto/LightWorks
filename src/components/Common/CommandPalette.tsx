import { useState, useEffect, useRef } from 'react'
import { 
  MagnifyingGlassIcon,
  CommandLineIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Dialog } from './Dialog'
// import { Button } from './Button'
import { DEFAULT_COMMANDS, searchCommands, groupCommandsByCategory } from '../../utils/shortcuts'
import { clsx } from 'clsx'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCommands = searchCommands(DEFAULT_COMMANDS, query)
  const groupedCommands = groupCommandsByCategory(filteredCommands)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setQuery('')
    setSelectedIndex(0)
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          event.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleCommandClick = (command: typeof DEFAULT_COMMANDS[0]) => {
    command.action()
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Commands list */}
        <div className="max-h-96 overflow-y-auto" ref={listRef}>
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CommandLineIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No commands found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                  {category}
                </h4>
                <div className="space-y-1">
                  {commands.map((command) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === command.id)
                    const isSelected = globalIndex === selectedIndex
                    
                    return (
                      <button
                        key={command.id}
                        data-index={globalIndex}
                        onClick={() => handleCommandClick(command)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors',
                          isSelected
                            ? 'bg-brand-50 text-brand-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <div className="flex-shrink-0">
                          {command.icon && (
                            <span className="text-lg">{command.icon}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{command.title}</div>
                          {command.description && (
                            <div className="text-sm text-gray-500 truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                        
                        {command.shortcut && (
                          <div className="flex-shrink-0 text-xs text-gray-400 font-mono">
                            {command.shortcut}
                          </div>
                        )}
                        
                        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>⎋ Close</span>
          </div>
          <div>
            {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
