import type { DatasetRepository, StoredDatasetMeta } from '@/app/ports/dataset-repository'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

export async function saveUploadedDataset(
  repository: DatasetRepository,
  dataset: LogDataset,
): Promise<StoredDatasetMeta> {
  const meta = await repository.save(dataset)
  await repository.setLastActiveId(dataset.id)
  return meta
}
