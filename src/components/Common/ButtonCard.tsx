import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonCardProps {
  icon: ReactNode
  label: string
  description?: string
  onClick?: () => void
  className?: string
}

export const ButtonCard = ({ 
  icon, 
  label, 
  description, 
  onClick, 
  className 
}: ButtonCardProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative w-full max-w-sm p-6 bg-gray-100 border border-black rounded-xl',
        'hover:bg-gray-200 hover:scale-105',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-white',
        'text-left',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 flex items-center justify-center text-gray-700 group-hover:text-gray-900 transition-colors">
          {icon}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
            {label}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
