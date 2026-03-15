import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'
import type { MessageFacet } from '@/ui/stores/log-viewer-filter-store'

export type MessageFacetSummary = {
  message: string
  rowCount: number
}

export type MethodFacetSummary = {
  method: string
  rowCount: number
  messages: MessageFacetSummary[]
}

export type LogViewerFilters = {
  includedMethods: string[]
  excludedMethods: string[]
  includedMessages: MessageFacet[]
  excludedMessages: MessageFacet[]
}

export type DerivedLogViewerState = {
  methods: MethodFacetSummary[]
  visibleRows: LogRow[]
  markedRowIds: Set<string>
  visibleCount: number
  totalCount: number
}

export function deriveLogViewerState(
  dataset: LogDataset | null,
  filters: LogViewerFilters,
): DerivedLogViewerState {
  if (!dataset) {
    return {
      methods: [],
      visibleRows: [],
      markedRowIds: new Set(),
      visibleCount: 0,
      totalCount: 0,
    }
  }

  const methods = summarizeMethods(dataset.rows)
  const includedMethods = new Set(filters.includedMethods)
  const excludedMethods = new Set(filters.excludedMethods)
  const includedMessages = new Set(filters.includedMessages.map(toFacetKey))
  const excludedMessages = new Set(filters.excludedMessages.map(toFacetKey))
  const hasPositiveSelections =
    includedMethods.size > 0 || includedMessages.size > 0

  const visibleRows = dataset.rows.filter((row) => {
    const rowFacetKey = toFacetKey({ method: row.method, message: row.message })
    const isIncluded =
      !hasPositiveSelections ||
      includedMethods.has(row.method) ||
      includedMessages.has(rowFacetKey)
    const isExcluded =
      excludedMethods.has(row.method) || excludedMessages.has(rowFacetKey)

    return isIncluded && !isExcluded
  })

  return {
    methods,
    visibleRows,
    markedRowIds: new Set(),
    visibleCount: visibleRows.length,
    totalCount: dataset.rows.length,
  }
}

export function resolveVisibleRowSelection(
  activeRowId: string | null,
  visibleRows: LogRow[],
): string | null {
  if (visibleRows.length === 0) {
    return null
  }

  if (activeRowId && visibleRows.some((row) => row.id === activeRowId)) {
    return activeRowId
  }

  return visibleRows[0].id
}

function summarizeMethods(rows: LogRow[]) {
  const methods = new Map<string, { rowCount: number; messages: Map<string, number> }>()

  rows.forEach((row) => {
    const current =
      methods.get(row.method) ?? {
        rowCount: 0,
        messages: new Map<string, number>(),
      }

    current.rowCount += 1
    current.messages.set(row.message, (current.messages.get(row.message) ?? 0) + 1)
    methods.set(row.method, current)
  })

  return [...methods.entries()]
    .map(([method, summary]) => ({
      method,
      rowCount: summary.rowCount,
      messages: [...summary.messages.entries()]
        .map(([message, rowCount]) => ({ message, rowCount }))
        .sort((left, right) => {
          if (right.rowCount !== left.rowCount) {
            return right.rowCount - left.rowCount
          }

          return left.message.localeCompare(right.message)
        }),
    }))
    .sort((left, right) => {
      if (right.rowCount !== left.rowCount) {
        return right.rowCount - left.rowCount
      }

      return left.method.localeCompare(right.method)
    })
}

function toFacetKey(facet: MessageFacet) {
  return `${facet.method}::${facet.message}`
}
