import { Card, CardContent } from '@/components/ui/card'
import { DatasetTable } from '@/ui/components/dataset-table'
import { DatasetTableToolbar } from '@/ui/components/dataset-table-toolbar'
import { EmptyState } from '@/ui/components/empty-state'
import { ErrorState } from '@/ui/components/error-state'
import { RowDetailsPanel } from '@/ui/components/row-details-panel'
import { useWorkspace } from '@/ui/context/app-context'
import { uiTestIds } from '@/ui/test-ids'
import { useLayoutStore } from '@/ui/stores/layout-store'
import { useRef } from 'react'

export function Content() {
  const { datasetState, viewerState } = useWorkspace()
  const fitColumnsToWidth = useLayoutStore((state) => state.fitColumnsToWidth)
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)
  const openSidebarPanel = useLayoutStore((state) => state.openSidebarPanel)
  const contentRef = useRef<HTMLElement | null>(null)

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
    <section
      ref={contentRef}
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-3"
      aria-live="polite"
    >
      {datasetState.feedback ? (
        <ErrorState
          title={datasetState.feedback.title}
          message={datasetState.feedback.message}
          tone={datasetState.feedback.tone}
        />
      ) : null}

      {datasetState.activeDataset ? (
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
          <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <DatasetTableToolbar
              rowCount={viewerState.derivedViewerState.visibleRows.length}
              onFitColumns={handleFitColumns}
            />
            <CardContent className="flex h-full min-h-0 p-0">
              <DatasetTable
                rows={viewerState.derivedViewerState.visibleRows}
                activeRowId={datasetState.activeRow?.id ?? null}
                markedRowIds={viewerState.derivedViewerState.markedRowIds}
                onSelectRow={datasetState.selectRow}
                onClearFilters={viewerState.clearFilters}
              />
            </CardContent>
          </Card>
          <RowDetailsPanel row={viewerState.visibleActiveRow} />
        </div>
      ) : (
        <EmptyState
          isRestoring={datasetState.isRestoring}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => openSidebarPanel('datasets')}
        />
      )}
    </section>
  )
}
