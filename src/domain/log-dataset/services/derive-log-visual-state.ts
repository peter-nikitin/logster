import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import { LogItem, type LogVisualFilterSelection } from '@/domain/log-dataset/entities/log-item'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'

export type MessageFacetSummary = {
  message: string
  rowCount: number
}

export type MethodFacetSummary = {
  method: string
  rowCount: number
  messages: MessageFacetSummary[]
}

export type DerivedLogVisualState = {
  methods: MethodFacetSummary[]
  visibleRows: LogRow[]
  markedRowIds: Set<string>
  visibleCount: number
  totalCount: number
}

export function deriveLogVisualState(
  dataset: LogDataset | null,
  selection: LogVisualFilterSelection,
): DerivedLogVisualState {
  if (!dataset) {
    return {
      methods: [],
      visibleRows: [],
      markedRowIds: new Set(),
      visibleCount: 0,
      totalCount: 0,
    }
  }

  const items = dataset.rows.map((row) => new LogItem(row))
  const visibleItems = items.filter((item) => item.matchesVisualFilter(selection))

  return {
    methods: summarizeMethods(items),
    visibleRows: visibleItems.map((item) => item.value),
    markedRowIds: new Set(),
    visibleCount: visibleItems.length,
    totalCount: items.length,
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

function summarizeMethods(items: LogItem[]) {
  const methods = new Map<string, { rowCount: number; messages: Map<string, number> }>()

  items.forEach((item) => {
    const current =
      methods.get(item.method) ?? {
        rowCount: 0,
        messages: new Map<string, number>(),
      }

    current.rowCount += 1
    current.messages.set(item.message, (current.messages.get(item.message) ?? 0) + 1)
    methods.set(item.method, current)
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
