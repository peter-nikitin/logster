import { describe, expect, it } from 'vitest'
import { createTestDataset } from '../../../../tests/helpers/create-test-dataset'
import { InMemoryDatasetRepository } from '../../../../tests/helpers/in-memory-dataset-repository'
import { saveUploadedDataset } from '../save-uploaded-dataset'

describe('saveUploadedDataset', () => {
  it('saves the dataset and updates the last active id', async () => {
    const repository = new InMemoryDatasetRepository()
    const dataset = createTestDataset()

    const result = await saveUploadedDataset(repository, dataset)

    expect(repository.lastSavedDataset).toEqual(dataset)
    expect(repository.lastActiveId).toBe(dataset.id)
    expect(result).toEqual({
      meta: {
        id: dataset.id,
        name: dataset.name,
        rowCount: dataset.rows.length,
        savedAt: '2026-01-01T00:00:00.000Z',
      },
      lastActiveSaved: true,
    })
  })

  it('keeps the saved dataset when persisting the last active id fails', async () => {
    const dataset = createTestDataset()

    class FailingLastActiveRepository extends InMemoryDatasetRepository {
      override async setLastActiveId(): Promise<void> {
        throw new Error('meta store unavailable')
      }
    }

    const repository = new FailingLastActiveRepository()
    const result = await saveUploadedDataset(repository, dataset)

    expect(result).toEqual({
      meta: {
        id: dataset.id,
        name: dataset.name,
        rowCount: dataset.rows.length,
        savedAt: '2026-01-01T00:00:00.000Z',
      },
      lastActiveSaved: false,
    })
    expect(repository.lastSavedDataset).toEqual(dataset)
  })
})
