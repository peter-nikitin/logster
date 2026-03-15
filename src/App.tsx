import { bundledDatasets } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { Card, CardContent } from '@/components/ui/card'
import { DatasetFiltersPanel } from '@/ui/components/dataset-filters-panel'
import { DatasetSourcePanel } from '@/ui/components/dataset-source-panel'
import { EmptyState } from '@/ui/components/empty-state'
import { DatasetTable } from '@/ui/components/dataset-table'
import { ErrorState } from '@/ui/components/error-state'
import { RowDetailsPanel } from '@/ui/components/row-details-panel'
import { WorkspaceSidebar } from '@/ui/components/workspace-sidebar'
import { WorkspaceToolbar } from '@/ui/components/workspace-toolbar'
import { useActiveDataset } from '@/ui/hooks/use-active-dataset'
import {
  deriveLogViewerState,
  resolveVisibleRowSelection,
} from '@/ui/presenters/derive-log-viewer-state'
import { uiTestIds } from '@/ui/test-ids'
import { useLayoutStore } from '@/ui/stores/layout-store'
import { useLogViewerFilterStore } from '@/ui/stores/log-viewer-filter-store'
import { useEffect, useMemo, useRef } from 'react'

function App() {
  const {
    activeDataset,
    activeDatasetOrigin,
    activeDatasetId,
    activeRow,
    deleteStoredDataset,
    feedback,
    importFile,
    isImporting,
    isRestoring,
    selectBundledDataset,
    selectRow,
    selectStoredDataset,
    storedDatasets,
  } = useActiveDataset(bundledDatasets)
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)
  const activeSidebarPanel = useLayoutStore((state) => state.activeSidebarPanel)
  const fitColumnsToWidth = useLayoutStore((state) => state.fitColumnsToWidth)
  const openSidebarPanel = useLayoutStore((state) => state.openSidebarPanel)
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
  const contentRef = useRef<HTMLElement | null>(null)
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

  function handleFitColumns() {
    const tableViewport = contentRef.current?.querySelector<HTMLElement>(
      `[data-testid="${uiTestIds.datasetTable}"]`,
    )
    const availableWidth =
      tableViewport?.clientWidth ?? contentRef.current?.clientWidth

    if (!availableWidth) {
      return
    }

    fitColumnsToWidth(availableWidth)
  }

  return (
    <main className="flex h-screen min-h-screen w-full flex-col">
      <WorkspaceToolbar
        activeDataset={activeDataset}
        activeDatasetOrigin={activeDatasetOrigin}
        activeSidebarPanel={activeSidebarPanel}
        isSidebarOpen={isSidebarOpen}
        onFitColumns={handleFitColumns}
        onOpenSidebarPanel={openSidebarPanel}
      />

      <section className="flex min-h-0 flex-1">
        <WorkspaceSidebar isOpen={isSidebarOpen}>
          {activeSidebarPanel === 'datasets' ? (
            <DatasetSourcePanel
              bundledDatasets={bundledDatasets}
              storedDatasets={storedDatasets}
              activeDatasetOrigin={activeDatasetOrigin}
              activeDatasetId={activeDatasetId}
              isImporting={isImporting}
              isRestoring={isRestoring}
              onImportFile={importFile}
              onSelectBundled={selectBundledDataset}
              onSelectStored={selectStoredDataset}
              onDeleteStored={deleteStoredDataset}
            />
          ) : (
            <DatasetFiltersPanel
              isDisabled={!activeDataset}
              methods={derivedViewerState.methods}
              includedMethods={includedMethods}
              excludedMethods={excludedMethods}
              includedMessages={includedMessages}
              excludedMessages={excludedMessages}
              expandedMethods={expandedMethods}
              totalCount={derivedViewerState.totalCount}
              visibleCount={derivedViewerState.visibleCount}
              onMethodIncludedChange={setMethodIncluded}
              onMethodExcludeToggle={toggleMethodExclude}
              onMessageIncludedChange={setMessageIncluded}
              onMessageExcludeToggle={toggleMessageExclude}
              onMethodExpandedToggle={toggleMethodExpanded}
              onClearFilters={clearFilters}
            />
          )}
        </WorkspaceSidebar>

        <section
          ref={contentRef}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4"
          aria-live="polite"
        >
          {feedback ? (
            <ErrorState
              title={feedback.title}
              message={feedback.message}
              tone={feedback.tone}
            />
          ) : null}

          {activeDataset ? (
            <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
              <Card className="min-h-0 min-w-0 flex-1 overflow-hidden border-border/70 bg-card/95 shadow-sm">
                <CardContent className="flex h-full min-h-0 p-0">
                  <DatasetTable
                    rows={derivedViewerState.visibleRows}
                    activeRowId={activeRow?.id ?? null}
                    markedRowIds={derivedViewerState.markedRowIds}
                    onSelectRow={selectRow}
                    onClearFilters={clearFilters}
                  />
                </CardContent>
              </Card>
              <RowDetailsPanel row={visibleActiveRow} />
            </div>
          ) : (
            <EmptyState
              isRestoring={isRestoring}
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={() => openSidebarPanel('datasets')}
            />
          )}
        </section>
      </section>
    </main>
  )
}

export default App
