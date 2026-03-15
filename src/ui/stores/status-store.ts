import { create } from 'zustand'

type StatusStore = {
  error: string | null
  isImporting: boolean
  isRestoring: boolean
  setError: (error: string | null) => void
  setIsImporting: (value: boolean) => void
  setIsRestoring: (value: boolean) => void
}

export const useStatusStore = create<StatusStore>((set) => ({
  error: null,
  isImporting: false,
  isRestoring: true,
  setError: (error) => {
    set({ error })
  },
  setIsImporting: (value) => {
    set({ isImporting: value })
  },
  setIsRestoring: (value) => {
    set({ isRestoring: value })
  },
}))
