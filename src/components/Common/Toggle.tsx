import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={clsx('flex items-start', className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={toggleId}
            type="checkbox"
            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            {...props}
          />
        </div>
        
        <div className="ml-3 text-sm">
          {label && (
            <label htmlFor={toggleId} className="font-medium text-gray-700">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'


