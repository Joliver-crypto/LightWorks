import { useSelectionStore } from '../../state/useSelectionStore'
import { useProjectStore } from '../../state/useProjectStore'
import { DeviceInspector } from './DeviceInspector'
import { TableInspector } from './TableInspector'

export function Inspector() {
  const { selectedIds, hasSelection } = useSelectionStore()
  const { project } = useProjectStore()

  // If no selection, show table inspector
  if (!hasSelection()) {
    return <TableInspector table={project.table} />
  }

  // If single device selected, show device inspector
  if (selectedIds.length === 1) {
    const device = project.devices.find(d => d.id === selectedIds[0])
    if (device) {
      return <DeviceInspector device={device} />
    }
  }

  // If multiple devices selected, show multi-selection inspector
  if (selectedIds.length > 1) {
    const devices = project.devices.filter(d => selectedIds.includes(d.id))
    return <DeviceInspector devices={devices} />
  }

  return <TableInspector table={project.table} />
}


