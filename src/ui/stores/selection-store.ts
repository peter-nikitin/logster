import { create } from 'zustand'

export type DatasetOrigin = 'bundled' | 'uploaded'

type SelectionStore = {
  activeDatasetId: string | null
  activeDatasetOrigin: DatasetOrigin | null
  activeRowId: string | null
  setActiveDataset: (id: string | null, origin: DatasetOrigin | null) => void
  setActiveRowId: (rowId: string | null) => void
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  activeDatasetId: null,
  activeDatasetOrigin: null,
  activeRowId: null,
  setActiveDataset: (id, origin) => {
    set({ activeDatasetId: id, activeDatasetOrigin: origin })
  },
  setActiveRowId: (rowId) => {
    set({ activeRowId: rowId })
  },
}))
