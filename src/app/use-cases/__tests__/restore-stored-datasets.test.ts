import { describe, expect, it } from 'vitest'
import { createTestDataset } from '../../../../tests/helpers/create-test-dataset'
import { InMemoryDatasetRepository } from '../../../../tests/helpers/in-memory-dataset-repository'
import { restoreStoredDatasets } from '../restore-stored-datasets'

describe('restoreStoredDatasets', () => {
  it('returns the metadata list and no active dataset when none is stored', async () => {
    const repository = new InMemoryDatasetRepository()
    const result = await restoreStoredDatasets(repository)

    expect(result).toEqual({
      datasets: [],
      lastActiveDataset: null,
    })
  })

  it('restores the last active dataset when it exists', async () => {
    const dataset = createTestDataset()
    const repository = new InMemoryDatasetRepository({
      datasets: [dataset],
      lastActiveId: dataset.id,
    })

    const result = await restoreStoredDatasets(repository)

    expect(result).toEqual({
      datasets: [
        {
          id: dataset.id,
          name: dataset.name,
          rowCount: dataset.rows.length,
          savedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      lastActiveDataset: dataset,
    })
  })
})
