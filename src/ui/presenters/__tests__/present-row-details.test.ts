import { describe, expect, it } from 'vitest'
import { presentRowDetails } from '../present-row-details'

describe('presentRowDetails', () => {
  it('formats first-row details', () => {
    const details = presentRowDetails({
      id: 'row-1',
      timestamp: Date.UTC(2026, 0, 1, 12, 0, 0, 0),
      method: '[scope]',
      message: 'message',
      deltaMs: null,
    })

    expect(details.timestampLabel).toBe('2026-01-01T12:00:00.000Z')
    expect(details.deltaLabel).toBe('First row')
    expect(details.json).toContain('"method": "[scope]"')
  })

  it('formats non-first-row delta details', () => {
    const details = presentRowDetails({
      id: 'row-2',
      timestamp: 0,
      method: '[scope]',
      message: 'message',
      deltaMs: 25,
      payload: { ok: true },
    })

    expect(details.deltaLabel).toBe('Delta 25 ms')
  })
})
