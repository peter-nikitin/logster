import { describe, expect, it } from 'vitest'
import { createTestDataset } from '../../../../tests/helpers/create-test-dataset'
import {
  deriveLogViewerState,
  resolveVisibleRowSelection,
} from '@/ui/presenters/derive-log-viewer-state'

describe('deriveLogViewerState', () => {
  const dataset = createTestDataset({
    rows: [
      {
        id: 'row-1',
        timestamp: 1000,
        method: '[alpha]',
        message: 'first message',
        deltaMs: null,
      },
      {
        id: 'row-2',
        timestamp: 1050,
        method: '[beta]',
        message: 'second message',
        deltaMs: 50,
      },
      {
        id: 'row-3',
        timestamp: 1100,
        method: '[alpha]',
        message: 'special trace',
        deltaMs: 50,
      },
    ],
  })

  it('builds a tree of methods and inner messages', () => {
    const result = deriveLogViewerState(dataset, {
      includedMethods: [],
      excludedMethods: [],
      includedMessages: [],
      excludedMessages: [],
    })

    expect(result.methods).toEqual([
      {
        method: '[alpha]',
        rowCount: 2,
        messages: [
          { message: 'first message', rowCount: 1 },
          { message: 'special trace', rowCount: 1 },
        ],
      },
      {
        method: '[beta]',
        rowCount: 1,
        messages: [{ message: 'second message', rowCount: 1 }],
      },
    ])
    expect(result.visibleRows.map((row) => row.id)).toEqual(['row-1', 'row-2', 'row-3'])
  })

  it('includes rows when a method facet is checked', () => {
    const result = deriveLogViewerState(dataset, {
      includedMethods: ['[alpha]'],
      excludedMethods: [],
      includedMessages: [],
      excludedMessages: [],
    })

    expect(result.visibleRows.map((row) => row.id)).toEqual(['row-1', 'row-3'])
  })

  it('includes rows when a child message facet is checked', () => {
    const result = deriveLogViewerState(dataset, {
      includedMethods: [],
      excludedMethods: [],
      includedMessages: [{ method: '[alpha]', message: 'special trace' }],
      excludedMessages: [],
    })

    expect(result.visibleRows.map((row) => row.id)).toEqual(['row-3'])
  })

  it('applies inverted method facets as exclusions', () => {
    const result = deriveLogViewerState(dataset, {
      includedMethods: [],
      excludedMethods: ['[alpha]'],
      includedMessages: [],
      excludedMessages: [],
    })

    expect(result.visibleRows.map((row) => row.id)).toEqual(['row-2'])
  })

  it('lets exclusion win over inclusion on the same branch', () => {
    const result = deriveLogViewerState(dataset, {
      includedMethods: ['[alpha]'],
      excludedMethods: [],
      includedMessages: [],
      excludedMessages: [{ method: '[alpha]', message: 'special trace' }],
    })

    expect(result.visibleRows.map((row) => row.id)).toEqual(['row-1'])
  })

  it('keeps child-positive selections when a parent becomes partial', () => {
    const result = deriveLogViewerState(dataset, {
      includedMethods: [],
      excludedMethods: [],
      includedMessages: [
        { method: '[alpha]', message: 'first message' },
      ],
      excludedMessages: [],
    })

    expect(result.visibleRows.map((row) => row.id)).toEqual(['row-1'])
  })
})

describe('resolveVisibleRowSelection', () => {
  const visibleRows = createTestDataset({
    rows: [
      {
        id: 'row-1',
        timestamp: 1000,
        method: '[alpha]',
        message: 'first message',
        deltaMs: null,
      },
      {
        id: 'row-2',
        timestamp: 1050,
        method: '[beta]',
        message: 'second message',
        deltaMs: 50,
      },
    ],
  }).rows

  it('keeps the active row when it remains visible', () => {
    expect(resolveVisibleRowSelection('row-2', visibleRows)).toBe('row-2')
  })

  it('falls back to the first visible row when the active row is filtered out', () => {
    expect(resolveVisibleRowSelection('missing-row', visibleRows)).toBe('row-1')
  })

  it('clears selection when no rows remain visible', () => {
    expect(resolveVisibleRowSelection('row-1', [])).toBeNull()
  })
})
