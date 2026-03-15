import { PanelLeftOpen, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { uiTestIds } from '@/ui/test-ids'

type EmptyStateProps = {
  isRestoring: boolean
  isSidebarOpen: boolean
  onOpenSidebar: () => void
}

export function EmptyState({
  isRestoring,
  isSidebarOpen,
  onOpenSidebar,
}: EmptyStateProps) {
  const title = isRestoring ? 'Restoring your workspace' : 'Open a dataset to get started'
  const description = isRestoring
    ? 'Checking browser storage for previously saved uploads. You can still open a bundled example from the sidebar.'
    : 'Choose a bundled example or upload a JSON log file from the sidebar. The workspace will stay responsive even when a file cannot be imported.'

  return (
    <Card
      className=""
      data-testid={uiTestIds.emptyState}
    >
      <CardContent className="flex min-h-[340px] flex-col items-start justify-center gap-5 px-0 py-6 md:py-8">
        <Badge variant="secondary" className="gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          <Upload className="h-3.5 w-3.5" />
          Workspace empty
        </Badge>

        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isSidebarOpen ? (
            <Button type="button" variant="outline" onClick={onOpenSidebar}>
              <PanelLeftOpen className="h-4 w-4" />
              <span>Open sidebar</span>
            </Button>
          ) : null}
          <Badge variant="outline" className="px-2.5 py-1 text-xs text-muted-foreground">
            Bundled files and uploads live in the left panel
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
