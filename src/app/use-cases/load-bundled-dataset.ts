import { parseLogDataset } from '../../domain/log-dataset/services/parse-log-dataset'
import type { BundledDatasetFile } from '../../adapters/bundled-datasets/bundled-dataset-source'
import type { LogDataset } from '../../domain/log-dataset/entities/log-dataset'

export type LoadBundledDatasetResult =
  | { status: 'success'; dataset: LogDataset }
  | { status: 'error'; message: string }

export function loadBundledDataset(
  file: BundledDatasetFile,
): LoadBundledDatasetResult {
  try {
    return {
      status: 'success',
      dataset: parseLogDataset({
        datasetId: file.id,
        datasetName: file.name,
        rawContent: file.rawContent,
      }),
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown parsing error.'

    return {
      status: 'error',
      message: `Failed to parse ${file.name}: ${message}`,
    }
  }
}
