import { Card, CardContent } from '@/components/ui/card'
import { DatasetTable } from '@/ui/components/dataset-table'
import { DatasetTableToolbar } from '@/ui/components/dataset-table-toolbar'
import { EmptyState } from '@/ui/components/empty-state'
import { ErrorState } from '@/ui/components/error-state'
import { RowDetailsPanel } from '@/ui/components/row-details-panel'
import { useWorkspace } from '@/ui/context/app-context'
import { uiTestIds } from '@/ui/test-ids'
import { useLayoutStore } from '@/ui/stores/layout-store'
import { useRef, useState } from 'react'

export function Content() {
  const { datasetState, viewerState } = useWorkspace()
  const fitColumnsToWidth = useLayoutStore((state) => state.fitColumnsToWidth)
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)
  const openSidebarPanel = useLayoutStore((state) => state.openSidebarPanel)
  const contentRef = useRef<HTMLElement | null>(null)
  const [detailsHeight, setDetailsHeight] = useState(240)

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

  function handleDetailsResizeStart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const startY = event.clientY
    const startHeight = detailsHeight

    function handlePointerMove(moveEvent: MouseEvent) {
      const containerHeight = contentRef.current?.clientHeight ?? 0
      const nextHeight = startHeight - (moveEvent.clientY - startY)
      const maxHeight = Math.max(180, containerHeight - 220)

      setDetailsHeight(Math.min(Math.max(nextHeight, 160), maxHeight))
    }

    function handlePointerUp() {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)
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
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          <Card className="flex min-h-0 min-w-0 flex-1 shrink flex-col overflow-hidden">
            <DatasetTableToolbar
              visibleCount={viewerState.derivedViewerState.visibleRows.length}
              totalCount={viewerState.derivedViewerState.totalCount}
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
          <div
            className="flex min-h-0 shrink-0 flex-col overflow-hidden"
            style={{ height: detailsHeight }}
          >
            <button
              type="button"
              aria-label="Resize row details panel"
              className="flex h-3 shrink-0 cursor-row-resize items-center justify-center rounded-full bg-transparent text-muted-foreground hover:bg-accent/40"
              onMouseDown={handleDetailsResizeStart}
            >
              <span className="h-1 w-16 rounded-full bg-border" />
            </button>
            <RowDetailsPanel row={viewerState.visibleActiveRow} />
          </div>
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
