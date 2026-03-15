import { bundledDatasets } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BundledFileList } from '@/ui/components/bundled-file-list'
import { DatasetTable } from '@/ui/components/dataset-table'
import { ErrorState } from '@/ui/components/error-state'
import { RowDetails } from '@/ui/components/row-details'
import { useActiveDataset } from '@/ui/hooks/use-active-dataset'

function App() {
  const {
    activeDataset,
    activeDatasetOrigin,
    activeFileId,
    activeRow,
    error,
    importFile,
    isImporting,
    selectDataset,
    selectUploadedDataset,
    selectRow,
    uploadedDataset,
  } = useActiveDataset(bundledDatasets)

  return (
    <main className="min-h-screen w-full px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 space-y-4">
        <Badge variant="outline" className="border-primary/30 text-primary">
          Task 03
        </Badge>
        <div className="space-y-3">
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Custom file upload
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
            Select a bundled file or upload your own log JSON, then inspect the
            rows in the same table viewer and details panel.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <BundledFileList
          datasets={bundledDatasets}
          activeDatasetOrigin={activeDatasetOrigin}
          activeFileId={activeFileId}
          isImporting={isImporting}
          uploadedDataset={uploadedDataset}
          onImportFile={importFile}
          onSelect={selectDataset}
          onSelectUploaded={selectUploadedDataset}
        />

        <section className="space-y-6" aria-live="polite">
          {error ? <ErrorState message={error} /> : null}

          {activeDataset ? (
            <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
              <CardHeader className="gap-4 border-b border-border/70 bg-muted/40">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{activeDataset.name}</CardTitle>
                    <CardDescription>
                      {activeDataset.rows.length} rows in source order. Select a
                      row to inspect the full content below.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={activeDatasetOrigin === 'uploaded' ? 'default' : 'secondary'} className="w-fit">
                      {activeDatasetOrigin === 'uploaded' ? 'Uploaded' : 'Bundled'}
                    </Badge>
                    <Badge variant="secondary" className="w-fit">
                      {activeDataset.rows.length} entries
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <DatasetTable
                  dataset={activeDataset}
                  activeRowId={activeRow?.id ?? null}
                  onSelectRow={selectRow}
                />
              </CardContent>
            </Card>
          ) : null}

          {activeRow ? (
            <>
              <Separator />
              <RowDetails row={activeRow} />
            </>
          ) : null}
        </section>
      </section>
    </main>
  )
}

export default App
