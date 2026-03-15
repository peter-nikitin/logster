import type { LogRow } from '@/domain/log-dataset/entities/log-row'

export function presentLogRow(row: LogRow) {
  return {
    id: row.id,
    timeLabel: formatTimestamp(row.timestamp),
    deltaLabel: formatDelta(row.deltaMs),
    method: row.method,
    message: row.message,
    payloadPreview:
      row.payload === undefined ? 'No payload' : truncateJson(row.payload, 140),
  }
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toISOString().slice(11, 23)
}

function formatDelta(deltaMs: number | null) {
  return deltaMs === null ? '—' : `+${deltaMs} ms`
}

function truncateJson(value: unknown, maxLength: number) {
  const serialized = JSON.stringify(value)

  if (serialized.length <= maxLength) {
    return serialized
  }

  return `${serialized.slice(0, maxLength - 1)}…`
}
