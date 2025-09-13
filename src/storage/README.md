# LightWorks Storage System

A comprehensive client-side storage system for the LightWorks optics CAD application, built with Dexie (IndexedDB) and Zustand.

## Features

- **Persistent Storage**: Uses IndexedDB for client-side data persistence
- **Type Safety**: Full TypeScript support with Zod validation
- **Auto-save**: Debounced auto-save functionality
- **File Import/Export**: JSON-based file operations
- **Migration Support**: Schema versioning for future updates
- **Offline-first**: Works without internet connection

## Architecture

### Data Models (`models/storage.ts`)

```typescript
// Core types
export type UUID = string
export type Pose2D = { x: number; y: number; theta: number }
export type Table = { id: UUID; name: string; /* ... */ }
export type Component = { id: UUID; tableId: UUID; type: ComponentType; /* ... */ }
export type Connection = { id: UUID; tableId: UUID; fromComponentId: UUID; /* ... */ }
export type TableSnapshot = { table: Table; components: Component[]; connections: Connection[] }
```

### Database Layer (`database.ts`)

- **Dexie Database**: IndexedDB wrapper with clean API
- **Indexing**: Optimized queries on tableId, type, and relationships
- **Transactions**: Atomic operations for data consistency
- **Migrations**: Schema versioning for future updates

### State Management (`useStorageStore.ts`)

- **Zustand Store**: Reactive state management
- **CRUD Operations**: Create, read, update, delete for all entities
- **Error Handling**: Comprehensive error states
- **Loading States**: UI feedback for async operations

### Auto-save (`autoSave.ts`)

- **Debounced Saves**: 2-second delay to prevent excessive saves
- **Before Unload**: Warns users about unsaved changes
- **Manual Save**: Force save functionality

### File Operations (`fileOperations.ts`)

- **Import/Export**: JSON-based file operations
- **File System API**: Modern browser file access
- **Fallback Support**: Traditional file input for older browsers
- **Bundle Support**: Multiple tables in single file

### Adapters (`adapters.ts`)

- **Legacy Support**: Convert between old and new data formats
- **Migration Tools**: Help migrate existing projects
- **Type Mapping**: Map old device types to new component types

## Usage

### Basic Operations

```typescript
import { useStorageStore } from './storage/useStorageStore'

function MyComponent() {
  const { 
    currentSnapshot, 
    createNewTable, 
    loadTable, 
    saveCurrentTable,
    addComponent,
    updateComponent,
    removeComponent 
  } = useStorageStore()

  // Create a new table
  const handleCreateTable = async () => {
    const tableId = await createNewTable('My New Table')
    console.log('Created table:', tableId)
  }

  // Add a component
  const handleAddComponent = () => {
    const component = {
      id: crypto.randomUUID(),
      tableId: currentSnapshot?.table.id!,
      type: 'Laser',
      label: 'HeNe Laser',
      pose: { x: 100, y: 100, theta: 0 },
      meta: { wavelength: 632.8 }
    }
    addComponent(component)
  }
}
```

### File Operations

```typescript
import { exportTableSnapshot, loadTableSnapshot } from './storage/fileOperations'

// Export current table
const handleExport = async () => {
  if (currentSnapshot) {
    await exportTableSnapshot(currentSnapshot, 'my-table.lightworks')
  }
}

// Import table from file
const handleImport = async () => {
  const snapshot = await loadTableSnapshot()
  await loadTable(snapshot.table.id)
}
```

### Auto-save

```typescript
import { enableAutoSave } from './storage/autoSave'

// Enable auto-save (usually in App component)
useEffect(() => {
  const cleanup = enableAutoSave()
  return cleanup
}, [])
```

## Database Schema

### Tables Table
- `id` (Primary Key)
- `name` (Indexed)
- `updatedAt` (Indexed)
- `createdAt` (Indexed)
- `version` (Indexed)

### Components Table
- `id` (Primary Key)
- `tableId` (Indexed)
- `type` (Indexed)
- `[tableId+type]` (Compound Index)
- `locked` (Indexed)

### Connections Table
- `id` (Primary Key)
- `tableId` (Indexed)
- `fromComponentId` (Indexed)
- `toComponentId` (Indexed)
- `[tableId+fromComponentId]` (Compound Index)
- `wavelengthNm` (Indexed)

## Performance

- **Indexed Queries**: All common queries are indexed
- **Batch Operations**: Bulk operations for better performance
- **Lazy Loading**: Components and connections loaded on demand
- **Debounced Saves**: Prevents excessive database writes

## Error Handling

- **Validation**: Zod schemas validate all data
- **Transaction Rollback**: Failed operations don't corrupt data
- **User Feedback**: Clear error messages in UI
- **Retry Logic**: Automatic retry for transient failures

## Migration Strategy

1. **Version 1**: Initial schema with basic tables
2. **Version 2**: Added version field and locked component support
3. **Future**: Add new fields with migration logic

## Testing

The storage system includes comprehensive tests:

```typescript
import { testStorageSystem } from './storage/test'

// Run tests
const success = await testStorageSystem()
console.log('Storage test passed:', success)
```

## Browser Support

- **Modern Browsers**: Full File System Access API support
- **Legacy Browsers**: Fallback to traditional file input
- **IndexedDB**: Supported in all modern browsers
- **Web Workers**: Can be used for background operations

## Security

- **Client-side Only**: No server-side data storage
- **Data Validation**: All input validated with Zod
- **No External Dependencies**: Self-contained storage system
- **Sandboxed**: Runs in browser security context
