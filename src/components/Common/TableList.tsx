import { clsx } from 'clsx'

interface Table {
  id: string
  name: string
  lastModified?: string
  description?: string
}

interface TableListProps {
  tables: Table[]
  onViewAll?: () => void
  onTableClick?: (table: Table) => void
  className?: string
  isLoading?: boolean
  error?: string | null
}

export const TableList = ({ 
  tables, 
  onViewAll, 
  onTableClick,
  className,
  isLoading = false,
  error = null
}: TableListProps) => {
  return (
    <div className={clsx('w-full max-w-4xl', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">My Tables</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            View all
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error loading tables: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Create a table to get started!</p>
          </div>
        ) : (
          tables.map((table) => (
            <div
              key={table.id}
              onClick={() => onTableClick?.(table)}
              className="group p-4 bg-gray-100 border border-black rounded-lg hover:bg-gray-200 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium truncate group-hover:text-gray-900 transition-colors">
                    {table.name}
                  </h3>
                  {table.description && (
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors mt-1 truncate">
                      {table.description}
                    </p>
                  )}
                  {table.lastModified && (
                    <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors mt-1">
                      Modified {table.lastModified}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
