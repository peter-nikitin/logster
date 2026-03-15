import { useEffect, useMemo } from 'react'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'
import {
  deriveLogViewerState,
  resolveVisibleRowSelection,
} from '@/ui/presenters/derive-log-viewer-state'
import { useLogViewerFilterStore } from '@/ui/stores/log-viewer-filter-store'

type UseLogViewerWorkspaceOptions = {
  activeDataset: LogDataset | null
  activeDatasetId: string | null
  activeRow: LogRow | null
  selectRow: (rowId: string | null) => void
}

export function useLogViewerWorkspace({
  activeDataset,
  activeDatasetId,
  activeRow,
  selectRow,
}: UseLogViewerWorkspaceOptions) {
  const includedMethods = useLogViewerFilterStore((state) => state.includedMethods)
  const excludedMethods = useLogViewerFilterStore((state) => state.excludedMethods)
  const includedMessages = useLogViewerFilterStore((state) => state.includedMessages)
  const excludedMessages = useLogViewerFilterStore((state) => state.excludedMessages)
  const expandedMethods = useLogViewerFilterStore((state) => state.expandedMethods)
  const setMethodIncluded = useLogViewerFilterStore((state) => state.setMethodIncluded)
  const toggleMethodExclude = useLogViewerFilterStore((state) => state.toggleMethodExclude)
  const setMessageIncluded = useLogViewerFilterStore((state) => state.setMessageIncluded)
  const toggleMessageExclude = useLogViewerFilterStore((state) => state.toggleMessageExclude)
  const toggleMethodExpanded = useLogViewerFilterStore((state) => state.toggleMethodExpanded)
  const clearFilters = useLogViewerFilterStore((state) => state.clearFilters)
  const resetForDataset = useLogViewerFilterStore((state) => state.resetForDataset)

  const derivedViewerState = useMemo(
    () =>
      deriveLogViewerState(activeDataset, {
        includedMethods,
        excludedMethods,
        includedMessages,
        excludedMessages,
      }),
    [activeDataset, includedMethods, excludedMethods, includedMessages, excludedMessages],
  )

  const visibleActiveRow =
    activeRow && derivedViewerState.visibleRows.some((row) => row.id === activeRow.id)
      ? activeRow
      : null

  useEffect(() => {
    resetForDataset()
  }, [activeDatasetId, resetForDataset])

  useEffect(() => {
    const nextRowId = resolveVisibleRowSelection(
      activeRow?.id ?? null,
      derivedViewerState.visibleRows,
    )

    if ((activeRow?.id ?? null) !== nextRowId) {
      selectRow(nextRowId)
    }
  }, [activeRow?.id, derivedViewerState.visibleRows, selectRow])

  return {
    clearFilters,
    derivedViewerState,
    excludedMessages,
    excludedMethods,
    expandedMethods,
    includedMessages,
    includedMethods,
    setMessageIncluded,
    setMethodIncluded,
    toggleMessageExclude,
    toggleMethodExclude,
    toggleMethodExpanded,
    visibleActiveRow,
  }
}
