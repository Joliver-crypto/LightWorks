import { useState } from 'react'
import { MOCK_EXTENSIONS } from '../../models/extensions'
import { Input } from '../Common/Input'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
// import { clsx } from 'clsx'

export function ExtensionStore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'driver' | 'analysis' | 'workflow'>('all')
  const [filterOs, setFilterOs] = useState<'all' | 'windows' | 'linux' | 'mac'>('all')
  const [installing, setInstalling] = useState<string | null>(null)

  const filteredExtensions = MOCK_EXTENSIONS.filter(extension => {
    const matchesSearch = extension.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         extension.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || extension.type.includes(filterType)
    const matchesOs = filterOs === 'all' || extension.os.includes(filterOs)
    
    return matchesSearch && matchesType && matchesOs
  })

  const handleInstall = async (extensionName: string) => {
    setInstalling(extensionName)
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setInstalling(null)
  }

  const getOsIcon = (os: string) => {
    switch (os) {
      case 'windows': return '🪟'
      case 'linux': return '🐧'
      case 'mac': return '🍎'
      default: return '💻'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'driver': return 'bg-blue-100 text-blue-800'
      case 'analysis': return 'bg-green-100 text-green-800'
      case 'workflow': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <Input
          placeholder="Search extensions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="all">All Types</option>
            <option value="driver">Drivers</option>
            <option value="analysis">Analysis</option>
            <option value="workflow">Workflows</option>
          </select>
          
          <select
            value={filterOs}
            onChange={(e) => setFilterOs(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="all">All Platforms</option>
            <option value="windows">Windows</option>
            <option value="linux">Linux</option>
            <option value="mac">macOS</option>
          </select>
        </div>
      </div>

      {/* Extensions list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {filteredExtensions.map((extension) => (
            <div key={extension.name} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {extension.name}
                      </h3>
                      <span className="text-sm text-gray-500">v{extension.version}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {extension.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {extension.type.map((type) => (
                        <Badge key={type} className={getTypeColor(type)}>
                          {type}
                        </Badge>
                      ))}
                      {extension.badges?.map((badge) => (
                        <Badge key={badge} variant="default">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>OS:</span>
                        <div className="flex gap-1">
                          {extension.os.map((os) => (
                            <span key={os} title={os}>
                              {getOsIcon(os)}
                            </span>
                          ))}
                        </div>
                      </div>
                      {extension.sizeMB && (
                        <span>Size: {extension.sizeMB} MB</span>
                      )}
                      {extension.author && (
                        <span>By {extension.author}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInstall(extension.name)}
                      disabled={installing === extension.name}
                    >
                      {installing === extension.name ? 'Installing...' : 'Install'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredExtensions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No extensions found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
