import { useState } from 'react'
import type { BundledDatasetFile } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { readBrowserFile } from '@/adapters/file-import/browser-file-reader'
import { loadBundledDataset } from '@/app/use-cases/load-bundled-dataset'
import { loadUploadedDataset } from '@/app/use-cases/load-uploaded-dataset'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'

type DatasetOrigin = 'bundled' | 'uploaded'

export type UploadedDatasetSummary = {
  id: string
  name: string
}

type ActiveDatasetState = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: DatasetOrigin | null
  activeFileId: string | null
  activeRow: LogRow | null
  error: string | null
  isImporting: boolean
  uploadedDataset: UploadedDatasetSummary | null
  importFile: (file: File) => Promise<void>
  selectDataset: (fileId: string) => void
  selectUploadedDataset: () => void
  selectRow: (rowId: string) => void
}

type InitialState = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: DatasetOrigin | null
  activeFileId: string | null
  activeRow: LogRow | null
  error: string | null
  uploadedDataset: UploadedDatasetSummary | null
}

export function useActiveDataset(files: BundledDatasetFile[]): ActiveDatasetState {
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
  const [uploadedDatasetValue, setUploadedDatasetValue] = useState<LogDataset | null>(null)
  const [uploadedDataset, setUploadedDataset] = useState<UploadedDatasetSummary | null>(
    initialState.uploadedDataset,
  )

  function selectDataset(fileId: string) {
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
        setUploadedDatasetValue(null)
        setUploadedDataset(null)
        setError(result.message)
        return
      }

      setError(null)
      setActiveDataset(result.dataset)
      setActiveDatasetOrigin('uploaded')
      setActiveFileId(null)
      setActiveRow(result.dataset.rows[0] ?? null)
      setUploadedDatasetValue(result.dataset)
      setUploadedDataset({
        id: result.dataset.id,
        name: result.dataset.name,
      })
    } catch (error) {
      setActiveDataset(null)
      setActiveDatasetOrigin('uploaded')
      setActiveFileId(null)
      setActiveRow(null)
      setUploadedDatasetValue(null)
      setUploadedDataset(null)
      setError(
        error instanceof Error
          ? `Failed to read ${file.name}: ${error.message}`
          : `Failed to read ${file.name}.`,
      )
    } finally {
      setIsImporting(false)
    }
  }

  function selectUploadedDataset() {
    if (!uploadedDatasetValue) {
      setError('No uploaded dataset is available.')
      return
    }

    setError(null)
    setActiveDataset(uploadedDatasetValue)
    setActiveDatasetOrigin('uploaded')
    setActiveFileId(null)
    setActiveRow(uploadedDatasetValue.rows[0] ?? null)
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
    uploadedDataset,
    importFile,
    selectDataset,
    selectUploadedDataset,
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
      uploadedDataset: null,
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
        uploadedDataset: null,
      }
    : {
        activeDataset: null,
        activeDatasetOrigin: 'bundled',
        activeFileId: initialFile.id,
        activeRow: null,
        error: result.message,
        uploadedDataset: null,
      }
}
