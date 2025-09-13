import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
  className?: string
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 500,
  disabled = false,
  className 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = () => {
    if (disabled) return
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        // const tooltipRect = tooltipRef.current?.getBoundingClientRect()
        
        let x = 0
        let y = 0
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2
            y = rect.top - 8
            break
          case 'bottom':
            x = rect.left + rect.width / 2
            y = rect.bottom + 8
            break
          case 'left':
            x = rect.left - 8
            y = rect.top + rect.height / 2
            break
          case 'right':
            x = rect.right + 8
            y = rect.top + rect.height / 2
            break
        }
        
        setTooltipPosition({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTooltipClasses = () => {
    const baseClasses = 'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none whitespace-nowrap'
    
    const positionClasses = {
      top: 'transform -translate-x-1/2 -translate-y-full',
      bottom: 'transform -translate-x-1/2',
      left: 'transform -translate-x-full -translate-y-1/2',
      right: 'transform -translate-y-1/2'
    }
    
    return clsx(baseClasses, positionClasses[position], className)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={getTooltipClasses()}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  )
}
