import { useEffect, useMemo, useState } from 'react'
import type { BundledDatasetFile } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { readBrowserFile } from '@/adapters/file-import/browser-file-reader'
import { IndexedDbDatasetRepository } from '@/adapters/storage/indexeddb-dataset-repository'
import type { StoredDatasetMeta } from '@/app/ports/dataset-repository'
import { deleteStoredDataset } from '@/app/use-cases/delete-stored-dataset'
import { loadBundledDataset } from '@/app/use-cases/load-bundled-dataset'
import { loadUploadedDataset } from '@/app/use-cases/load-uploaded-dataset'
import { restoreStoredDatasets } from '@/app/use-cases/restore-stored-datasets'
import { saveUploadedDataset } from '@/app/use-cases/save-uploaded-dataset'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'
import { useSelectionStore } from '@/ui/stores/selection-store'
import { useStatusStore } from '@/ui/stores/status-store'

type ActiveDatasetState = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: ReturnType<typeof useSelectionStore.getState>['activeDatasetOrigin']
  activeDatasetId: string | null
  activeRow: LogRow | null
  error: string | null
  isImporting: boolean
  isRestoring: boolean
  storedDatasets: StoredDatasetMeta[]
  importFile: (file: File) => Promise<void>
  selectBundledDataset: (fileId: string) => void
  selectStoredDataset: (datasetId: string) => Promise<void>
  deleteStoredDataset: (datasetId: string) => Promise<void>
  selectRow: (rowId: string) => void
}

type InitialState = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: ReturnType<typeof useSelectionStore.getState>['activeDatasetOrigin']
  activeDatasetId: string | null
  activeRow: LogRow | null
  error: string | null
}

export function useActiveDataset(files: BundledDatasetFile[]): ActiveDatasetState {
  const repository = useMemo(() => new IndexedDbDatasetRepository(), [])
  const initialState = useMemo(() => createInitialState(files), [files])
  const activeDatasetId = useSelectionStore((state) => state.activeDatasetId)
  const activeDatasetOrigin = useSelectionStore((state) => state.activeDatasetOrigin)
  const activeRowId = useSelectionStore((state) => state.activeRowId)
  const setActiveDatasetSelection = useSelectionStore((state) => state.setActiveDataset)
  const setActiveRowId = useSelectionStore((state) => state.setActiveRowId)
  const error = useStatusStore((state) => state.error)
  const isImporting = useStatusStore((state) => state.isImporting)
  const isRestoring = useStatusStore((state) => state.isRestoring)
  const setError = useStatusStore((state) => state.setError)
  const setIsImporting = useStatusStore((state) => state.setIsImporting)
  const setIsRestoring = useStatusStore((state) => state.setIsRestoring)

  const [activeDataset, setActiveDataset] = useState<LogDataset | null>(
    initialState.activeDataset,
  )
  const [storedDatasets, setStoredDatasets] = useState<StoredDatasetMeta[]>([])
  const activeRow =
    activeDataset?.rows.find((candidate) => candidate.id === activeRowId) ??
    activeDataset?.rows[0] ??
    null

  useEffect(() => {
    setActiveDatasetSelection(initialState.activeDatasetId, initialState.activeDatasetOrigin)
    setActiveRowId(initialState.activeRow?.id ?? null)
    setError(initialState.error)
    setIsRestoring(true)
  }, [initialState.activeDatasetId, initialState.activeDatasetOrigin, initialState.activeRow, initialState.error, setActiveDatasetSelection, setActiveRowId, setError, setIsRestoring])

  useEffect(() => {
    let isCancelled = false

    async function restore() {
      try {
        const result = await restoreStoredDatasets(repository)

        if (isCancelled) {
          return
        }

        setStoredDatasets(result.datasets)

        if (result.lastActiveDataset) {
          setError(null)
          setActiveDataset(result.lastActiveDataset)
          setActiveDatasetSelection(result.lastActiveDataset.id, 'uploaded')
          setActiveRowId(result.lastActiveDataset.rows[0]?.id ?? null)
        }
      } catch (restoreError) {
        if (isCancelled) {
          return
        }

        setError(
          restoreError instanceof Error
            ? `Failed to restore stored datasets: ${restoreError.message}`
            : 'Failed to restore stored datasets.',
        )
      } finally {
        if (!isCancelled) {
          setIsRestoring(false)
        }
      }
    }

    void restore()

    return () => {
      isCancelled = true
    }
  }, [repository, setActiveDatasetSelection, setActiveRowId, setError, setIsRestoring])

  function selectBundledDataset(fileId: string) {
    const file = files.find((candidate) => candidate.id === fileId)

    if (!file) {
      setActiveDataset(null)
      setActiveDatasetSelection(fileId, null)
      setActiveRowId(null)
      setError(`Unknown bundled dataset: ${fileId}`)
      return
    }

    const result = loadBundledDataset(file)

    if (result.status === 'error') {
      setActiveDataset(null)
      setActiveDatasetSelection(file.id, 'bundled')
      setActiveRowId(null)
      setError(result.message)
      return
    }

    setError(null)
    setActiveDataset(result.dataset)
    setActiveDatasetSelection(file.id, 'bundled')
    setActiveRowId(result.dataset.rows[0]?.id ?? null)
    void repository.setLastActiveId(null).catch(() => {
      // Keep bundled selection working even if storage state cannot be updated.
    })
  }

  async function selectStoredDataset(datasetId: string) {
    try {
      const dataset = await repository.get(datasetId)

      if (!dataset) {
        setStoredDatasets((current) =>
          current.filter((candidate) => candidate.id !== datasetId),
        )
        setError('Stored dataset is no longer available.')
        return
      }

      setError(null)
      setActiveDataset(dataset)
      setActiveDatasetSelection(dataset.id, 'uploaded')
      setActiveRowId(dataset.rows[0]?.id ?? null)
      await repository.setLastActiveId(dataset.id)
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? `Failed to open stored dataset: ${selectionError.message}`
          : 'Failed to open stored dataset.',
      )
    }
  }

  async function importFile(file: File) {
    setIsImporting(true)

    try {
      const importedFile = await readBrowserFile(file)
      const result = loadUploadedDataset({
        fileName: importedFile.name,
        rawContent: importedFile.rawContent,
      })

      if (result.status === 'error') {
        setActiveDataset(null)
        setActiveDatasetSelection(null, 'uploaded')
        setActiveRowId(null)
        setError(result.message)
        return
      }

      const meta = await saveUploadedDataset(repository, result.dataset)

      setStoredDatasets((current) =>
        [meta, ...current.filter((candidate) => candidate.id !== meta.id)].sort((left, right) =>
          right.savedAt.localeCompare(left.savedAt),
        ),
      )
      setError(null)
      setActiveDataset(result.dataset)
      setActiveDatasetSelection(result.dataset.id, 'uploaded')
      setActiveRowId(result.dataset.rows[0]?.id ?? null)
    } catch (importError) {
      setActiveDataset(null)
      setActiveDatasetSelection(null, 'uploaded')
      setActiveRowId(null)
      setError(
        importError instanceof Error
          ? `Failed to import ${file.name}: ${importError.message}`
          : `Failed to import ${file.name}.`,
      )
    } finally {
      setIsImporting(false)
    }
  }

  async function removeStoredDataset(datasetId: string) {
    try {
      await deleteStoredDataset(repository, datasetId)
      setStoredDatasets((current) =>
        current.filter((candidate) => candidate.id !== datasetId),
      )

      if (activeDatasetOrigin === 'uploaded' && activeDatasetId === datasetId) {
        const fallback = files[0]

        if (!fallback) {
          setActiveDataset(null)
          setActiveDatasetSelection(null, null)
          setActiveRowId(null)
          return
        }

        selectBundledDataset(fallback.id)
      }

      setError(null)
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? `Failed to delete stored dataset: ${removeError.message}`
          : 'Failed to delete stored dataset.',
      )
    }
  }

  function selectRow(rowId: string) {
    if (!activeDataset) {
      setActiveRowId(null)
      return
    }

    const row = activeDataset.rows.find((candidate) => candidate.id === rowId) ?? null
    setActiveRowId(row?.id ?? null)
  }

  return {
    activeDataset,
    activeDatasetOrigin,
    activeDatasetId,
    activeRow,
    error,
    isImporting,
    isRestoring,
    storedDatasets,
    importFile,
    selectBundledDataset,
    selectStoredDataset,
    deleteStoredDataset: removeStoredDataset,
    selectRow,
  }
}

function createInitialState(files: BundledDatasetFile[]): InitialState {
  const initialFile = files[0]

  if (!initialFile) {
    return {
      activeDataset: null,
      activeDatasetOrigin: null,
      activeDatasetId: null,
      activeRow: null,
      error: null,
    }
  }

  const result = loadBundledDataset(initialFile)

  return result.status === 'success'
    ? {
        activeDataset: result.dataset,
        activeDatasetOrigin: 'bundled',
        activeDatasetId: initialFile.id,
        activeRow: result.dataset.rows[0] ?? null,
        error: null,
      }
    : {
        activeDataset: null,
        activeDatasetOrigin: 'bundled',
        activeDatasetId: initialFile.id,
        activeRow: null,
        error: result.message,
      }
}
