import { Filter, FolderOpen } from 'lucide-react'
import logsterLogo from '@/assets/logster.png'
import { Button } from '@/components/ui/button'
import { useWorkspace } from '@/ui/context/app-context'
import { uiTestIds } from '@/ui/test-ids'
import { useLayoutStore } from '@/ui/stores/layout-store'

export function Toolbar() {
  const { datasetState } = useWorkspace()
  const activeDataset = datasetState.activeDataset
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)
  const activeSidebarPanel = useLayoutStore((state) => state.activeSidebarPanel)
  const openSidebarPanel = useLayoutStore((state) => state.openSidebarPanel)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 bg-background px-3 py-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={
              isSidebarOpen && activeSidebarPanel === 'datasets' ? 'default' : 'outline'
            }
            size="sm"
            data-testid={uiTestIds.datasetsPanelToggle}
            onClick={() => openSidebarPanel('datasets')}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Datasets</span>
          </Button>
          <Button
            type="button"
            variant={
              isSidebarOpen && activeSidebarPanel === 'filters' ? 'default' : 'outline'
            }
            size="sm"
            data-testid={uiTestIds.filtersPanelToggle}
            onClick={() => openSidebarPanel('filters')}
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
    </header>
  )
}
