import { beforeEach, describe, expect, it } from 'vitest'
import { IndexedDbDatasetRepository } from '../indexeddb-dataset-repository'
import { createTestDataset } from '../../../../tests/helpers/create-test-dataset'

describe('IndexedDbDatasetRepository', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('logster')

      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve()
      request.onsuccess = () => resolve()
    })
  })

  it('saves, gets, lists, and removes datasets', async () => {
    const repository = new IndexedDbDatasetRepository()
    const dataset = createTestDataset()

    const meta = await repository.save(dataset)
    await repository.setLastActiveId(dataset.id)

    expect(await repository.get(dataset.id)).toEqual(dataset)
    expect(await repository.getLastActiveId()).toBe(dataset.id)
    expect(await repository.list()).toEqual([meta])

    await repository.remove(dataset.id)

    expect(await repository.get(dataset.id)).toBeNull()
    expect(await repository.getLastActiveId()).toBeNull()
    expect(await repository.list()).toEqual([])
  })
})
