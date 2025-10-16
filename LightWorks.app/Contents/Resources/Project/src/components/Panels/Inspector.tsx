import { useSelectionStore } from '../../state/useSelectionStore'
import { useFileStore } from '../../storage/useFileStore'
import { DeviceInspector } from './DeviceInspector'
import { TableInspector } from './TableInspector'

export function Inspector() {
  const { selectedIds, hasSelection } = useSelectionStore()
  const { currentTable } = useFileStore()

  // If no selection, show table inspector
  if (!hasSelection() || !currentTable) {
    return currentTable ? <TableInspector table={currentTable.table} /> : <div>No table loaded</div>
  }

  // If single device selected, show device inspector
  if (selectedIds.length === 1) {
    const device = currentTable.components.find(d => d.id === selectedIds[0])
    if (device) {
      return <DeviceInspector device={device} />
    }
  }

  // If multiple devices selected, show multi-selection inspector
  if (selectedIds.length > 1) {
    const devices = currentTable.components.filter(d => selectedIds.includes(d.id))
    return <DeviceInspector device={devices[0]} />
  }

  return <TableInspector table={currentTable.table} />
}


