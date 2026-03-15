import type { LogDataset } from '@/domain/log-dataset/entities/log-dataset'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { presentLogRow } from '@/ui/presenters/present-log-row'
import { uiTestIds } from '@/ui/test-ids'
import { cn } from '@/lib/utils'

type DatasetTableProps = {
  dataset: LogDataset
  activeRowId: string | null
  onSelectRow: (rowId: string) => void
}

export function DatasetTable({
  dataset,
  activeRowId,
  onSelectRow,
}: DatasetTableProps) {
  return (
    <div className="overflow-hidden" data-testid={uiTestIds.datasetTable}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[7rem]">Time</TableHead>
            <TableHead className="min-w-[6rem]">Delta</TableHead>
            <TableHead className="min-w-[12rem]">Method</TableHead>
            <TableHead className="min-w-[18rem]">Message</TableHead>
            <TableHead className="min-w-[16rem]">Payload</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataset.rows.map((row) => {
            const presentedRow = presentLogRow(row)
            const isActive = row.id === activeRowId

            return (
              <TableRow
                key={row.id}
                data-testid={uiTestIds.datasetRow}
                data-state={isActive ? 'selected' : undefined}
                className={cn('cursor-pointer', isActive && 'bg-muted/70')}
                onClick={() => onSelectRow(row.id)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {presentedRow.timeLabel}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {presentedRow.deltaLabel}
                </TableCell>
                <TableCell className="align-top">
                  <span className="inline-flex rounded-md bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
                    {presentedRow.method}
                  </span>
                </TableCell>
                <TableCell className="max-w-[36ch] align-top text-sm text-foreground">
                  <p className="line-clamp-2">{presentedRow.message}</p>
                </TableCell>
                <TableCell className="max-w-[40ch] align-top font-mono text-xs text-muted-foreground">
                  <p className="line-clamp-2">{presentedRow.payloadPreview}</p>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
