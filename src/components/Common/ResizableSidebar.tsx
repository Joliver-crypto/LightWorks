import { useState, useRef, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface ResizableSidebarProps {
  children: React.ReactNode
  side: 'left' | 'right'
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  collapsedWidth?: number
  onWidthChange: (width: number) => void
  onToggle: () => void
  isCollapsed: boolean
  className?: string
}

export function ResizableSidebar({
  children,
  side,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 300,
  collapsedWidth = 0,
  onWidthChange,
  onToggle,
  isCollapsed,
  className
}: ResizableSidebarProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(isCollapsed ? collapsedWidth : defaultWidth)
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = side === 'left' ? e.clientX - startX : startX - e.clientX
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
      
      if (newWidth <= minWidth + 20) {
        // Close sidebar if dragged too far
        onWidthChange(collapsedWidth)
      } else {
        onWidthChange(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [side, startX, startWidth, minWidth, maxWidth, collapsedWidth, defaultWidth, onWidthChange])

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle()
  }, [onToggle])

  return (
    <div
      ref={sidebarRef}
      className={clsx(
        'relative bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ease-in-out',
        side === 'right' && 'border-l border-r-0',
        isCollapsed && 'overflow-hidden',
        className
      )}
      style={{ 
        width: isCollapsed ? collapsedWidth : defaultWidth,
        minWidth: isCollapsed ? collapsedWidth : minWidth
      }}
    >
      {/* Resize handle */}
      <div
        className={clsx(
          'absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-brand-500 hover:opacity-50 transition-colors',
          side === 'left' ? 'right-0' : 'left-0',
          isResizing && 'bg-brand-500'
        )}
        onMouseDown={handleMouseDown}
      />
      
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className={clsx(
          'absolute top-4 z-10 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all',
          side === 'left' 
            ? (isCollapsed ? 'right-3' : 'right-3') 
            : (isCollapsed ? 'left-3' : 'left-3')
        )}
        title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        {side === 'left' ? (
          isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          )
        ) : (
          isCollapsed ? (
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          )
        )}
      </button>

      {/* Sidebar content */}
      <div className={clsx(
        'flex-1 flex flex-col',
        isCollapsed && 'opacity-0 pointer-events-none'
      )}>
        {children}
      </div>
    </div>
  )
}


