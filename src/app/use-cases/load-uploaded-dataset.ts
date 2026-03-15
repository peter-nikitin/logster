import { parseLogDataset } from '@/domain/log-dataset/services/parse-log-dataset'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

export type UploadedDatasetInput = {
  fileName: string
  rawContent: string
}

export type LoadUploadedDatasetResult =
  | { status: 'success'; dataset: LogDataset }
  | { status: 'error'; message: string }

export function loadUploadedDataset({
  fileName,
  rawContent,
}: UploadedDatasetInput): LoadUploadedDatasetResult {
  const datasetId = createUploadedDatasetId(fileName)

  try {
    return {
      status: 'success',
      dataset: parseLogDataset({
        datasetId,
        datasetName: fileName,
        rawContent,
      }),
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown parsing error.'

    return {
      status: 'error',
      message: `Failed to import ${fileName}: ${message}`,
    }
  }
}

function createUploadedDatasetId(fileName: string) {
  return `uploaded:${slugify(fileName)}:${randomId()}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}
