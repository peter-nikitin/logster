import type { DatasetRepository } from '@/app/ports/dataset-repository'

export async function deleteStoredDataset(
  repository: DatasetRepository,
  datasetId: string,
): Promise<void> {
  await repository.remove(datasetId)
}
