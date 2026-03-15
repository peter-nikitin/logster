import { bundledDatasets } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { Card, CardContent } from '@/components/ui/card'
import { DatasetSourcePanel } from '@/ui/components/dataset-source-panel'
import { EmptyState } from '@/ui/components/empty-state'
import { DatasetTable } from '@/ui/components/dataset-table'
import { ErrorState } from '@/ui/components/error-state'
import { WorkspaceSidebar } from '@/ui/components/workspace-sidebar'
import { WorkspaceToolbar } from '@/ui/components/workspace-toolbar'
import { useActiveDataset } from '@/ui/hooks/use-active-dataset'
import { uiTestIds } from '@/ui/test-ids'
import { useLayoutStore } from '@/ui/stores/layout-store'
import { useRef } from 'react'

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
  const fitColumnsToWidth = useLayoutStore((state) => state.fitColumnsToWidth)
  const setSidebarOpen = useLayoutStore((state) => state.setSidebarOpen)
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)
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
    <main className="flex h-screen min-h-screen w-full flex-col">
      <WorkspaceToolbar
        activeDataset={activeDataset}
        activeDatasetOrigin={activeDatasetOrigin}
        isSidebarOpen={isSidebarOpen}
        onFitColumns={handleFitColumns}
        onToggleSidebar={toggleSidebar}
      />

      <section className="flex min-h-0 flex-1">
        <WorkspaceSidebar isOpen={isSidebarOpen}>
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
            <Card className="min-h-0 flex-1 overflow-hidden border-border/70 bg-card/95 shadow-sm">
              <CardContent className="flex h-full min-h-0 p-0">
                <DatasetTable
                  dataset={activeDataset}
                  activeRowId={activeRow?.id ?? null}
                  onSelectRow={selectRow}
                />
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              isRestoring={isRestoring}
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
          )}
        </section>
      </section>
    </main>
  )
}

export default App
