import type * as React from 'react'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { presentLogRow } from '@/ui/presenters/present-log-row'
import { tableColumnConfig } from '@/ui/table-columns'
import { uiTestIds } from '@/ui/test-ids'
import { cn } from '@/lib/utils'
import { useLayoutStore, type TableColumnId } from '@/ui/stores/layout-store'

type DatasetTableProps = {
  rows: LogRow[]
  activeRowId: string | null
  markedRowIds: Set<string>
  onSelectRow: (rowId: string) => void
  onClearFilters: () => void
}

export function DatasetTable({
  rows,
  activeRowId,
  markedRowIds,
  onSelectRow,
  onClearFilters,
}: DatasetTableProps) {
  const columnWidths = useLayoutStore((state) => state.columnWidths)
  const setColumnWidth = useLayoutStore((state) => state.setColumnWidth)
  const totalTableWidth = tableColumnConfig.reduce(
    (total, column) => total + columnWidths[column.id],
    0,
  )

  function getColumnStyle(columnId: TableColumnId, minWidth: number) {
    return {
      width: columnWidths[columnId],
      minWidth,
      transition: 'width 200ms ease',
    } as const
  }

  function handleResizeStart(
    columnId: TableColumnId,
    minWidth: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()

    const startX = event.clientX
    const startWidth = columnWidths[columnId]

    function handlePointerMove(moveEvent: MouseEvent) {
      const delta = moveEvent.clientX - startX
      setColumnWidth(columnId, Math.max(minWidth, startWidth + delta))
    }

    function handlePointerUp() {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)
  }

  return (
    <div
      className="h-full min-h-0 overflow-auto"
      data-testid={uiTestIds.datasetTable}
    >
      <Table
        className="table-fixed"
        style={{
          width: totalTableWidth,
          minWidth: totalTableWidth,
        }}
      >
        <colgroup>
          {tableColumnConfig.map((column) => (
            <col
              key={column.id}
              style={getColumnStyle(column.id, column.minWidth)}
            />
          ))}
        </colgroup>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow className="hover:bg-transparent">
            {tableColumnConfig.map((column) => (
              <TableHead
                key={column.id}
                className="relative select-none"
                style={getColumnStyle(column.id, column.minWidth)}
              >
                <span>{column.label}</span>
                <button
                  type="button"
                  aria-label={`Resize ${column.label} column`}
                  data-testid={uiTestIds.tableColumnResizeHandle(column.id)}
                  className="absolute inset-y-0 right-0 w-2.5 cursor-col-resize rounded-full bg-transparent hover:bg-accent/40"
                  onMouseDown={(event) =>
                    handleResizeStart(column.id, column.minWidth, event)
                  }
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={tableColumnConfig.length} className="px-4 py-8">
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg px-4 py-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No rows match the current filter stack.
                  </p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Adjust the method action or text query to bring rows back into view.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
                    Clear filters
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : null}
          {rows.map((row) => {
            const presentedRow = presentLogRow(row)
            const isActive = row.id === activeRowId
            const isMarked = markedRowIds.has(row.id)

            return (
              <TableRow
                key={row.id}
                data-testid={uiTestIds.datasetRow}
                data-state={isActive ? 'selected' : undefined}
                className={cn(
                  'cursor-pointer',
                  isActive && 'bg-muted/70',
                  !isActive && isMarked && 'bg-amber-100/70',
                )}
                onClick={() => onSelectRow(row.id)}
              >
                <TableCell
                  className="font-mono text-[11px] leading-5 text-muted-foreground"
                  style={getColumnStyle('time', tableColumnConfig[0].minWidth)}
                >
                  {presentedRow.timeLabel}
                </TableCell>
                <TableCell
                  className="font-mono text-[11px] leading-5"
                  style={getColumnStyle('delta', tableColumnConfig[1].minWidth)}
                >
                  {presentedRow.deltaLabel}
                </TableCell>
                <TableCell
                  className="align-top"
                  style={getColumnStyle('method', tableColumnConfig[2].minWidth)}
                >
                  <span className="inline-flex rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] leading-5 text-secondary-foreground">
                    {presentedRow.method}
                  </span>
                </TableCell>
                <TableCell
                  className="align-top text-[12px] leading-5 text-foreground"
                  style={getColumnStyle('message', tableColumnConfig[3].minWidth)}
                >
                  <p className="line-clamp-2">{presentedRow.message}</p>
                </TableCell>
                <TableCell
                  className="align-top font-mono text-[11px] leading-5 text-muted-foreground"
                  style={getColumnStyle('payload', tableColumnConfig[4].minWidth)}
                >
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
