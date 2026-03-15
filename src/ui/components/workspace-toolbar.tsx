import { PanelLeftClose, PanelLeftOpen, Columns3Cog } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import { uiTestIds } from '@/ui/test-ids'
import type { DatasetOrigin } from '@/ui/stores/selection-store'

type WorkspaceToolbarProps = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: DatasetOrigin | null
  isSidebarOpen: boolean
  onFitColumns: () => void
  onToggleSidebar: () => void
}

export function WorkspaceToolbar({
  activeDataset,
  activeDatasetOrigin,
  isSidebarOpen,
  onFitColumns,
  onToggleSidebar,
}: WorkspaceToolbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid={uiTestIds.sidebarToggle}
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
          <span>{isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}</span>
        </Button>

        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Logster
          </p>
          <div className="truncate text-sm font-medium text-foreground">
            {activeDataset ? activeDataset.name : 'No active dataset'}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onFitColumns}>
          <Columns3Cog className="h-4 w-4" />
          <span>Fit table</span>
        </Button>
        {activeDatasetOrigin ? (
          <Badge variant={activeDatasetOrigin === 'uploaded' ? 'default' : 'secondary'}>
            {activeDatasetOrigin === 'uploaded' ? 'Uploaded' : 'Bundled'}
          </Badge>
        ) : null}
        {activeDataset ? (
          <Badge variant="outline">{activeDataset.rows.length} rows</Badge>
        ) : null}
      </div>
    </header>
  )
}
