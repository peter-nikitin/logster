import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'

export function createTestDataset(overrides?: Partial<LogDataset>): LogDataset {
  return {
    id: 'uploaded:test-dataset',
    name: 'test-dataset.json',
    rows: [
      {
        id: 'uploaded:test-dataset:0',
        timestamp: 1000,
        method: '[scope]',
        message: 'first message',
        deltaMs: null,
      },
      {
        id: 'uploaded:test-dataset:1',
        timestamp: 1050,
        method: '[scope]',
        message: 'second message',
        deltaMs: 50,
        payload: { ok: true },
      },
    ],
    ...overrides,
  }
}
