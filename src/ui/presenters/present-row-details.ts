import type { LogRow } from '@/domain/log-dataset/entities/log-row'

export function presentRowDetails(row: LogRow) {
  return {
    timestampLabel: new Date(row.timestamp).toISOString(),
    deltaLabel: row.deltaMs === null ? 'First row' : `Delta ${row.deltaMs} ms`,
    method: row.method,
    message: row.message,
    json: JSON.stringify(row, null, 2),
  }
}
