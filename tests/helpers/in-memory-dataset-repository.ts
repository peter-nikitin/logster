import type { DatasetRepository, StoredDatasetMeta } from '@/app/ports/dataset-repository'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

type InMemoryDatasetRepositoryOptions = {
  datasets?: LogDataset[]
  lastActiveId?: string | null
}

export class InMemoryDatasetRepository implements DatasetRepository {
  public lastSavedDataset: LogDataset | null = null
  public lastRemovedId: string | null = null
  public lastActiveId: string | null

  private readonly datasets = new Map<string, LogDataset>()
  private readonly savedAtById = new Map<string, string>()

  constructor(options: InMemoryDatasetRepositoryOptions = {}) {
    this.lastActiveId = options.lastActiveId ?? null

    for (const dataset of options.datasets ?? []) {
      this.datasets.set(dataset.id, dataset)
      this.savedAtById.set(dataset.id, '2026-01-01T00:00:00.000Z')
    }
  }

  async list(): Promise<StoredDatasetMeta[]> {
    return Array.from(this.datasets.values()).map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      rowCount: dataset.rows.length,
      savedAt: this.savedAtById.get(dataset.id) ?? '2026-01-01T00:00:00.000Z',
    }))
  }

  async get(id: string): Promise<LogDataset | null> {
    return this.datasets.get(id) ?? null
  }

  async save(dataset: LogDataset): Promise<StoredDatasetMeta> {
    this.lastSavedDataset = dataset
    this.datasets.set(dataset.id, dataset)

    const savedAt = '2026-01-01T00:00:00.000Z'
    this.savedAtById.set(dataset.id, savedAt)

    return {
      id: dataset.id,
      name: dataset.name,
      rowCount: dataset.rows.length,
      savedAt,
    }
  }

  async remove(id: string): Promise<void> {
    this.lastRemovedId = id
    this.datasets.delete(id)
    this.savedAtById.delete(id)

    if (this.lastActiveId === id) {
      this.lastActiveId = null
    }
  }

  async getLastActiveId(): Promise<string | null> {
    return this.lastActiveId
  }

  async setLastActiveId(id: string | null): Promise<void> {
    this.lastActiveId = id
  }
}
