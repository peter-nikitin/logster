import { describe, expect, it } from 'vitest'
import { InMemoryDatasetRepository } from '../../../../tests/helpers/in-memory-dataset-repository'
import { deleteStoredDataset } from '../delete-stored-dataset'

describe('deleteStoredDataset', () => {
  it('removes the requested dataset', async () => {
    const repository = new InMemoryDatasetRepository()

    await deleteStoredDataset(repository, 'uploaded:abc')

    expect(repository.lastRemovedId).toBe('uploaded:abc')
  })
})
