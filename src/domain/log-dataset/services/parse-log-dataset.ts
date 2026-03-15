import type { LogDataset } from '../entities/log-dataset'
import type { LogRow } from '../entities/log-row'

type ParseLogDatasetInput = {
  datasetId: string
  datasetName: string
  rawContent: string
}

type RawLogEntry = [number, string, string, unknown?]

export function parseLogDataset({
  datasetId,
  datasetName,
  rawContent,
}: ParseLogDatasetInput): LogDataset {
  let parsedJson: unknown

  try {
    parsedJson = JSON.parse(rawContent)
  } catch {
    throw new Error('File is not valid JSON.')
  }

  if (!Array.isArray(parsedJson)) {
    throw new Error('Expected a top-level array of log rows.')
  }

  const rows = parsedJson.map((entry, index) =>
    normalizeLogRow(
      datasetId,
      entry,
      index,
      index > 0 ? parsedJson[index - 1] : null,
    ),
  )

  return {
    id: datasetId,
    name: datasetName,
    rows,
  }
}

function normalizeLogRow(
  datasetId: string,
  entry: unknown,
  index: number,
  previousEntry: unknown,
): LogRow {
  if (!Array.isArray(entry)) {
    throw new Error(`Row ${index + 1} must be an array.`)
  }

  if (entry.length < 3 || entry.length > 4) {
    throw new Error(
      `Row ${index + 1} must have 3 or 4 items, received ${entry.length}.`,
    )
  }

  const [timestamp, method, message, payload] = entry as RawLogEntry

  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    throw new Error(`Row ${index + 1} has an invalid timestamp.`)
  }

  if (typeof method !== 'string' || method.trim().length === 0) {
    throw new Error(`Row ${index + 1} has an invalid method.`)
  }

  if (typeof message !== 'string') {
    throw new Error(`Row ${index + 1} has an invalid message.`)
  }

  const deltaMs = getDeltaMs(previousEntry, timestamp, index)

  return payload === undefined
    ? {
        id: `${datasetId}:${index}`,
        timestamp,
        method,
        message,
        deltaMs,
      }
    : {
        id: `${datasetId}:${index}`,
        timestamp,
        method,
        message,
        deltaMs,
        payload,
      }
}

function getDeltaMs(
  previousEntry: unknown,
  timestamp: number,
  index: number,
): number | null {
  if (index === 0 || previousEntry === null) {
    return null
  }

  if (!Array.isArray(previousEntry) || previousEntry.length === 0) {
    throw new Error(`Row ${index} has an invalid previous row.`)
  }

  const previousTimestamp = previousEntry[0]

  if (typeof previousTimestamp !== 'number' || !Number.isFinite(previousTimestamp)) {
    throw new Error(`Row ${index} has an invalid previous timestamp.`)
  }

  return timestamp - previousTimestamp
}
