import type { DatasetRepository, StoredDatasetMeta } from '@/app/ports/dataset-repository'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

export type SaveUploadedDatasetResult = {
  meta: StoredDatasetMeta
  lastActiveSaved: boolean
}

export async function saveUploadedDataset(
  repository: DatasetRepository,
  dataset: LogDataset,
): Promise<SaveUploadedDatasetResult> {
  const meta = await repository.save(dataset)

  try {
    await repository.setLastActiveId(dataset.id)

    return {
      meta,
      lastActiveSaved: true,
    }
  } catch {
    return {
      meta,
      lastActiveSaved: false,
    }
  }
}
