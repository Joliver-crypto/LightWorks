import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SelectionState {
  // Selection data
  selectedIds: string[]
  lastSelectedId: string | null
  isMultiSelect: boolean
  
  // Actions
  setSelection: (ids: string[]) => void
  addToSelection: (id: string) => void
  removeFromSelection: (id: string) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  selectAll: () => void
  
  // Selection queries
  isSelected: (id: string) => boolean
  hasSelection: () => boolean
  getSelectionCount: () => number
}

export const useSelectionStore = create<SelectionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedIds: [],
      lastSelectedId: null,
      isMultiSelect: false,
      
      // Selection actions
      setSelection: (ids) => set({
        selectedIds: ids,
        lastSelectedId: ids.length > 0 ? ids[ids.length - 1] : null,
        isMultiSelect: ids.length > 1
      }),
      
      addToSelection: (id) => set((state) => {
        if (state.selectedIds.includes(id)) return state
        
        return {
          selectedIds: [...state.selectedIds, id],
          lastSelectedId: id,
          isMultiSelect: state.selectedIds.length > 0
        }
      }),
      
      removeFromSelection: (id) => set((state) => {
        const newSelection = state.selectedIds.filter(selectedId => selectedId !== id)
        return {
          selectedIds: newSelection,
          lastSelectedId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
          isMultiSelect: newSelection.length > 1
        }
      }),
      
      toggleSelection: (id) => set((state) => {
        if (state.selectedIds.includes(id)) {
          const newSelection = state.selectedIds.filter(selectedId => selectedId !== id)
          return {
            selectedIds: newSelection,
            lastSelectedId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
            isMultiSelect: newSelection.length > 1
          }
        } else {
          return {
            selectedIds: [...state.selectedIds, id],
            lastSelectedId: id,
            isMultiSelect: state.selectedIds.length > 0
          }
        }
      }),
      
      clearSelection: () => set({
        selectedIds: [],
        lastSelectedId: null,
        isMultiSelect: false
      }),
      
      selectAll: () => {
        // This will be implemented when we have access to all device IDs
        // For now, it's a placeholder
        set({ selectedIds: [], lastSelectedId: null, isMultiSelect: false })
      },
      
      // Selection queries
      isSelected: (id) => get().selectedIds.includes(id),
      
      hasSelection: () => get().selectedIds.length > 0,
      
      getSelectionCount: () => get().selectedIds.length
    }),
    {
      name: 'selection-store',
    }
  )
)
