import type { BundledDatasetFile } from '@/adapters/bundled-datasets/bundled-dataset-source'
import type { StoredDatasetMeta } from '@/app/ports/dataset-repository'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { uiTestIds } from '@/ui/test-ids'
import { UploadDatasetButton } from '@/ui/components/upload-dataset-button'

type DatasetSourcePanelProps = {
  bundledDatasets: BundledDatasetFile[]
  storedDatasets: StoredDatasetMeta[]
  activeDatasetOrigin: 'bundled' | 'uploaded' | null
  activeFileId: string | null
  isImporting: boolean
  isRestoring: boolean
  onImportFile: (file: File) => Promise<void>
  onSelectBundled: (fileId: string) => void
  onSelectStored: (datasetId: string) => Promise<void>
  onDeleteStored: (datasetId: string) => Promise<void>
}

export function DatasetSourcePanel({
  bundledDatasets,
  storedDatasets,
  activeDatasetOrigin,
  activeFileId,
  isImporting,
  isRestoring,
  onImportFile,
  onSelectBundled,
  onSelectStored,
  onDeleteStored,
}: DatasetSourcePanelProps) {
  return (
    <Card
      className="border-border/70 bg-card/95 shadow-sm"
      data-testid={uiTestIds.datasetSourcePanel}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Datasets</CardTitle>
            <CardDescription>
              Upload, reopen, or switch between bundled and stored datasets.
            </CardDescription>
          </div>
          <Badge variant="secondary">{bundledDatasets.length + storedDatasets.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <UploadDatasetButton isImporting={isImporting} onImportFile={onImportFile} />

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Stored uploads
            </p>
            <Badge variant="outline">{storedDatasets.length}</Badge>
          </div>

          {isRestoring ? (
            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Restoring stored datasets…
            </div>
          ) : null}

          {!isRestoring && storedDatasets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              Uploaded datasets saved in this browser will appear here.
            </div>
          ) : null}

          {storedDatasets.map((dataset) => {
            const isActive =
              activeDatasetOrigin === 'uploaded' && dataset.id === activeFileId

            return (
              <div
                key={dataset.id}
                data-testid={uiTestIds.storedDatasetItem}
                className={cn(
                  'flex items-stretch gap-2 rounded-xl border border-border/70 p-2',
                  isActive && 'border-primary/40 bg-primary/10',
                )}
              >
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto flex-1 justify-start rounded-lg px-3 py-3 text-left hover:bg-muted/60"
                  onClick={() => onSelectStored(dataset.id)}
                >
                  <span className="flex w-full items-start justify-between gap-3">
                    <span className="space-y-1">
                      <span className="block font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Stored upload
                      </span>
                      <span className="block break-words font-mono text-sm text-foreground">
                        {dataset.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {dataset.rowCount} rows
                      </span>
                    </span>
                    <Badge variant={isActive ? 'default' : 'outline'}>
                      {isActive ? 'Active' : 'Open'}
                    </Badge>
                  </span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Delete stored dataset"
                  data-testid={uiTestIds.storedDatasetDeleteButton}
                  className="self-center text-muted-foreground hover:text-destructive"
                  onClick={() => onDeleteStored(dataset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete stored dataset</span>
                </Button>
              </div>
            )
          })}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Bundled examples
            </p>
            <Badge variant="outline">{bundledDatasets.length}</Badge>
          </div>

          {bundledDatasets.map((dataset) => {
            const isActive =
              activeDatasetOrigin === 'bundled' && dataset.id === activeFileId

            return (
              <Button
                key={dataset.id}
                type="button"
                variant="ghost"
                className={cn(
                  'h-auto w-full justify-start rounded-xl border border-border/70 px-4 py-4 text-left hover:bg-muted/60',
                  isActive && 'border-primary/40 bg-primary/10 hover:bg-primary/10',
                )}
                onClick={() => onSelectBundled(dataset.id)}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="space-y-1">
                    <span className="block font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Example file
                    </span>
                    <span className="block break-words font-mono text-sm text-foreground">
                      {dataset.name}
                    </span>
                  </span>
                  <Badge variant={isActive ? 'default' : 'outline'}>
                    {isActive ? 'Active' : 'Open'}
                  </Badge>
                </span>
              </Button>
            )
          })}
        </section>
      </CardContent>
    </Card>
  )
}
