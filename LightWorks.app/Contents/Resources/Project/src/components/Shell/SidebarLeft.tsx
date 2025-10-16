import { useState } from 'react'
import { 
  Squares2X2Icon,
  PuzzlePieceIcon,
  PlayIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { Tabs } from '../Common/Tabs'
import { Palette } from '../Panels/Palette'
import { ExtensionStore } from '../Panels/ExtensionStore'
import { WorkflowPanel } from '../Panels/WorkflowPanel'

const tabs = [
  { id: 'palette', label: 'Hardware', icon: Squares2X2Icon },
  { id: 'extensions', label: 'Extensions', icon: PuzzlePieceIcon },
  { id: 'workflows', label: 'Workflows', icon: PlayIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
]

export function SidebarLeft() {
  const [activeTab, setActiveTab] = useState('palette')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'palette':
        return <Palette />
      case 'extensions':
        return <ExtensionStore />
      case 'workflows':
        return <WorkflowPanel />
      case 'settings':
        return <div className="p-4 text-gray-500">Settings panel coming soon...</div>
      default:
        return <Palette />
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab header */}
      <div className="border-b border-gray-200">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  )
}


