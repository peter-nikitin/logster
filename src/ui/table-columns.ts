import type { TableColumnId } from '@/ui/stores/layout-store'

export const tableColumnConfig: Array<{
  id: TableColumnId
  label: string
  minWidth: number
  defaultWidth: number
}> = [
  { id: 'time', label: 'Time', minWidth: 120, defaultWidth: 148 },
  { id: 'delta', label: 'Delta', minWidth: 96, defaultWidth: 116 },
  { id: 'method', label: 'Method', minWidth: 160, defaultWidth: 190 },
  { id: 'message', label: 'Message', minWidth: 240, defaultWidth: 420 },
  { id: 'payload', label: 'Payload', minWidth: 220, defaultWidth: 360 },
]
