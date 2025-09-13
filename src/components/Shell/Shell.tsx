import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'
import { SidebarLeft } from './SidebarLeft'
import { SidebarRight } from './SidebarRight'
import { StatusBar } from './StatusBar'
import { ResizableSidebar } from '../Common/ResizableSidebar'
import { useUiStore } from '../../state/useUiStore'

export function Shell() {
  const { 
    sidebarLeftWidth, 
    sidebarRightWidth, 
    sidebarLeftCollapsed, 
    sidebarRightCollapsed,
    setSidebarLeftWidth,
    setSidebarRightWidth,
    toggleSidebarLeft,
    toggleSidebarRight
  } = useUiStore()

  return (
    <div className="h-full flex flex-col">
      {/* Topbar */}
      <Topbar />
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <ResizableSidebar
          side="left"
          minWidth={200}
          maxWidth={600}
          defaultWidth={sidebarLeftWidth}
          collapsedWidth={0}
          onWidthChange={setSidebarLeftWidth}
          onToggle={toggleSidebarLeft}
          isCollapsed={sidebarLeftCollapsed}
        >
          <SidebarLeft />
        </ResizableSidebar>
        
        {/* Center content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </div>
        
        {/* Right sidebar */}
        <ResizableSidebar
          side="right"
          minWidth={200}
          maxWidth={600}
          defaultWidth={sidebarRightWidth}
          collapsedWidth={0}
          onWidthChange={setSidebarRightWidth}
          onToggle={toggleSidebarRight}
          isCollapsed={sidebarRightCollapsed}
        >
          <SidebarRight />
        </ResizableSidebar>
      </div>
      
      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
