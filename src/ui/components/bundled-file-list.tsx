import type { BundledDatasetFile } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UploadedDatasetSummary } from '@/ui/hooks/use-active-dataset'
import { UploadDatasetButton } from '@/ui/components/upload-dataset-button'

type BundledFileListProps = {
  datasets: BundledDatasetFile[]
  activeDatasetOrigin: 'bundled' | 'uploaded' | null
  activeFileId: string | null
  isImporting: boolean
  uploadedDataset: UploadedDatasetSummary | null
  onImportFile: (file: File) => Promise<void>
  onSelect: (fileId: string) => void
  onSelectUploaded: () => void
}

export function BundledFileList({
  datasets,
  activeDatasetOrigin,
  activeFileId,
  isImporting,
  uploadedDataset,
  onImportFile,
  onSelect,
  onSelectUploaded,
}: BundledFileListProps) {
  return (
    <Card className="border-border/70 bg-card/95 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Bundled files</CardTitle>
            <CardDescription>Select an example dataset or upload your own JSON file.</CardDescription>
          </div>
          <Badge variant="secondary">{datasets.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <UploadDatasetButton
          isImporting={isImporting}
          onImportFile={onImportFile}
        />

        {uploadedDataset ? (
          <Button
            type="button"
            variant="ghost"
            className={cn(
              'h-auto w-full justify-start rounded-xl border border-border/70 px-4 py-4 text-left hover:bg-muted/60',
              activeDatasetOrigin === 'uploaded' && 'border-primary/40 bg-primary/10 hover:bg-primary/10',
            )}
            onClick={onSelectUploaded}
          >
            <span className="flex w-full items-start justify-between gap-3">
              <span className="space-y-1">
                <span className="block font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Uploaded file
                </span>
                <span className="block break-words font-mono text-sm text-foreground">
                  {uploadedDataset.name}
                </span>
              </span>
                <Badge variant={activeDatasetOrigin === 'uploaded' ? 'default' : 'outline'}>
                  {activeDatasetOrigin === 'uploaded' ? 'Active' : 'Open'}
                </Badge>
              </span>
            </Button>
        ) : null}

        {datasets.map((dataset) => {
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
              onClick={() => onSelect(dataset.id)}
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
      </CardContent>
    </Card>
  )
}
