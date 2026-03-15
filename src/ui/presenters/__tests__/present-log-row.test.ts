import { describe, expect, it } from 'vitest'
import { presentLogRow } from '../present-log-row'

describe('presentLogRow', () => {
  it('formats time and delta labels', () => {
    const presented = presentLogRow({
      id: 'row-1',
      timestamp: Date.UTC(2026, 0, 1, 12, 0, 0, 125),
      method: '[scope]',
      message: 'message',
      deltaMs: 50,
    })

    expect(presented.timeLabel).toBe('12:00:00.125')
    expect(presented.deltaLabel).toBe('+50 ms')
  })

  it('returns no payload when payload is missing', () => {
    const presented = presentLogRow({
      id: 'row-1',
      timestamp: 0,
      method: '[scope]',
      message: 'message',
      deltaMs: null,
    })

    expect(presented.deltaLabel).toBe('—')
    expect(presented.payloadPreview).toBe('No payload')
  })

  it('truncates long payload previews', () => {
    const presented = presentLogRow({
      id: 'row-1',
      timestamp: 0,
      method: '[scope]',
      message: 'message',
      deltaMs: 10,
      payload: { long: 'x'.repeat(200) },
    })

    expect(presented.payloadPreview.endsWith('…')).toBe(true)
  })
})
