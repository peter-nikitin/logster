import { describe, expect, it } from 'vitest'
import { parseLogDataset } from '../parse-log-dataset'

describe('parseLogDataset', () => {
  it('parses valid rows and preserves order', () => {
    const dataset = parseLogDataset({
      datasetId: 'dataset-1',
      datasetName: 'dataset.json',
      rawContent: JSON.stringify([
        [1000, '[scope-a]', 'first'],
        [1050, '[scope-b]', 'second', { ok: true }],
      ]),
    })

    expect(dataset).toEqual({
      id: 'dataset-1',
      name: 'dataset.json',
      rows: [
        {
          id: 'dataset-1:0',
          timestamp: 1000,
          method: '[scope-a]',
          message: 'first',
          deltaMs: null,
        },
        {
          id: 'dataset-1:1',
          timestamp: 1050,
          method: '[scope-b]',
          message: 'second',
          deltaMs: 50,
          payload: { ok: true },
        },
      ],
    })
  })

  it('throws for invalid json', () => {
    expect(() =>
      parseLogDataset({
        datasetId: 'dataset-1',
        datasetName: 'dataset.json',
        rawContent: '{',
      }),
    ).toThrow('File is not valid JSON.')
  })

  it('throws for non-array top level input', () => {
    expect(() =>
      parseLogDataset({
        datasetId: 'dataset-1',
        datasetName: 'dataset.json',
        rawContent: JSON.stringify({ rows: [] }),
      }),
    ).toThrow('Expected a top-level array of log rows.')
  })

  it('throws for a row with too few items', () => {
    expect(() =>
      parseLogDataset({
        datasetId: 'dataset-1',
        datasetName: 'dataset.json',
        rawContent: JSON.stringify([[1000, '[scope]']]),
      }),
    ).toThrow('Row 1 must have 3 or 4 items, received 2.')
  })

  it('throws for invalid timestamp, method, and message shapes', () => {
    expect(() =>
      parseLogDataset({
        datasetId: 'dataset-1',
        datasetName: 'dataset.json',
        rawContent: JSON.stringify([['bad', '[scope]', 'message']]),
      }),
    ).toThrow('Row 1 has an invalid timestamp.')

    expect(() =>
      parseLogDataset({
        datasetId: 'dataset-1',
        datasetName: 'dataset.json',
        rawContent: JSON.stringify([[1000, '   ', 'message']]),
      }),
    ).toThrow('Row 1 has an invalid method.')

    expect(() =>
      parseLogDataset({
        datasetId: 'dataset-1',
        datasetName: 'dataset.json',
        rawContent: JSON.stringify([[1000, '[scope]', 123]]),
      }),
    ).toThrow('Row 1 has an invalid message.')
  })
})
