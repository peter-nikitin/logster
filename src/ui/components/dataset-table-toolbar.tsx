import { Columns3Cog } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type DatasetTableToolbarProps = {
  rowCount: number
  onFitColumns: () => void
}

export function DatasetTableToolbar({
  rowCount,
  onFitColumns,
}: DatasetTableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Table
        </p>
        <div className="text-sm text-foreground">Visible rows</div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Badge variant="outline">{rowCount} rows</Badge>
        <Button type="button" variant="outline" size="sm" onClick={onFitColumns}>
          <Columns3Cog className="h-4 w-4" />
          <span>Fit table</span>
        </Button>
      </div>
    </div>
  )
}
