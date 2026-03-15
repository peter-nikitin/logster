import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

export type StoredDatasetMeta = {
  id: string
  name: string
  rowCount: number
  savedAt: string
}

export interface DatasetRepository {
  list(): Promise<StoredDatasetMeta[]>
  get(id: string): Promise<LogDataset | null>
  save(dataset: LogDataset): Promise<StoredDatasetMeta>
  remove(id: string): Promise<void>
  getLastActiveId(): Promise<string | null>
  setLastActiveId(id: string | null): Promise<void>
}
