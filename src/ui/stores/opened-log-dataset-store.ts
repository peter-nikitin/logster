import { create } from 'zustand'

export type OpenedLogDatasetOrigin = 'bundled' | 'uploaded'

export type OpenedLogDatasetSource = {
  id: string
  origin: OpenedLogDatasetOrigin
}

type OpenedLogDatasetStore = {
  openedLogDatasetSource: OpenedLogDatasetSource | null
  activeRowId: string | null
  setOpenedLogDatasetSource: (source: OpenedLogDatasetSource | null) => void
  setActiveRowId: (rowId: string | null) => void
}

export const useOpenedLogDatasetStore = create<OpenedLogDatasetStore>((set) => ({
  openedLogDatasetSource: null,
  activeRowId: null,
  setOpenedLogDatasetSource: (openedLogDatasetSource) => {
    set({ openedLogDatasetSource })
  },
  setActiveRowId: (activeRowId) => {
    set({ activeRowId })
  },
}))
