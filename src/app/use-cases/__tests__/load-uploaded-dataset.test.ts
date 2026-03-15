import { describe, expect, it } from 'vitest'
import { loadUploadedDataset } from '../load-uploaded-dataset'

describe('loadUploadedDataset', () => {
  it('returns a parsed dataset on success with a generated uploaded id', () => {
    const result = loadUploadedDataset({
      fileName: 'session-log.json',
      rawContent: JSON.stringify([[1000, '[scope]', 'hello']]),
    })

    expect(result.status).toBe('success')

    if (result.status === 'success') {
      expect(result.dataset.id).toMatch(/^uploaded:session-log-json:/)
      expect(result.dataset.name).toBe('session-log.json')
      expect(result.dataset.rows).toHaveLength(1)
    }
  })

  it('returns a readable error when parsing fails', () => {
    const result = loadUploadedDataset({
      fileName: 'broken.json',
      rawContent: '{"bad":true}',
    })

    expect(result).toEqual({
      status: 'error',
      message: 'Failed to import broken.json: Expected a top-level array of log rows.',
    })
  })
})
