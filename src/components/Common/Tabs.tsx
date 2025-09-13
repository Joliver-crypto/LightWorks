import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={clsx('flex', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              isActive
                ? 'border-brand-500 text-brand-600 bg-brand-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}


