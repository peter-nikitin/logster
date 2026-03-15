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
import {
  useOpenedLogDatasetStore,
  type OpenedLogDatasetOrigin,
} from '@/ui/stores/opened-log-dataset-store'

export type WorkspaceFeedback = {
  tone: 'error' | 'warning'
  title: string
  message: string
}

type ActiveDatasetState = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: OpenedLogDatasetOrigin | null
  activeDatasetId: string | null
  activeRow: LogRow | null
  feedback: WorkspaceFeedback | null
  isImporting: boolean
  isRestoring: boolean
  storedDatasets: StoredDatasetMeta[]
  importFile: (file: File) => Promise<void>
  selectBundledDataset: (fileId: string) => void
  selectStoredDataset: (datasetId: string) => Promise<void>
  deleteStoredDataset: (datasetId: string) => Promise<void>
  selectRow: (rowId: string | null) => void
}

export function useActiveDataset(files: BundledDatasetFile[]): ActiveDatasetState {
  const repository = useMemo(() => new IndexedDbDatasetRepository(), [])
  const openedLogDatasetSource = useOpenedLogDatasetStore(
    (state) => state.openedLogDatasetSource,
  )
  const activeDatasetId = openedLogDatasetSource?.id ?? null
  const activeDatasetOrigin = openedLogDatasetSource?.origin ?? null
  const activeRowId = useOpenedLogDatasetStore((state) => state.activeRowId)
  const setOpenedLogDatasetSource = useOpenedLogDatasetStore(
    (state) => state.setOpenedLogDatasetSource,
  )
  const setActiveRowId = useOpenedLogDatasetStore((state) => state.setActiveRowId)
  const [activeDataset, setActiveDataset] = useState<LogDataset | null>(null)
  const [feedback, setFeedback] = useState<WorkspaceFeedback | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(true)
  const [storedDatasets, setStoredDatasets] = useState<StoredDatasetMeta[]>([])
  const activeRow =
    activeDataset?.rows.find((candidate) => candidate.id === activeRowId) ?? null

  useEffect(() => {
    setOpenedLogDatasetSource(null)
    setActiveRowId(null)
  }, [setOpenedLogDatasetSource, setActiveRowId])

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
          setFeedback(null)
          setActiveDataset(result.lastActiveDataset)
          setOpenedLogDatasetSource({
            id: result.lastActiveDataset.id,
            origin: 'uploaded',
          })
          setActiveRowId(result.lastActiveDataset.rows[0]?.id ?? null)
          return
        }

        setActiveDataset(null)
        setOpenedLogDatasetSource(null)
        setActiveRowId(null)

        if (result.lastActiveDatasetMissing) {
          setFeedback({
            tone: 'warning',
            title: 'Last opened dataset is no longer available',
            message:
              'The previously active upload could not be restored. Open a bundled example or import a file to continue.',
          })
        } else {
          setFeedback(null)
        }
      } catch (restoreError) {
        if (isCancelled) {
          return
        }

        setActiveDataset(null)
        setOpenedLogDatasetSource(null)
        setActiveRowId(null)
        setFeedback({
          tone: 'warning',
          title: 'Stored datasets could not be restored',
          message:
            restoreError instanceof Error
              ? `Browser storage is unavailable right now: ${restoreError.message}. You can still open bundled examples or upload a file for this session.`
              : 'Browser storage is unavailable right now. You can still open bundled examples or upload a file for this session.',
        })
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
  }, [repository, setOpenedLogDatasetSource, setActiveRowId])

  function selectBundledDataset(fileId: string) {
    const file = files.find((candidate) => candidate.id === fileId)

    if (!file) {
      setFeedback({
        tone: 'error',
        title: 'Bundled dataset not found',
        message: `The example dataset "${fileId}" is not available.`,
      })
      return
    }

    const result = loadBundledDataset(file)

    if (result.status === 'error') {
      setFeedback({
        tone: 'error',
        title: 'Bundled dataset could not be opened',
        message: result.message,
      })
      return
    }

    setFeedback(null)
    setActiveDataset(result.dataset)
    setOpenedLogDatasetSource({
      id: file.id,
      origin: 'bundled',
    })
    setActiveRowId(result.dataset.rows[0]?.id ?? null)

    void repository.setLastActiveId(null).catch((storageError) => {
      setFeedback({
        tone: 'warning',
        title: 'Selection could not be remembered',
        message:
          storageError instanceof Error
            ? `Opened ${file.name}, but browser storage could not clear the previous uploaded selection: ${storageError.message}`
            : `Opened ${file.name}, but browser storage could not clear the previous uploaded selection.`,
      })
    })
  }

  async function selectStoredDataset(datasetId: string) {
    try {
      const dataset = await repository.get(datasetId)

      if (!dataset) {
        setStoredDatasets((current) =>
          current.filter((candidate) => candidate.id !== datasetId),
        )
        setFeedback({
          tone: 'warning',
          title: 'Stored dataset is no longer available',
          message:
            'That upload could not be found in browser storage anymore. It has been removed from the list.',
        })
        return
      }

      setFeedback(null)
      setActiveDataset(dataset)
      setOpenedLogDatasetSource({
        id: dataset.id,
        origin: 'uploaded',
      })
      setActiveRowId(dataset.rows[0]?.id ?? null)

      try {
        await repository.setLastActiveId(dataset.id)
      } catch (storageError) {
        setFeedback({
          tone: 'warning',
          title: 'Selection could not be remembered',
          message:
            storageError instanceof Error
              ? `Opened ${dataset.name}, but browser storage could not remember it as the last active dataset: ${storageError.message}`
              : `Opened ${dataset.name}, but browser storage could not remember it as the last active dataset.`,
        })
      }
    } catch (selectionError) {
      setFeedback({
        tone: 'warning',
        title: 'Stored dataset could not be opened',
        message:
          selectionError instanceof Error
            ? `Browser storage could not open this upload: ${selectionError.message}`
            : 'Browser storage could not open this upload.',
      })
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
        setFeedback({
          tone: 'error',
          title: 'Upload could not be imported',
          message: result.message,
        })
        return
      }

      setActiveDataset(result.dataset)
      setOpenedLogDatasetSource({
        id: result.dataset.id,
        origin: 'uploaded',
      })
      setActiveRowId(result.dataset.rows[0]?.id ?? null)
      setFeedback(null)

      try {
        const saveResult = await saveUploadedDataset(repository, result.dataset)

        setStoredDatasets((current) =>
          [
            saveResult.meta,
            ...current.filter((candidate) => candidate.id !== saveResult.meta.id),
          ].sort((left, right) => right.savedAt.localeCompare(left.savedAt)),
        )

        if (!saveResult.lastActiveSaved) {
          setFeedback({
            tone: 'warning',
            title: 'Upload opened but was not fully remembered',
            message:
              'The file is open for this session, but browser storage could not remember it as your last active dataset.',
          })
        }
      } catch (storageError) {
        setFeedback({
          tone: 'warning',
          title: 'Upload opened but could not be saved',
          message:
            storageError instanceof Error
              ? `The file was parsed successfully, but browser storage rejected the save: ${storageError.message}`
              : 'The file was parsed successfully, but browser storage rejected the save.',
        })
      }
    } catch (importError) {
      setFeedback({
        tone: 'error',
        title: 'Upload could not be read',
        message:
          importError instanceof Error
            ? `Failed to import ${file.name}: ${importError.message}`
            : `Failed to import ${file.name}.`,
      })
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
        setActiveDataset(null)
        setOpenedLogDatasetSource(null)
        setActiveRowId(null)
      }

      setFeedback(null)
    } catch (removeError) {
      setFeedback({
        tone: 'warning',
        title: 'Stored dataset could not be deleted',
        message:
          removeError instanceof Error
            ? `Browser storage refused to delete the upload: ${removeError.message}`
            : 'Browser storage refused to delete the upload.',
      })
    }
  }

  function selectRow(rowId: string | null) {
    if (!activeDataset) {
      setActiveRowId(null)
      return
    }

    if (rowId === null) {
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
    feedback,
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
