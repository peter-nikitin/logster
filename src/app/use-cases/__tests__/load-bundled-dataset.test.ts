import { describe, expect, it } from 'vitest'
import { loadBundledDataset } from '../load-bundled-dataset'

describe('loadBundledDataset', () => {
  it('returns a parsed dataset on success', () => {
    const result = loadBundledDataset({
      id: 'example',
      name: 'example.json',
      rawContent: JSON.stringify([[1000, '[scope]', 'message']]),
    })

    expect(result.status).toBe('success')

    if (result.status === 'success') {
      expect(result.dataset.id).toBe('example')
      expect(result.dataset.rows).toHaveLength(1)
    }
  })

  it('returns a readable error when parsing fails', () => {
    const result = loadBundledDataset({
      id: 'broken',
      name: 'broken.json',
      rawContent: '{"bad":true}',
    })

    expect(result).toEqual({
      status: 'error',
      message: 'Failed to parse broken.json: Expected a top-level array of log rows.',
    })
  })
})
