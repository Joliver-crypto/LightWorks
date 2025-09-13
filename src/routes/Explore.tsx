/**
 * EXPLORE PAGE - Quantum Labs Discovery
 * 
 * This page allows users to discover and load curated quantum optics setups.
 * Features search, filtering by difficulty, sorting, and a responsive grid of lab cards.
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'

// Lab data structure
interface Lab {
  id: string
  name: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  popularity: number
  thumbnail: string
  tags: string[]
}

// Sample lab data
const sampleLabs: Lab[] = [
  {
    id: 'photon-counting',
    name: 'Photon Counting Experiment',
    description: 'Measure single photons with detectors and explore quantum statistics.',
    difficulty: 'Beginner',
    popularity: 128,
    thumbnail: 'photon',
    tags: ['photon', 'detection', 'statistics']
  },
  {
    id: 'quantum-gate',
    name: 'Optical Quantum Computing Gate',
    description: 'Simulate a CNOT gate using photons, beam splitters, and detectors.',
    difficulty: 'Advanced',
    popularity: 96,
    thumbnail: 'quantum',
    tags: ['quantum-computing', 'cnot-gate', 'simulation']
  },
  {
    id: 'raman-spectroscopy',
    name: 'Raman Spectroscopy Setup',
    description: 'Probe vibrational states in materials using Raman scattering.',
    difficulty: 'Intermediate',
    popularity: 84,
    thumbnail: 'spectroscopy',
    tags: ['spectroscopy', 'raman', 'materials']
  },
  {
    id: 'entanglement-lab',
    name: 'Entanglement Lab',
    description: 'Generate and analyze entangled photon pairs via SPDC.',
    difficulty: 'Intermediate',
    popularity: 143,
    thumbnail: 'entanglement',
    tags: ['entanglement', 'spdc', 'photon-pairs']
  },
  {
    id: 'bb84-qkd',
    name: 'Quantum Cryptography Lab (BB84 QKD)',
    description: 'Implement quantum key distribution with single photons.',
    difficulty: 'Intermediate',
    popularity: 201,
    thumbnail: 'cryptography',
    tags: ['cryptography', 'qkd', 'bb84', 'security']
  }
]

// Difficulty levels
const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const
type DifficultyFilter = typeof difficultyLevels[number]

// Sort options
const sortOptions = ['Popularity', 'Newest', 'Alphabetical'] as const
type SortFilter = typeof sortOptions[number]

// Lab Card Component
interface LabCardProps {
  lab: Lab
  onClick: (lab: Lab) => void
}

// Thumbnail icon components
const PhotonIcon = () => (
  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
)

const QuantumIcon = () => (
  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  </div>
)

const SpectroscopyIcon = () => (
  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
)

const EntanglementIcon = () => (
  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  </div>
)

const CryptographyIcon = () => (
  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  </div>
)

const getThumbnailIcon = (thumbnail: string) => {
  switch (thumbnail) {
    case 'photon': return <PhotonIcon />
    case 'quantum': return <QuantumIcon />
    case 'spectroscopy': return <SpectroscopyIcon />
    case 'entanglement': return <EntanglementIcon />
    case 'cryptography': return <CryptographyIcon />
    default: return <PhotonIcon />
  }
}

const LabCard = ({ lab, onClick }: LabCardProps) => {
  return (
    <div
      onClick={() => onClick(lab)}
      className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
    >
      <div className="flex flex-col h-full">
        {/* Thumbnail and Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            {getThumbnailIcon(lab.thumbnail)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {lab.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={clsx(
                'px-2 py-1 text-xs font-medium rounded-full',
                lab.difficulty === 'Beginner' && 'bg-green-100 text-green-800',
                lab.difficulty === 'Intermediate' && 'bg-yellow-100 text-yellow-800',
                lab.difficulty === 'Advanced' && 'bg-red-100 text-red-800'
              )}>
                {lab.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-1">
          {lab.description}
        </p>

        {/* Popularity and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {lab.popularity} users
              </span>
            </div>
          </div>
          <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Explore = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All')
  const [sortBy, setSortBy] = useState<SortFilter>('Popularity')

  // Filter and sort labs
  const filteredAndSortedLabs = useMemo(() => {
    let filtered = sampleLabs.filter(lab => {
      const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lab.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesDifficulty = difficultyFilter === 'All' || lab.difficulty === difficultyFilter
      
      return matchesSearch && matchesDifficulty
    })

    // Sort labs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Popularity':
          return b.popularity - a.popularity
        case 'Newest':
          // For demo purposes, we'll use popularity as a proxy for "newest"
          return b.popularity - a.popularity
        case 'Alphabetical':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, difficultyFilter, sortBy])

  const handleLabClick = (lab: Lab) => {
    console.log('Loading lab:', lab.name)
    // TODO: Implement lab loading functionality
    // For now, navigate to editor with lab data
    navigate(`/editor?lab=${lab.id}`)
  }

  const handleBackToDashboard = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Explore Quantum Labs
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search labs by name or concept (e.g. 'entanglement')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Difficulty:</span>
              <div className="flex space-x-1">
                {difficultyLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    className={clsx(
                      'px-3 py-1 text-sm font-medium rounded-full transition-colors',
                      difficultyFilter === level
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex space-x-1">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={clsx(
                      'px-3 py-1 text-sm font-medium rounded-full transition-colors',
                      sortBy === option
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedLabs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No labs found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find more labs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLabs.map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab}
                onClick={handleLabClick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
