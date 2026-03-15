import type { DatasetRepository, StoredDatasetMeta } from '@/app/ports/dataset-repository'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

export type RestoreStoredDatasetsResult = {
  datasets: StoredDatasetMeta[]
  lastActiveDataset: LogDataset | null
  lastActiveDatasetMissing: boolean
}

export async function restoreStoredDatasets(
  repository: DatasetRepository,
): Promise<RestoreStoredDatasetsResult> {
  const datasets = await repository.list()
  const lastActiveId = await repository.getLastActiveId()

  if (!lastActiveId) {
    return {
      datasets,
      lastActiveDataset: null,
      lastActiveDatasetMissing: false,
    }
  }

  const lastActiveDataset = await repository.get(lastActiveId)

  return {
    datasets,
    lastActiveDataset,
    lastActiveDatasetMissing: lastActiveDataset === null,
  }
}
