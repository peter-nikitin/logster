import type { DatasetRepository, StoredDatasetMeta } from '@/app/ports/dataset-repository'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

const DATABASE_NAME = 'logster'
const DATABASE_VERSION = 1
const DATASET_STORE = 'datasets'
const META_STORE = 'meta'
const LAST_ACTIVE_KEY = 'last-active-id'

type StoredDatasetRecord = {
  id: string
  name: string
  rowCount: number
  savedAt: string
  dataset: LogDataset
}

export class IndexedDbDatasetRepository implements DatasetRepository {
  private databasePromise: Promise<IDBDatabase> | null = null

  async list(): Promise<StoredDatasetMeta[]> {
    const records = await this.readAllRecords()

    return records
      .map((record) => ({
        id: record.id,
        name: record.name,
        rowCount: record.rowCount,
        savedAt: record.savedAt,
      }))
      .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
  }

  async get(id: string): Promise<LogDataset | null> {
    const database = await this.getDatabase()
    const record = await requestToPromise<StoredDatasetRecord | undefined>(
      database.transaction(DATASET_STORE, 'readonly').objectStore(DATASET_STORE).get(id),
    )

    return record?.dataset ?? null
  }

  async save(dataset: LogDataset): Promise<StoredDatasetMeta> {
    const savedAt = new Date().toISOString()
    const record: StoredDatasetRecord = {
      id: dataset.id,
      name: dataset.name,
      rowCount: dataset.rows.length,
      savedAt,
      dataset,
    }

    const database = await this.getDatabase()
    const transaction = database.transaction(DATASET_STORE, 'readwrite')
    transaction.objectStore(DATASET_STORE).put(record)
    await transactionToPromise(transaction)

    return {
      id: record.id,
      name: record.name,
      rowCount: record.rowCount,
      savedAt: record.savedAt,
    }
  }

  async remove(id: string): Promise<void> {
    const database = await this.getDatabase()
    const transaction = database.transaction(DATASET_STORE, 'readwrite')
    transaction.objectStore(DATASET_STORE).delete(id)
    await transactionToPromise(transaction)

    const lastActiveId = await this.getLastActiveId()

    if (lastActiveId === id) {
      await this.setLastActiveId(null)
    }
  }

  async getLastActiveId(): Promise<string | null> {
    const database = await this.getDatabase()
    const request = database
      .transaction(META_STORE, 'readonly')
      .objectStore(META_STORE)
      .get(LAST_ACTIVE_KEY)

    const value = await requestToPromise<string | undefined>(request)

    return value ?? null
  }

  async setLastActiveId(id: string | null): Promise<void> {
    const database = await this.getDatabase()
    const transaction = database.transaction(META_STORE, 'readwrite')
    const store = transaction.objectStore(META_STORE)

    if (id === null) {
      store.delete(LAST_ACTIVE_KEY)
    } else {
      store.put(id, LAST_ACTIVE_KEY)
    }

    await transactionToPromise(transaction)
  }

  private async readAllRecords(): Promise<StoredDatasetRecord[]> {
    const database = await this.getDatabase()
    const request = database
      .transaction(DATASET_STORE, 'readonly')
      .objectStore(DATASET_STORE)
      .getAll()

    return requestToPromise<StoredDatasetRecord[]>(request)
  }

  private async getDatabase(): Promise<IDBDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = openDatabase()
    }

    return this.databasePromise
  }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB.'))
    }

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(DATASET_STORE)) {
        database.createObjectStore(DATASET_STORE, { keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE)
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }
  })
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed.'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }
  })
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.onerror = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    }

    transaction.onabort = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
    }

    transaction.oncomplete = () => {
      resolve()
    }
  })
}
