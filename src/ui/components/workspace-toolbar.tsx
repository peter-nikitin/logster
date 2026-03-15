import { Columns3Cog, Filter, FolderOpen } from 'lucide-react'
import logsterLogo from '@/assets/logster.png'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import { uiTestIds } from '@/ui/test-ids'
import type { SidebarPanelId } from '@/ui/stores/layout-store'
import type { DatasetOrigin } from '@/ui/stores/selection-store'

type WorkspaceToolbarProps = {
  activeDataset: LogDataset | null
  activeDatasetOrigin: DatasetOrigin | null
  activeSidebarPanel: SidebarPanelId
  isSidebarOpen: boolean
  onFitColumns: () => void
  onOpenSidebarPanel: (panel: SidebarPanelId) => void
}

export function WorkspaceToolbar({
  activeDataset,
  activeDatasetOrigin,
  activeSidebarPanel,
  isSidebarOpen,
  onFitColumns,
  onOpenSidebarPanel,
}: WorkspaceToolbarProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 bg-background px-3 py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={isSidebarOpen && activeSidebarPanel === 'datasets' ? 'default' : 'outline'}
            size="sm"
            data-testid={uiTestIds.datasetsPanelToggle}
            onClick={() => onOpenSidebarPanel('datasets')}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Datasets</span>
          </Button>
          <Button
            type="button"
            variant={isSidebarOpen && activeSidebarPanel === 'filters' ? 'default' : 'outline'}
            size="sm"
            data-testid={uiTestIds.filtersPanelToggle}
            onClick={() => onOpenSidebarPanel('filters')}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <img
            src={logsterLogo}
            alt="Logster"
            className="h-7 w-7 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Logster
            </p>
            <div className="truncate text-sm text-foreground">
              {activeDataset ? activeDataset.name : 'No active dataset'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFitColumns}
          disabled={!activeDataset}
        >
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
