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

type DatasetOrigin = 'bundled' | 'uploaded'

type ActiveDatasetState = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: DatasetOrigin | null
  activeFileId: string | null
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
  activeDatasetOrigin: DatasetOrigin | null
  activeFileId: string | null
  activeRow: LogRow | null
  error: string | null
}

export function useActiveDataset(files: BundledDatasetFile[]): ActiveDatasetState {
  const repository = useMemo(() => new IndexedDbDatasetRepository(), [])
  const initialState = createInitialState(files)

  const [activeDataset, setActiveDataset] = useState<LogDataset | null>(
    initialState.activeDataset,
  )
  const [activeDatasetOrigin, setActiveDatasetOrigin] = useState<DatasetOrigin | null>(
    initialState.activeDatasetOrigin,
  )
  const [activeFileId, setActiveFileId] = useState<string | null>(initialState.activeFileId)
  const [activeRow, setActiveRow] = useState<LogRow | null>(initialState.activeRow)
  const [error, setError] = useState<string | null>(initialState.error)
  const [isImporting, setIsImporting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(true)
  const [storedDatasets, setStoredDatasets] = useState<StoredDatasetMeta[]>([])

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
          setActiveDatasetOrigin('uploaded')
          setActiveFileId(result.lastActiveDataset.id)
          setActiveRow(result.lastActiveDataset.rows[0] ?? null)
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
  }, [repository])

  function selectBundledDataset(fileId: string) {
    const file = files.find((candidate) => candidate.id === fileId)

    if (!file) {
      setActiveDataset(null)
      setActiveDatasetOrigin(null)
      setActiveFileId(fileId)
      setActiveRow(null)
      setError(`Unknown bundled dataset: ${fileId}`)
      return
    }

    const result = loadBundledDataset(file)
    setActiveFileId(file.id)

    if (result.status === 'error') {
      setActiveDataset(null)
      setActiveDatasetOrigin('bundled')
      setActiveRow(null)
      setError(result.message)
      return
    }

    setError(null)
    setActiveDataset(result.dataset)
    setActiveDatasetOrigin('bundled')
    setActiveRow(result.dataset.rows[0] ?? null)
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
      setActiveDatasetOrigin('uploaded')
      setActiveFileId(dataset.id)
      setActiveRow(dataset.rows[0] ?? null)
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
        setActiveDatasetOrigin('uploaded')
        setActiveFileId(null)
        setActiveRow(null)
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
      setActiveDatasetOrigin('uploaded')
      setActiveFileId(result.dataset.id)
      setActiveRow(result.dataset.rows[0] ?? null)
    } catch (importError) {
      setActiveDataset(null)
      setActiveDatasetOrigin('uploaded')
      setActiveFileId(null)
      setActiveRow(null)
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

      if (activeDatasetOrigin === 'uploaded' && activeFileId === datasetId) {
        const fallback = files[0]

        if (!fallback) {
          setActiveDataset(null)
          setActiveDatasetOrigin(null)
          setActiveFileId(null)
          setActiveRow(null)
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
      setActiveRow(null)
      return
    }

    const row = activeDataset.rows.find((candidate) => candidate.id === rowId) ?? null
    setActiveRow(row)
  }

  return {
    activeDataset,
    activeDatasetOrigin,
    activeFileId,
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
      activeFileId: null,
      activeRow: null,
      error: null,
    }
  }

  const result = loadBundledDataset(initialFile)

  return result.status === 'success'
    ? {
        activeDataset: result.dataset,
        activeDatasetOrigin: 'bundled',
        activeFileId: initialFile.id,
        activeRow: result.dataset.rows[0] ?? null,
        error: null,
      }
    : {
        activeDataset: null,
        activeDatasetOrigin: 'bundled',
        activeFileId: initialFile.id,
        activeRow: null,
        error: result.message,
      }
}
